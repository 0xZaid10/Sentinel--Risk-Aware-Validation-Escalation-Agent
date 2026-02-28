import os
import json
from nacl.signing import SigningKey, VerifyKey
from nacl.encoding import HexEncoder


class ArtifactSigner:
    """
    Handles deterministic artifact signing and verification.
    Uses Ed25519 via PyNaCl.
    """

    def __init__(self, private_key: str | None = None):

        # Load from environment if not explicitly passed
        if private_key is None:
            private_key = os.getenv("SENTINEL_PRIVATE_KEY")

        if not private_key:
            raise RuntimeError(
                "SENTINEL_PRIVATE_KEY not set or passed to ArtifactSigner"
            )

        # Initialize signing key from hex string
        self.signing_key = SigningKey(
            private_key,
            encoder=HexEncoder
        )

        # Store public key for reference / verification
        self.verify_key = self.signing_key.verify_key

    # ==========================================================
    # SIGN
    # ==========================================================

    def sign(self, artifact: dict) -> str:
        """
        Deterministically serialize artifact and return hex signature.
        """

        artifact_json = json.dumps(
            artifact,
            sort_keys=True,
            separators=(",", ":"),
        )

        artifact_bytes = artifact_json.encode("utf-8")

        signed = self.signing_key.sign(artifact_bytes)

        return signed.signature.hex()

    # ==========================================================
    # VERIFY
    # ==========================================================

    @staticmethod
    def verify(
        artifact: dict,
        signature_hex: str,
        public_key_hex: str
    ) -> bool:
        """
        Verify artifact signature using provided public key.
        """

        artifact_json = json.dumps(
            artifact,
            sort_keys=True,
            separators=(",", ":"),
        )

        artifact_bytes = artifact_json.encode("utf-8")

        verify_key = VerifyKey(
            public_key_hex,
            encoder=HexEncoder
        )

        try:
            verify_key.verify(
                artifact_bytes,
                bytes.fromhex(signature_hex)
            )
            return True
        except Exception:
            return False

    # ==========================================================
    # EXPORT PUBLIC KEY
    # ==========================================================

    def public_key_hex(self) -> str:
        """
        Returns public key as hex string.
        """
        return self.verify_key.encode(
            encoder=HexEncoder
        ).decode()