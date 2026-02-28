"""
Sentinel FastAPI Application
A REST API wrapper for the Sentinel trust firewall agent.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

# Import Sentinel components
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from router_client import RouterClient
from agent.firewall import Firewall
from agent.models import FinalVerdict

load_dotenv()

# ============================================================================
# FastAPI App Configuration
# ============================================================================

app = FastAPI(
    title="Sentinel API",
    description="Risk-Aware Validation & Escalation Agent - A Deterministic AI Trust Firewall",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================================================
# CORS Configuration
# ============================================================================

# Get allowed origins from environment or use defaults
allowed_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
]

# Add wildcard for development if DEBUG is True
if os.getenv("DEBUG", "False").lower() == "true":
    allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Request/Response Models
# ============================================================================

class EvaluateRequest(BaseModel):
    """Request model for evaluation endpoint"""
    objective: str = Field(
        ...,
        description="The governance decision or objective to validate",
        min_length=1,
        max_length=10000,
    )

    class Config:
        json_schema_extra = {
            "example": {
                "objective": "Approve $50,000 treasury allocation for new DeFi liquidity pool deployment"
            }
        }


class ValidatorRun(BaseModel):
    """Individual validator run details"""
    redundancy_level: int
    miner_address: str
    valid: bool
    confidence_score: float
    overall_score: int
    risk_level: str
    data_hash: str


class EvaluateResponse(BaseModel):
    """Response model for evaluation endpoint"""
    output: str = Field(description="The AI-generated output that was validated")
    final_verdict: str = Field(description="ACCEPT, FAIL, or MANUAL_REVIEW")
    confidence: float = Field(description="Composite confidence score (0.0-1.0)")
    total_attempts: int = Field(description="Number of validation attempts")
    escalation_path: List[int] = Field(description="Redundancy levels used (e.g., [3, 5])")
    total_latency_ms: float = Field(description="Total processing time in milliseconds")
    decision_reason: str = Field(description="Human-readable reason for the verdict")
    
    # Artifact details
    decision_id: Optional[str] = Field(None, description="Unique decision identifier")
    artifact_hash: Optional[str] = Field(None, description="SHA256 hash of the decision artifact")
    signature: Optional[str] = Field(None, description="Cryptographic signature")
    timestamp: Optional[str] = Field(None, description="Decision timestamp")
    
    # Validator details
    validator_runs: Optional[List[ValidatorRun]] = Field(None, description="Individual validator results")
    threshold: Optional[float] = Field(None, description="Threshold applied for this decision")

    class Config:
        json_schema_extra = {
            "example": {
                "output": "Treasury allocation approved with risk mitigation controls...",
                "final_verdict": "ACCEPT",
                "confidence": 0.873,
                "total_attempts": 2,
                "escalation_path": [3, 5],
                "total_latency_ms": 2400.5,
                "decision_reason": "Confidence 0.873 ≥ threshold 0.85",
                "decision_id": "dec_a7f3c2d8e1b4",
                "artifact_hash": "sha256:a7f3c2d8e1b4f5a6c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
                "signature": "0x742d3f1a8b3c5e2d1f9a7c4b",
                "validator_runs": []
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    cortensor_configured: bool
    database_configured: bool


# ============================================================================
# Initialize Sentinel Agent
# ============================================================================

def get_firewall() -> Firewall:
    """Initialize Firewall with RouterClient"""
    try:
        router_client = RouterClient()
        return Firewall(router_client)
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize Sentinel: {str(e)}. Please check CORTENSOR_ROUTER_URL and CORTENSOR_API_KEY environment variables."
        )


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["General"])
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Sentinel API",
        "description": "Risk-Aware Validation & Escalation Agent",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "evaluate": "POST /api/evaluate"
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Health check endpoint"""
    cortensor_url = os.getenv("CORTENSOR_ROUTER_URL")
    cortensor_key = os.getenv("CORTENSOR_API_KEY")
    db_url = os.getenv("DATABASE_URL")
    
    return {
        "status": "healthy",
        "version": "1.0.0",
        "cortensor_configured": bool(cortensor_url and cortensor_key),
        "database_configured": bool(db_url),
    }


