# agent/config/sessions.py

class SessionConfig:
    """
    Single source of truth for all session IDs.
    Change here → applies everywhere.
    """

    DELEGATE = 78
    COMPLETION = 78

    VALIDATION = {
        1: 78,  # optional
        3: 67,
        5: 79
    }

    @staticmethod
    def get_validation_session(redundancy: int) -> int:
        return SessionConfig.VALIDATION.get(redundancy, 67)