# SithKit

Hardware hacking toolkit. Currently supports detection of the **Faultier** fault injection device.

## Installation

```
pip install faultier
```

## Usage

```bash
# Run directly
python run.py

# Or as a module
python -m sithkit
```

### Example Output

```
SithKit - Hardware Hacking Toolkit

Faultier connected!

  Control port = COM5
  Serial path  = COM6
```

## Supported Devices

| Device | VID:PID | Notes |
|--------|---------|-------|
| Faultier | `2b3e:2343` | RP2040-based fault injection tool by stacksmashing |

## Programmatic Use

```python
from sithkit.detect import find_faultier

device = find_faultier()
if device:
    print(device["serial_path"])
```
