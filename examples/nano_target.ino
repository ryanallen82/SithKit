/**
 * SithKit - Arduino Nano power analysis target
 *
 * Wiring to Faultier (20-pin header):
 * ─────────────────────────────────────────────────────
 *  Faultier          Arduino Nano
 *  ─────────────────────────────
 *  GND           →   GND
 *  5V            →   [10Ω resistor] → VIN / 5V rail
 *  EXT1          →   Junction between resistor and Nano VIN
 *                    (ADC measurement point — do NOT connect
 *                     directly to 5V; voltage must stay ≤ 3.3V
 *                     across the shunt, so keep resistor ≤ 22Ω)
 *  EXT0          →   D2  (trigger signal — rising edge)
 *
 * Usage:
 *   Send any character over Serial to trigger a capture cycle.
 *   The sketch pulls D2 HIGH before the operation and LOW after,
 *   giving the Faultier a clean trigger window to capture a trace.
 *
 * Baud rate: 115200
 */

#define TRIGGER_PIN 2

void setup() {
    Serial.begin(115200);
    pinMode(TRIGGER_PIN, OUTPUT);
    digitalWrite(TRIGGER_PIN, LOW);
    Serial.println("[SithKit] Nano target ready. Send any byte to trigger.");
}

void loop() {
    if (Serial.available()) {
        Serial.read();  // consume the byte

        // Signal start of operation — Faultier triggers on rising edge
        digitalWrite(TRIGGER_PIN, HIGH);

        // ── Target operation ──────────────────────────────────────────
        // Replace this with the actual operation you want to profile.
        // Examples: AES encrypt, password check, crypto primitive, etc.
        volatile uint32_t result = 0;
        for (int i = 0; i < 1000; i++) {
            result ^= (uint32_t)i * 0xDEADBEEF;
        }
        // ─────────────────────────────────────────────────────────────

        // Signal end of operation
        digitalWrite(TRIGGER_PIN, LOW);

        Serial.print("[SithKit] Done. result=0x");
        Serial.println(result, HEX);
    }
}
