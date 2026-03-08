"""Entry point for python -m sithkit."""

from sithkit.detect import find_faultier, print_results


def main():
    print("SithKit - Hardware Hacking Toolkit\n")
    devices = find_faultier()
    print_results(devices)


if __name__ == "__main__":
    main()
