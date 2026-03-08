"""FastAPI server for SithKit web UI."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from sithkit.detect import find_faultier

BASE_DIR = Path(__file__).parent
app = FastAPI(title="SithKit")

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def index():
    return (BASE_DIR / "templates" / "index.html").read_text()


@app.get("/api/status")
async def status():
    device = find_faultier()
    if device:
        return {
            "connected": True,
            "control_port": device["control_port"],
            "serial_path": device["serial_path"],
        }
    return {"connected": False}
