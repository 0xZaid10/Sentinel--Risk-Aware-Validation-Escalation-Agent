# agent/agent/interpreter.py

from models import FinalVerdict, RiskLevel
from config.sessions import SessionConfig


class Interpreter:
    """
    Decides whether to ACCEPT, ESCALATE, or MANUAL_REVIEW
    based on risk level and composite confidence.
    """

    @staticmethod
    def required_threshold(risk_level: RiskLevel) -> float:
        if risk_level == RiskLevel.HIGH:
            return 0.85
        elif risk_level == RiskLevel.MEDIUM:
            return 0.65
        else:
            return 0.50

    @staticmethod
    def decide(
        risk_level: RiskLevel,
        composite_confidence: float,
        current_validation_session: int,
        has_escalated: bool,
    ) -> FinalVerdict:

        threshold = Interpreter.required_threshold(risk_level)

        # ✅ Accept if threshold satisfied
        if composite_confidence >= threshold:
            return FinalVerdict.ACCEPT

        # 🔁 Escalation Ladder
        # If currently at redundancy 1 → escalate to 3
        if current_validation_session == SessionConfig.VALIDATION[1]:
            return FinalVerdict.ESCALATE

        # If currently at redundancy 3 → escalate to 5
        if current_validation_session == SessionConfig.VALIDATION[3]:
            return FinalVerdict.ESCALATE

        # Already at redundancy 5 and still below threshold
        return FinalVerdict.MANUAL_REVIEW