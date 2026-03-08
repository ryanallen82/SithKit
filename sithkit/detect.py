"""Faultier device detection using the faultier library."""

import faultier


def find_faultier():
    """Detect and connect to a Faultier device.

    Returns a dict with device info (serial_path, control_port) or None
    if no device is found.
    """
    try:
        ft = faultier.Faultier()
        serial_path = ft.get_serial_path()
        return {
            "control_port": ft.device.port,
            "serial_path": serial_path,
        }
    except Exception:
        return None


def print_results(device):
    """Print Faultier detection results to the console."""
    if device:
        print("Faultier connected!\n")
        print(f"  Control port = {device['control_port']}")
        print(f"  Serial path  = {device['serial_path']}")
        print()
    else:
        print("No Faultier devices found.\n")
        print("Troubleshooting:")
        print("  - Is the Faultier plugged in?")
        print("  - On Windows, check Device Manager for the Faultier's COM ports.")
        print("  - Ensure the faultier library is installed: pip install faultier")
