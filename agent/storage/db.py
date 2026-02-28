import asyncpg
import os
import json
from typing import List, Dict


DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://sentinel:sentinelpass@localhost:5432/sentinel_db"
)


class Database:

    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(DB_URL)

    async def close(self):
        if self.pool:
            await self.pool.close()

    async def insert_decision(
        self,
        decision_id: str,
        schema_version: str,
        session_id: int,
        delegate_task_id: str,
        completion_task_id: str,
        composite_confidence: float,
        threshold_applied: float,
        final_verdict: str,
        escalation_path: List[int],
        artifact_hash: str,
        signature: str,
    ):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO decisions (
                    decision_id,
                    schema_version,
                    session_id,
                    delegate_task_id,
                    completion_task_id,
                    composite_confidence,
                    threshold_applied,
                    final_verdict,
                    escalation_path,
                    artifact_hash,
                    signature
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                """,
                decision_id,
                schema_version,
                session_id,
                delegate_task_id,
                completion_task_id,
                composite_confidence,
                threshold_applied,
                final_verdict,
                json.dumps(escalation_path),
                artifact_hash,
                signature,
            )

    async def insert_validator_runs(
        self,
        decision_id: str,
        runs: List[Dict],
    ):
        async with self.pool.acquire() as conn:
            for run in runs:
                await conn.execute(
                    """
                    INSERT INTO validator_runs (
                        decision_id,
                        redundancy_level,
                        miner_address,
                        valid,
                        confidence_score,
                        overall_score,
                        risk_level,
                        data_hash
                    )
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                    """,
                    decision_id,
                    run["redundancy_level"],
                    run["miner_address"],
                    run["valid"],
                    run["confidence_score"],
                    run["overall_score"],
                    run["risk_level"],
                    run["data_hash"],
                )