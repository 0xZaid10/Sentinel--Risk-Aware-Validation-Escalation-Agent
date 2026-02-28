# agent/agent/models.py

from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable, Awaitable


# ==========================================================
# ENUMS
# ==========================================================

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class FinalVerdict(str, Enum):
    ACCEPT = "ACCEPT"
    BLOCK = "BLOCK"
    ESCALATE = "ESCALATE"
    FAIL = "FAIL"
    MANUAL_REVIEW = "MANUAL_REVIEW"


# ==========================================================
# ENFORCEMENT OBJECT
# ==========================================================

@dataclass
class GuardDecision:
    """
    Returned by Firewall.evaluate().
    Can optionally enforce execution.
    """

    verdict: str
    confidence: float
    consensus_score: float
    reason: str
    escalation_path: List[int]
    evidence_bundle: Dict[str, Any]

    async def enforce(
        self,
        action_callable: Callable[[], Awaitable[Any]]
    ) -> Any:
        """
        Enforces the decision against a real action.
        If ACCEPT → executes the callable.
        Otherwise → raises PermissionError.
        """
        if self.verdict == FinalVerdict.ACCEPT:
            return await action_callable()

        raise PermissionError(
            f"Sentinel blocked execution. Verdict: {self.verdict}. "
            f"Reason: {self.reason}"
        )


# ==========================================================
# FULL AGENT RESPONSE (API / Audit)
# ==========================================================

@dataclass
class AgentResponse:
    """
    Structured output returned by Sentinel.
    Fully auditable and hackathon-ready.
    """

    output: str
    final_verdict: str
    confidence: float
    total_attempts: int
    escalation_path: List[int]
    total_latency_ms: float
    decision_reason: str
    consensus_score: Optional[float] = None
    risk_level: Optional[str] = None
    evidence_bundle: Optional[Dict[str, Any]] = field(default_factory=dict)