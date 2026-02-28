# agent/agent/risk.py

from typing import List
from .models import RiskAssessment, RiskLevel


RISK_SIGNALS = {
    "financial": 0.3,
    "legal": 0.4,
    "regulatory": 0.4,
    "irreversible": 0.3,
    "liability": 0.4,
    "investment": 0.3,
    "compliance": 0.4,
    "tokenomics": 0.3,
    "contract": 0.3,
    "governance": 0.3,
}


class RiskModel:

    @staticmethod
    def assess(objective: str) -> RiskAssessment:
        objective_lower = objective.lower()

        score = 0.0
        factors: List[str] = []

        for keyword, weight in RISK_SIGNALS.items():
            if keyword in objective_lower:
                score += weight
                factors.append(keyword)

        if score < 0.3:
            level = RiskLevel.LOW
        elif score < 0.7:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.HIGH

        return RiskAssessment(
            risk_level=level,
            risk_score=round(score, 3),
            risk_factors=factors
        )