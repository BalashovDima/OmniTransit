#ifndef CONFIG_EXAMPLE_H
#define CONFIG_EXAMPLE_H

// --- Serial Configuration ---

// IBIS Bus (Serial 2)
#define PIN_IBIS_TX 0
#define PIN_IBIS_RX -1

// Alfa Bus (Serial 1)
#define PIN_ALFA_TX 17
#define PIN_ALFA_RX -1

// Config for Alfa Binary Transmission
#define ALFA_BAUD_RATE 19200
#define ALFA_SERIAL_CONFIG SERIAL_8N1

#endif  // CONFIG_EXAMPLE_H
