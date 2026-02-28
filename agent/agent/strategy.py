# agent/agent/strategy.py

from config.sessions import SessionConfig


class ValidationStrategy:
    """
    Handles validation session selection and escalation.
    Completely driven by SessionConfig.
    """

    @staticmethod
    def initial_session_from_delegate(delegate_output: dict) -> int:
        """
        Reads delegate recommended redundancy
        and maps to session ID.
        """

        redundancy = delegate_output["cortensor_policy"]["redundancy"]
        return SessionConfig.get_validation_session(redundancy)

    @staticmethod
    def escalate(current_session: int) -> int:
        """
        Escalation ladder:
        1 → 3 → 5
        5 → stays 5
        """

        if current_session == SessionConfig.VALIDATION[1]:
            return SessionConfig.VALIDATION[3]

        if current_session == SessionConfig.VALIDATION[3]:
            return SessionConfig.VALIDATION[5]

        return current_session  # Already max