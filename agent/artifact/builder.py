import uuid
from datetime import datetime
from .schema import DecisionArtifactV1, canonical_hash, sha256_hex


class ArtifactBuilder:

    @staticmethod
    def build(
        session_id: int,
        delegate_task_id: str,
        completion_task_id: str,
        validation_task_ids: list,
        objective: str,
        output: str,
        composite_confidence: float,
        threshold: float,
        escalation_path: list,
        verdict: str,
        validator_runs: list,
    ):

        artifact = DecisionArtifactV1(
            decision_id=str(uuid.uuid4()),
            schema_version="sentinel.artifact.v1",
            session_id=session_id,
            delegate_task_id=delegate_task_id,
            completion_task_id=completion_task_id,
            validation_task_ids=validation_task_ids,
            objective_hash=sha256_hex(objective),
            output_hash=sha256_hex(output),
            composite_confidence=composite_confidence,
            threshold_applied=threshold,
            escalation_path=escalation_path,
            final_verdict=verdict,
            created_at_utc=datetime.utcnow().isoformat(),
            validator_summary=validator_runs,
        )

        artifact_dict = artifact.__dict__.copy()

        artifact_hash = canonical_hash(artifact_dict)

        return artifact_dict, artifact_hash