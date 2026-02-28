# agent/core/trust_math.py

from typing import List, Dict


class TrustMath:
    """
    Deterministic trust computation utilities.

    All calculations:
    - Ignore malformed validator entries
    - Are bounded between 0.0 and 1.0
    - Are numerically stable
    """

    # ==========================================================
    # 1️⃣ WEIGHTED AGREEMENT
    # ==========================================================

    @staticmethod
    def weighted_validator_agreement(
        validator_results: List[Dict]
    ) -> float:
        """
        Computes weighted agreement score.

        Each validator's confidence_score is treated as its weight.
        Agreement = (sum weight of valid validators) / (total weight)
        """

        total_weight = 0.0
        valid_weight = 0.0

        for result in validator_results:
            try:
                weight = float(result.get("confidence_score", 0.0))
                is_valid = bool(result.get("valid", False))
            except Exception:
                continue

            # Ignore zero or negative weights
            if weight <= 0:
                continue

            total_weight += weight

            if is_valid:
                valid_weight += weight

        if total_weight == 0:
            return 0.0

        agreement = valid_weight / total_weight
        return round(min(max(agreement, 0.0), 1.0), 3)

    # ==========================================================
    # 2️⃣ AVERAGE VALIDATOR CONFIDENCE
    # ==========================================================

    @staticmethod
    def average_validator_confidence(
        validator_results: List[Dict]
    ) -> float:
        """
        Simple arithmetic mean of validator confidence scores.
        """

        valid_scores = []

        for r in validator_results:
            try:
                score = float(r.get("confidence_score", 0.0))
            except Exception:
                continue

            if score > 0:
                valid_scores.append(score)

        if not valid_scores:
            return 0.0

        avg = sum(valid_scores) / len(valid_scores)
        return round(min(max(avg, 0.0), 1.0), 3)

    # ==========================================================
    # 3️⃣ COMPOSITE CONFIDENCE
    # ==========================================================

    @staticmethod
    def composite_confidence(
        agreement: float,
        avg_validator_confidence: float
    ) -> float:
        """
        Composite trust score.

        Weighting philosophy:
        - 60% structural agreement
        - 40% validator confidence strength
        """

        confidence = (
            0.6 * agreement +
            0.4 * avg_validator_confidence
        )

        return round(min(max(confidence, 0.0), 1.0), 3)

    # ==========================================================
    # 4️⃣ CONFIDENCE BAND
    # ==========================================================

    @staticmethod
    def confidence_band(confidence: float) -> str:
        """
        Returns categorical band for UI / logging.
        """

        if confidence >= 0.85:
            return "high"
        elif confidence >= 0.65:
            return "medium"
        elif confidence >= 0.50:
            return "low"
        else:
            return "unsafe"

    # ==========================================================
    # 5️⃣ SUFFICIENT_VALIDATORS CHECK
    # ==========================================================

    @staticmethod
    def sufficient_validator_responses(
        validator_results: List[Dict],
        minimum_required: int = 1
    ) -> bool:
        """
        Ensures minimum usable validator responses exist.

        Used to guard against:
        - All miners failing
        - Malformed validation responses
        """

        usable = 0

        for r in validator_results:
            if (
                isinstance(r, dict)
                and "confidence_score" in r
                and "valid" in r
            ):
                usable += 1

        return usable >= minimum_required