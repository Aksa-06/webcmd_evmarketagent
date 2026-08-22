from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import subprocess
import json

app = FastAPI(
    title="EV Market Intelligence Agent",
    description="AI-powered market intelligence for the Indian EV market",
    version="1.0.0",
)

# Allow the frontend on another laptop to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "project": "EV Market Intelligence Agent",
        "status": "running",
        "message": "Backend is working"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/market/overview")
def market_overview():
    return {
        "market": "Indian Electric Vehicle Market",
        "data": [],
        "sources": [],
        "last_updated": None,
        "message": "Market intelligence pipeline is being built"
    }


@app.get("/api/vehicles")
def vehicles():
    """
    Retrieve live EV vehicle information through the webcmd adapter.
    """

    try:
        webcmd_path = r"C:\Users\aksam\AppData\Roaming\npm\webcmd.cmd"

        result = subprocess.run(
            [
                "cmd.exe",
                "/c",
                webcmd_path,
                "evmarket",
                "vehicles",
                "-f",
                "json"
            ],
            capture_output=True,
            text=True,
            timeout=60,
            check=False
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "Live EV data source failed",
                    "error": result.stderr.strip()
                }
            )

        data = json.loads(result.stdout)

        return {
            "count": len(data),
            "vehicles": data,
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="EV data source timed out"
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="EV data source returned invalid JSON"
        )

    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="webcmd was not found on the backend machine"
        )


@app.get("/api/news")
def news():
    return {
        "articles": [],
        "count": 0,
        "message": "Live news source will be connected next"
    }


@app.get("/api/competitors")
def competitors():
    return {
        "competitors": [],
        "count": 0,
        "message": "Competitor intelligence will be connected next"
    }


@app.get("/api/insights")
def insights():
    return {
        "insights": [],
        "count": 0,
        "message": "AI analysis will be connected after live data collection"
    }