@app.post("/api/test", tags=["Testing"])
async def test_endpoint(request: EvaluateRequest):
    """
    Test endpoint that returns immediately without calling Cortensor.
    Use this to verify the API is working before running full evaluations.
    """
    return {
        "status": "test_success",
        "message": "API is working! Your objective was received.",
        "objective": request.objective,
        "note": "This is a test endpoint. Use POST /api/evaluate for real validation."
    }


@app.post("/api/evaluate", response_model=EvaluateResponse, tags=["Evaluation"])
async def evaluate_objective(request: EvaluateRequest):
    """
    Evaluate a governance decision through Sentinel's trust firewall.
    
    This endpoint:
    1. Delegates task to Cortensor for risk assessment
    2. Generates AI completion via Cortensor
    3. Validates output through escalating redundancy tiers
    4. Computes composite trust score
    5. Returns verdict with full audit trail
    
    The response includes:
    - Final verdict (ACCEPT/FAIL/MANUAL_REVIEW)
    - Composite confidence score
    - Escalation path taken
    - Individual validator results
    - Cryptographic artifact
    """
    
    # Initialize Firewall
    firewall = get_firewall()
    
    try:
        # Call the main Firewall.evaluate() method
        response = await firewall.evaluate(objective=request.objective)
        
        # The regular Firewall returns AgentResponse with basic fields
        # We don't have artifact details, validator_runs, etc.
        
        return EvaluateResponse(
            output=response.output,
            final_verdict=response.final_verdict.value if isinstance(response.final_verdict, FinalVerdict) else response.final_verdict,
            confidence=response.confidence,
            total_attempts=response.total_attempts,
            escalation_path=response.escalation_path,
            total_latency_ms=response.total_latency_ms,
            decision_reason=response.decision_reason,
            # These fields won't be available from regular Firewall
            decision_id=None,
            artifact_hash=None,
            signature=None,
            timestamp=None,
            validator_runs=None,
            threshold=None,
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid request: {str(e)}"
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sentinel execution error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@app.get("/api/decisions/{decision_id}", tags=["Decisions"])
async def get_decision(decision_id: str):
    """
    Retrieve a specific decision artifact by ID.
    
    This endpoint queries the database for a stored decision.
    Useful for audit trails and verification.
    """
    try:
        from storage.db import Database
        
        db = Database()
        await db.connect()
        
        decision = await db.get_decision(decision_id)
        
        await db.close()
        
        if not decision:
            raise HTTPException(
                status_code=404,
                detail=f"Decision {decision_id} not found"
            )
        
        return decision
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@app.get("/api/decisions", tags=["Decisions"])
async def list_decisions(limit: int = 10):
    """
    List recent decisions.
    
    Query parameters:
    - limit: Maximum number of decisions to return (default: 10, max: 100)
    
    Returns decisions ordered by creation time, most recent first.
    """
    if limit > 100:
        raise HTTPException(
            status_code=400,
            detail="Limit cannot exceed 100"
        )
    
    try:
        from storage.db import Database
        
        db = Database()
        await db.connect()
        
        decisions = await db.list_recent_decisions(limit=limit)
        
        await db.close()
        
        return {
            "count": len(decisions),
            "decisions": decisions
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


# ============================================================================
# Startup/Shutdown Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Runs on application startup"""
    print("🛡️  Sentinel API starting...")
    print(f"📡 Cortensor URL: {os.getenv('CORTENSOR_ROUTER_URL', 'NOT CONFIGURED')}")
    print(f"💾 Database: {'CONFIGURED' if os.getenv('DATABASE_URL') else 'NOT CONFIGURED'}")
    print("✅ Sentinel API ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Runs on application shutdown"""
    print("🛡️  Sentinel API shutting down...")


# ============================================================================
# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
