"""Power analysis capture using the Faultier ADC."""

import faultier as faultier_lib


def capture_trace(ft, sample_count: int = 5000) -> list:
    """Capture a power trace via the Faultier ADC on EXT1.

    Configures a rising-edge trigger on EXT0 (connect to target GPIO),
    then blocks until the trigger fires or the device times out.

    Args:
        ft: Connected faultier.Faultier() instance.
        sample_count: Number of ADC samples (max 30000).

    Returns:
        List of floats in [0.0, 1.0] representing the power trace.

    Raises:
        ValueError: Trigger timeout or device error.
    """
    sample_count = min(sample_count, 30000)
    ft.configure_adc(source=faultier_lib.ADC_EXT1, sample_count=sample_count)
    ft.configure_glitcher(
        trigger_type=faultier_lib.TRIGGER_RISING_EDGE,
        trigger_source=faultier_lib.TRIGGER_IN_EXT0,
        glitch_output=faultier_lib.OUT_NONE,
    )
    ft.glitch()
    return ft.read_adc()
