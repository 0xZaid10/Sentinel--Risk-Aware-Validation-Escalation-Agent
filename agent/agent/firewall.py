import time
from typing import List

from config.sessions import SessionConfig
from core.trust_math import TrustMath
from agent.models import AgentResponse, FinalVerdict

from artifact.builder import ArtifactBuilder
from artifact.signing import ArtifactSigner
from storage.db import Database

import os
import uuid


class Firewall:

    def __init__(self, router_client):
        self.router = router_client

    async def evaluate(self, objective: str) -> AgentResponse:

        escalation_path: List[int] = []
        start_time = time.time()

        # ==================================================
        # 1️⃣ DELEGATE FIRST (MANDATORY)
        # ==================================================

        delegate_response = await self.router.delegate(
            session_id=SessionConfig.DELEGATE,
            objective="Evaluate risk and plan execution strategy.",
            input_data=objective,
        )

        if not delegate_response:
            raise RuntimeError("Delegate returned empty response.")

        delegate_task_id = delegate_response.get(
            "task_id", str(uuid.uuid4())
        )

        recommended_redundancy = (
            delegate_response
            .get("cortensor_policy", {})
            .get("redundancy", 1)
        )

        # ==================================================
        # 2️⃣ COMPLETION
        # ==================================================

        completion_response = await self.router.completion(
            session_id=SessionConfig.COMPLETION,
            prompt=objective,
        )

        completion_task_id = completion_response.get(
            "task_id", str(uuid.uuid4())
        )

        completion_output = self._extract_completion_output(
            completion_response
        )

        if not completion_output:
            raise RuntimeError("Completion returned empty output.")

        # ==================================================
        # 3️⃣ UPDATED ESCALATION BLOCK
        # ==================================================

        if recommended_redundancy == 5:
            threshold = 0.85
            escalation_plan = [3, 5]

        elif recommended_redundancy == 3:
            threshold = 0.65
            escalation_plan = [3, 5]

        else:
            threshold = 0.50
            escalation_plan = [1, 3, 5]

        final_confidence = 0.0
        decision_reason = ""
        final_verdict = FinalVerdict.FAIL

        validation_task_ids = []
        all_validator_runs = []

        # ------------------------------------------------------
        # Run Escalation Ladder
        # ------------------------------------------------------

        for level in escalation_plan:

            escalation_path.append(level)

            session_id = SessionConfig.get_validation_session(level)

            validation_response = await self.router.validate(
                session_id=session_id,
                objective=objective,
                output=completion_output,
            )

            validation_task_ids.append(
                validation_response.get(
                    "task_id", str(uuid.uuid4())
                )
            )

            validator_results = self._extract_validator_results(
                validation_response
            )

            structured_runs = []

            for result in validator_results:
                structured_runs.append(
                    {
                        "redundancy_level": level,
                        "miner_address": result.get("miner", "unknown"),
                        "valid": result.get(
                            "binary_classification", {}
                        ).get("valid", True),
                        "confidence_score": result.get(
                            "binary_classification", {}
                        ).get("confidence_score", 0.0),
                        "overall_score": result.get(
                            "overall_assessment", {}
                        ).get("overall_score", 0),
                        "risk_level": result.get(
                            "overall_assessment", {}
                        ).get("risk_level", "unknown"),
                        "data_hash": result.get(
                            "data_hash", "unknown"
                        ),
                    }
                )

            all_validator_runs.extend(structured_runs)

            agreement = TrustMath.weighted_validator_agreement(
                validator_results
            )

            avg_conf = TrustMath.average_validator_confidence(
                validator_results
            )

            composite = TrustMath.composite_confidence(
                agreement,
                avg_conf,
            )

            final_confidence = composite

            if composite >= threshold:
                decision_reason = (
                    f"Confidence {composite} ≥ threshold {threshold}"
                )
                final_verdict = FinalVerdict.ACCEPT
                break

        else:
            if recommended_redundancy == 5:
                final_verdict = FinalVerdict.MANUAL_REVIEW
                decision_reason = (
                    "Oracle-grade threshold not satisfied."
                )

            elif recommended_redundancy == 3:
                final_verdict = FinalVerdict.MANUAL_REVIEW
                decision_reason = (
                    "Balanced-tier threshold not satisfied."
                )

            else:
                final_verdict = FinalVerdict.FAIL
                decision_reason = (
                    "Low-tier validation failed all levels."
                )

        # ==================================================
        # 4️⃣ BUILD ARTIFACT
        # ==================================================

        artifact_dict, artifact_hash = ArtifactBuilder.build(
            session_id=SessionConfig.DELEGATE,
            delegate_task_id=delegate_task_id,
            completion_task_id=completion_task_id,
            validation_task_ids=validation_task_ids,
            objective=objective,
            output=completion_output,
            composite_confidence=final_confidence,
            threshold=threshold,
            escalation_path=escalation_path,
            verdict=final_verdict.value,
            validator_runs=all_validator_runs,
        )

        signer = ArtifactSigner(
            os.getenv("SENTINEL_PRIVATE_KEY")
        )

        signature = signer.sign(artifact_dict)

        # ==================================================
        # 5️⃣ PERSIST TO DB
        # ==================================================

        db = Database()
        await db.connect()

        await db.insert_decision(
            decision_id=artifact_dict["decision_id"],
            schema_version=artifact_dict["schema_version"],
            session_id=SessionConfig.DELEGATE,
            delegate_task_id=delegate_task_id,
            completion_task_id=completion_task_id,
            composite_confidence=final_confidence,
            threshold_applied=threshold,
            final_verdict=final_verdict.value,
            escalation_path=escalation_path,
            artifact_hash=artifact_hash,
            signature=signature,
        )

        await db.insert_validator_runs(
            artifact_dict["decision_id"],
            all_validator_runs,
        )

        await db.close()

        total_latency = (time.time() - start_time) * 1000

        return AgentResponse(
            output=completion_output,
            final_verdict=final_verdict,
            confidence=final_confidence,
            total_attempts=len(escalation_path),
            escalation_path=escalation_path,
            total_latency_ms=round(total_latency, 2),
            decision_reason=decision_reason,
        )

    # ==================================================
    # Helpers
    # ==================================================

    def _extract_completion_output(self, response: dict) -> str:

        if "output" in response:
            return response["output"]

        if "choices" in response:
            return response["choices"][0].get("text", "")

        if "data" in response:
            return response["data"]

        return ""

    def _extract_validator_results(self, response: dict):

        if isinstance(response, list):
            return response

        if "results" in response:
            return response["results"]

        return [response]