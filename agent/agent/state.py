# agent/agent/state.py

import time
import uuid
from typing import Any, List


class AgentState:
    """
    Per-task runtime state.
    No shared mutable state.
    Fully isolated per handle_task call.
    """

    def __init__(self):
        self.trace_id: str = str(uuid.uuid4())
        self.start_time: float = time.time()

        self.validation_attempts: int = 0
        self.escalated: bool = False

        self.delegate_data: Any = None
        self.completion_data: Any = None
        self.validation_history: List[Any] = []

    @classmethod
    def new(cls):
        return cls()

    def record_delegate(self, result: Any):
        self.delegate_data = result

    def record_completion(self, result: Any):
        self.completion_data = result

    def record_validation(self, result: Any):
        self.validation_history.append(result)
        self.validation_attempts += 1

    def mark_escalated(self):
        self.escalated = True

    @property
    def total_latency(self) -> float:
        return (time.time() - self.start_time) * 1000.0