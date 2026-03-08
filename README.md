![SithKit](banner.png)

# SithKit

SithKit is a **single pane of glass** for hardware hacking. Rather than juggling a dozen terminal windows, scripts, and vendor tools, SithKit brings your hardware hacking toolkit into one place — device detection, control, and monitoring all in one place.

Built for practitioners who work with fault injection, side-channel analysis, debug probes, and other embedded hardware tooling. Plug in your devices, hit connect, and get to work.

## Current Support

| Device | Capability |
|--------|------------|
| Faultier | Detection, connection status, power analysis |

## Installation

```bash
pip install faultier fastapi uvicorn
```

## Usage

```bash
python run.py
```

Opens the SithKit dashboard in your browser at `http://127.0.0.1:8000`.

Hit **[ CONNECT ]** to connect to the Faultier. Once connected, use the **[ CAPTURE TRACE ]** button to capture a power trace and **[ EXPORT CSV ]** to export it for analysis.

## Power Analysis — Arduino Nano

SithKit can capture power traces from an Arduino Nano (or any 5V target) using the Faultier's ADC. This is useful for side-channel attacks (CPA, DPA) and for identifying the correct timing window for fault injection.

### Wiring

```
Faultier 20-pin header       Arduino Nano
──────────────────────────────────────────────
GND                      →   GND
5V                       →   [10Ω resistor] → VIN
EXT1                     →   Junction between resistor and Nano VIN
                              (ADC measurement — voltage across shunt)
EXT0                     →   D2 (trigger signal)
```

**Notes:**
- The 10Ω shunt resistor sits between Faultier 5V and Nano VIN. Voltage across it (≈ I × 10Ω) is what the Faultier ADC measures. Keep the resistor ≤ 22Ω so the ADC input stays within 3.3V at typical Nano current draw.
- EXT1 is the Faultier's ADC input — connect it to the Nano side of the shunt (between resistor and VIN), not directly to 5V.
- EXT0 is the trigger input — the Nano pulls D2 HIGH at the start of the target operation, which tells the Faultier when to begin capturing.

### Reference Target Sketch

`examples/nano_target.ino` is a minimal Arduino sketch that:
- Waits for any serial byte as a "go" command
- Pulls D2 HIGH to trigger the Faultier capture
- Runs a placeholder operation (replace with your CTF target)
- Pulls D2 LOW when done

Flash it to your Nano, then use SithKit's **[ CAPTURE TRACE ]** button. The captured trace can be exported as CSV and loaded into any SCA analysis tool (e.g., ChipWhisperer Analyzer, Python/NumPy).

## Programmatic Use

```python
from sithkit.detect import find_faultier

device = find_faultier()
if device:
    print(device["serial_path"])
```

## Roadmap

- Glitcher control panel (delay, pulse, trigger config)
- Multi-trace averaging and alignment
- Power cycle controls
- Additional device support
