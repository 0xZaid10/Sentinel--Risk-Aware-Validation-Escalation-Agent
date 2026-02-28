# agent/router_client.py

import os
import httpx
from typing import Any, Dict, Optional
from dotenv import load_dotenv


load_dotenv()


class RouterClient:
    """
    Thin async client for Cortensor Router.
    Loads URL and API key from environment if not provided.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.base_url = (base_url or os.getenv("CORTENSOR_ROUTER_URL", "")).rstrip("/")
        self.api_key = api_key or os.getenv("CORTENSOR_API_KEY", "")

        if not self.base_url:
            raise ValueError("CORTENSOR_ROUTER_URL not configured.")

        if not self.api_key:
            raise ValueError("CORTENSOR_API_KEY not configured.")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    # ======================================================
    # DELEGATE
    # ======================================================

    async def delegate(
        self,
        session_id: int,
        objective: str,
        input_data: Any,
    ) -> Dict:

        payload = {
            "session_id": session_id,
            "request_id": "sentinel-delegate",
            "objective": objective,
            "input": {
                "kind": "text",
                "payload": input_data,
            },
            "execution": {
                "mode": "completion",
                "model": "auto",
            },
            "policy": {
                "tier": "balanced",
                "redundancy": 1,
                "timeout_ms": 420000,
                "precommit_timeout": 300,
            },
        }

        async with httpx.AsyncClient(timeout=600) as client:
            response = await client.post(
                f"{self.base_url}/api/v2/delegate",
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    # ======================================================
    # COMPLETION
    # ======================================================

    async def completion(
        self,
        session_id: int,
        prompt: str,
    ) -> Dict:

        payload = {
            "prompt": prompt,
            "max_tokens": 1024,
            "prompt_type": 0,
            "prompt_template": "",
            "stream": False,
            "timeout": 420,
            "precommit_timeout": 300,
            "client_reference": "sentinel-completion",
            "temperature": 0.1,
            "top_p": 0.95,
            "top_k": 40,
            "presence_penalty": 0,
            "frequency_penalty": 0,
        }

        async with httpx.AsyncClient(timeout=600) as client:
            response = await client.post(
                f"{self.base_url}/api/v2/completions/{session_id}",
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    # ======================================================
    # VALIDATE
    # ======================================================

    async def validate(
        self,
        session_id: int,
        objective: str,
        output: str,
    ) -> Dict:

        payload = {
            "session_id": session_id,
            "request_id": "sentinel-validate",
            "claim": {
                "type": "analysis",
                "description": objective,
                "output": output,
            },
            "policy": {
                "tier": "balanced",
                "redundancy": 1,  # actual redundancy determined by session
                "rules": ["must-align-with-user-instruction"],
                "timeout_ms": 420000,
                "precommit_timeout": 300,
            },
        }

        async with httpx.AsyncClient(timeout=600) as client:
            response = await client.post(
                f"{self.base_url}/api/v2/validate",
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()