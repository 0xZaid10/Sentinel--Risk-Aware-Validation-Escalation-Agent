# agent/agent/planner.py

from .models import Plan, RiskAssessment, RiskLevel


class Planner:

    @staticmethod
    def generate_plan(risk: RiskAssessment) -> Plan:

        if risk.risk_level == RiskLevel.LOW:
            return Plan(
                policy_tier="balanced",
                redundancy=1,
                validate=False,
                confidence_threshold=0.70,
                max_retries=3,
                escalation_strategy="adaptive"
            )

        elif risk.risk_level == RiskLevel.MEDIUM:
            return Plan(
                policy_tier="balanced",
                redundancy=3,
                validate=True,
                confidence_threshold=0.80,
                max_retries=3,
                escalation_strategy="adaptive"
            )

        else:  # HIGH
            return Plan(
                policy_tier="oracle",
                redundancy=3,
                validate=True,
                confidence_threshold=0.90,
                max_retries=3,
                escalation_strategy="adaptive"
            )