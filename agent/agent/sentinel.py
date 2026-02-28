# agent/agent/sentinel.py

from typing import Any

from config.sessions import SessionConfig
from core.trust_math import TrustMath
from strategy import ValidationStrategy
from interpreter import Interpreter
from models import (
    AgentResponse,
    RiskLevel,
    FinalVerdict,
)
from state import AgentState


class ReliabilitySentinelAgent:

    def __init__(self, engine):
        self.engine = engine

    async def handle_task(
        self,
        objective: str,
        input_data: Any,
    ) -> AgentResponse:

        state = AgentState.new()

        # 1️⃣ Delegate (always session 66)
        delegate_result = await self.engine.delegate.v2(
            session_id=SessionConfig.DELEGATE,
            objective=objective,
            input_data=input_data,
        )

        redundancy = delegate_result["cortensor_policy"]["redundancy"]
        risk_level = RiskLevel(delegate_result["risk_assessment"]["risk_level"])

        state.record_delegate(delegate_result)

        # 2️⃣ Completion (always session 66)
        completion_result = await self.engine.completions.v2(
            session_id=SessionConfig.COMPLETION,
            prompt=input_data,
        )

        output_text = completion_result["output"]
        state.record_completion(completion_result)

        # 3️⃣ Validation (based on delegate)
        validation_session = ValidationStrategy.initial_session_from_delegate(
            delegate_result
        )

        verdict = None
        composite_confidence = 0.0
        escalation_path = []

        while True:

            validation_result = await self.engine.validate.v2(
                session_id=validation_session,
                claim={
                    "type": "analysis",
                    "description": objective,
                    "output": output_text,
                },
            )

            state.record_validation(validation_result)

            validator_results = [
                {
                    "valid": r["binary_classification"]["valid"],
                    "confidence_score": r["binary_classification"]["confidence_score"],
                }
                for r in validation_result["results"]
            ]

            agreement = TrustMath.weighted_validator_agreement(validator_results)
            avg_conf = TrustMath.average_validator_confidence(validator_results)
            composite_confidence = TrustMath.composite_confidence(
                agreement,
                avg_conf,
            )

            verdict = Interpreter.decide(
                risk_level=risk_level,
                composite_confidence=composite_confidence,
                current_validation_session=validation_session,
                has_escalated=state.escalated,
            )

            escalation_path.append(validation_session)

            if verdict == FinalVerdict.ACCEPT:
                break

            if verdict == FinalVerdict.FAIL:
                break

            # ESCALATE
            next_session = ValidationStrategy.escalate(validation_session)

            if next_session == validation_session:
                verdict = FinalVerdict.FAIL
                break

            state.mark_escalated()
            validation_session = next_session

        return AgentResponse(
            output=output_text,
            final_verdict=verdict.value,
            confidence=composite_confidence,
            total_attempts=state.validation_attempts,
            escalation_path=escalation_path,
            total_latency_ms=state.total_latency,
            decision_reason=verdict.value,
        )