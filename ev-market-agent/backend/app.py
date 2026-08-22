from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import subprocess
import json
import threading


app = FastAPI(
    title="EV Market Intelligence Agent",
    description="AI-powered market intelligence for the Indian EV market",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


WEBCMD_PATH = r"C:\Users\aksam\AppData\Roaming\npm\webcmd.cmd"
WEBCMD_LOCK = threading.Lock()


def run_webcmd(command_name):
    """Run a webcmd command and return its JSON data."""

    with WEBCMD_LOCK:
        try:
            result = subprocess.run(
                [
                    "cmd.exe",
                    "/c",
                    WEBCMD_PATH,
                    "evmarket",
                    command_name,
                    "-f",
                    "json",
                ],
                capture_output=True,
                text=True,
                timeout=90,
                check=False,
            )

            if result.returncode != 0:
                raise HTTPException(
                    status_code=502,
                    detail={
                        "message": f"Live {command_name} data source failed",
                        "error": result.stderr.strip(),
                    },
                )

            try:
                return json.loads(result.stdout)

            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=502,
                    detail=f"{command_name} returned invalid JSON",
                )

        except subprocess.TimeoutExpired:
            raise HTTPException(
                status_code=504,
                detail=f"{command_name} data source timed out",
            )

        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail="webcmd was not found on the backend machine",
            )


@app.get("/")
def root():
    return {
        "project": "EV Market Intelligence Agent",
        "status": "running",
        "message": "Backend is working",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/market/overview")
def market_overview():

    tata_data = run_webcmd("vehicles")
    hyundai_data = run_webcmd("hyundai")

    vehicles = tata_data + hyundai_data

    prices = [
        vehicle["price"]
        for vehicle in vehicles
        if vehicle.get("price") is not None
    ]

    return {
        "market": "Indian Electric Vehicle Market",
        "vehicle_count": len(vehicles),
        "vehicles": vehicles,
        "price_range": {
            "lowest": min(prices) if prices else None,
            "highest": max(prices) if prices else None,
        },
        "sources": [
            "Tata Motors official website",
            "Hyundai India official website",
        ],
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/vehicles")
def vehicles():

    tata_data = run_webcmd("vehicles")

    hyundai_data = run_webcmd("hyundai")

    all_vehicles = tata_data + hyundai_data

    return {
        "count": len(all_vehicles),
        "vehicles": all_vehicles,
        "tata_count": len(tata_data),
        "hyundai_count": len(hyundai_data),
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/news")
def news():

    return {
        "articles": [],
        "count": 0,
        "message": "Live news source will be connected next",
    }


@app.get("/api/competitors")
def competitors():

    return {
        "competitors": [],
        "count": 0,
        "message": "Competitor intelligence will be connected next",
    }


@app.get("/api/insights")
def insights():

    # Collect live data.
    tata_data = run_webcmd("vehicles")
    hyundai_data = run_webcmd("hyundai")

    vehicles = list({
        (vehicle.get("manufacturer"), vehicle.get("vehicle")): vehicle
        for vehicle in tata_data + hyundai_data
    }.values())

    # Remove entries without a price.
    priced_vehicles = [
        vehicle
        for vehicle in vehicles
        if vehicle.get("price") is not None
    ]

    if len(priced_vehicles) < 2:
        return {
            "market": "Indian Electric Vehicle Market",
            "insights": [],
            "message": "Not enough priced vehicles for comparison",
        }

    # Lowest and highest priced EVs.
    lowest = min(
        priced_vehicles,
        key=lambda vehicle: vehicle["price"]
    )

    highest = max(
        priced_vehicles,
        key=lambda vehicle: vehicle["price"]
    )

    difference = highest["price"] - lowest["price"]

    difference_percent = round(
        (difference / highest["price"]) * 100,
        2
    )

    insights = [
        {
            "type": "price_comparison",
            "title": (
                f"{lowest['vehicle']} has the lower starting price"
            ),
            "finding": (
                f"{lowest['vehicle']} from {lowest['manufacturer']} "
                f"starts at ₹{lowest['price']:,}, while "
                f"{highest['vehicle']} from {highest['manufacturer']} "
                f"starts at ₹{highest['price']:,}."
            ),
            "price_difference": difference,
            "price_difference_percent": difference_percent,
        }
    ]

    return {
        "market": "Indian Electric Vehicle Market",
        "insights": insights,
        "vehicles_analyzed": len(priced_vehicles),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }