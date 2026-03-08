"""FastAPI server for SithKit."""

import asyncio
from pathlib import Path

import faultier as faultier_lib
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from sithkit.power_analysis import capture_trace

BASE_DIR = Path(__file__).parent
app = FastAPI(title="SithKit")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

# Persistent device connection
_ft = None


class CaptureRequest(BaseModel):
    sample_count: int = 5000


@app.get("/", response_class=HTMLResponse)
async def index():
    return (BASE_DIR / "templates" / "index.html").read_text()


@app.get("/api/status")
async def status():
    if _ft and _ft.device.is_open:
        return {
            "connected": True,
            "control_port": _ft.device.port,
            "serial_path": _ft.get_serial_path(),
        }
    return {"connected": False}


@app.post("/api/connect")
async def connect():
    global _ft
    try:
        _ft = faultier_lib.Faultier()
        return {
            "connected": True,
            "control_port": _ft.device.port,
            "serial_path": _ft.get_serial_path(),
        }
    except Exception as e:
        _ft = None
        return {"connected": False, "error": str(e)}


@app.post("/api/disconnect")
async def disconnect():
    global _ft
    if _ft:
        try:
            _ft.device.close()
        except Exception:
            pass
        _ft = None
    return {"connected": False}


@app.post("/api/power-analysis/capture")
async def power_analysis_capture(req: CaptureRequest):
    if not _ft or not _ft.device.is_open:
        return {"error": "Not connected to Faultier."}
    try:
        samples = await asyncio.to_thread(capture_trace, _ft, req.sample_count)
        return {"samples": samples, "count": len(samples)}
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"Capture failed: {e}"}
