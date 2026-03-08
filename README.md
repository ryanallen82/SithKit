# SithKit

Hardware hacking toolkit. Currently supports detection of the **Faultier** fault injection device.

## Installation

```
pip install pyusb libusb-package
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

Found 1 Faultier device(s):

  [1] Faultier (current firmware)
      VID:PID      = 37de:fffd
      Bus:Address  = 1:5
      Manufacturer = stacksmashing
      Product      = Faultier
      Serial       = DF6050788B362E32
```

## Supported Devices

| Device | VID:PID | Notes |
|--------|---------|-------|
| Faultier (current firmware) | `37de:fffd` | RP2040-based fault injection tool |
| Faultier (legacy firmware) | `2b3e:2343` | Older firmware versions |

## Windows Driver Note

On Windows, you may need to use [Zadig](https://zadig.akeo.ie/) to assign the **WinUSB** driver to the Faultier's USB interface before it can be detected.

## Programmatic Use

```python
from sithkit.detect import find_faultier

devices = find_faultier()
for dev in devices:
    print(dev["serial_number"])
```
