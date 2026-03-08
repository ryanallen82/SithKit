"""Faultier USB device detection."""

import libusb_package
from usb import core

FAULTIER_DEVICES = [
    {"vid": 0x37DE, "pid": 0xFFFD, "label": "Faultier (current firmware)"},
    {"vid": 0x2B3E, "pid": 0x2343, "label": "Faultier (legacy firmware)"},
]


def find_faultier():
    """Scan USB for connected Faultier devices.

    Returns a list of dicts with device info (bus, address, serial_number,
    manufacturer, product, vid, pid, label).
    """
    results = []

    try:
        for entry in FAULTIER_DEVICES:
            devices = libusb_package.find(
                find_all=True,
                idVendor=entry["vid"],
                idProduct=entry["pid"],
            )
            for dev in devices:
                info = {
                    "bus": dev.bus,
                    "address": dev.address,
                    "vid": entry["vid"],
                    "pid": entry["pid"],
                    "label": entry["label"],
                    "serial_number": None,
                    "manufacturer": None,
                    "product": None,
                }
                try:
                    info["serial_number"] = dev.serial_number
                    info["manufacturer"] = dev.manufacturer
                    info["product"] = dev.product
                except (core.USBError, ValueError, UnicodeDecodeError):
                    pass  # descriptor read can fail on Windows without WinUSB driver
                results.append(info)
    except core.NoBackendError:
        print("ERROR: No libusb backend found.")
        print("Install libusb or ensure libusb-package is installed:")
        print("  pip install libusb-package")

    return results


def print_results(devices):
    """Print Faultier detection results to the console."""
    if devices:
        print(f"Found {len(devices)} Faultier device(s):\n")
        for i, dev in enumerate(devices, 1):
            print(f"  [{i}] {dev['label']}")
            print(f"      VID:PID      = {dev['vid']:04x}:{dev['pid']:04x}")
            print(f"      Bus:Address  = {dev['bus']}:{dev['address']}")
            print(f"      Manufacturer = {dev['manufacturer'] or 'N/A'}")
            print(f"      Product      = {dev['product'] or 'N/A'}")
            print(f"      Serial       = {dev['serial_number'] or 'N/A'}")
            print()
    else:
        print("No Faultier devices found.\n")
        print("Troubleshooting:")
        print("  - Is the Faultier plugged in?")
        print("  - On Windows, use Zadig to assign the WinUSB driver")
        print("    to the Faultier's USB interface.")
        print("  - Ensure pyusb and libusb-package are installed:")
        print("    pip install pyusb libusb-package")
