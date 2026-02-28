from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime
import hashlib
import json
import uuid


@dataclass
class DecisionArtifactV1:
    decision_id: str
    schema_version: str

    session_id: int
    delegate_task_id: str
    completion_task_id: str
    validation_task_ids: List[str]

    objective_hash: str
    output_hash: str

    composite_confidence: float
    threshold_applied: float
    escalation_path: List[int]
    final_verdict: str

    created_at_utc: str

    validator_summary: List[Dict]


def sha256_hex(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()


def canonical_hash(obj: dict) -> str:
    canonical = json.dumps(obj, sort_keys=True)
    return sha256_hex(canonical)