#include "ibis_protocol.h"
#include <math.h>

IbisProtocol::IbisProtocol(HardwareSerial &serial) : _serial(serial) {}

void IbisProtocol::begin() {
  // IBIS standard: 1200 baud, 7 data bits, Even parity, 2 stop bits
  _serial.begin(1200, SERIAL_7E2);
  // Wait for serial to be ready (blocking for a moment, usually fast on ESP32)
  unsigned long start = millis();
  while (!_serial && (millis() - start < 1000))
    ;
}

void IbisProtocol::setLine(uint16_t line) {
  sendTelegram("l" + padNumber(line, 3));
}

void IbisProtocol::setDestination(uint16_t dest) {
  sendTelegram("z" + padNumber(dest, 3));
}

void IbisProtocol::setCycle(uint8_t cycle) {
  sendTelegram("xC" + String(cycle));
}

void IbisProtocol::setTime(String hhmm) {
  sendTelegram("u" + hhmm);
}

void IbisProtocol::setText(String text) {
  sendTelegram("v" + text);
}

void IbisProtocol::setComplexText(String text) {
  // Original implementation: "zM " + text
  // The previous implementation calculated parity with 0x65 manually,
  // but sendTelegram handles the generic case correctly if we just pass the
  // full string. "zM " + text. Parity of "zM " is 0x7A ^ 0x4D ^ 0x20 = 0x17.
  // 0x72 (default base) ^ 0x17 = 0x65.
  // So using generic sendTelegram with "zM " + text is mathematically
  // equivalent to starting with 0x65 and adding text.
  sendTelegram("zM " + text);
}

void IbisProtocol::setSymbol(String number) {
  sendTelegram("lE0" + number);
}

void IbisProtocol::setDS021t(String address, String text) {
  String telegram;
  // Calculate number of blocks (16 chars per block)
  byte numBlocks = ceil(text.length() / 16.0);

  telegram = "aA";
  telegram += address;
  telegram += vdvHex(numBlocks);
  telegram += "A0";  // Attribute?

  // Formatting: ensure double newlines if newline exists, or append double
  // newline? Following original logic:
  if (text.indexOf('\n') > 0) {
    text += "\n";
  }
  text += "\n\n";

  telegram += text;

  // Padding the last block to 16 bytes
  byte remainder = text.length() % 16;
  if (remainder > 0) {
    for (byte i = 16; i > remainder; i--) {
      telegram += " ";
    }
  }

  sendTelegram(telegram);
}

void IbisProtocol::sendTelegram(String telegram) {
  // Optional: processSpecialCharacters(&telegram);

  _serial.print(telegram);
  _serial.write(0x0D);  // CR
  _serial.write(calculateParity(telegram));
}

unsigned char IbisProtocol::calculateParity(const String &text,
                                            unsigned char startChecksum) {
  // IBIS Checksum: Inverse (0x7F) XOR with all bytes including CR (0x0D)
  // 0x7F ^ 0x0D = 0x72. So we start with 0x72 and XOR all data bytes.
  for (unsigned int i = 0; i < text.length(); i++) {
    startChecksum ^= (unsigned char)text[i];
  }
  return startChecksum;
}

String IbisProtocol::padNumber(uint16_t num, uint8_t digits) {
  String s = String(num);
  while (s.length() < digits) {
    s = "0" + s;
  }
  return s;
}

String IbisProtocol::vdvHex(byte value) {
  // VDV usually maps 0-15 to 0-9 and :;<=>?
  String vdvHexCharacters = "0123456789:;<=>?";
  String vdvHexValue = "";
  byte highNibble = value >> 4;
  byte lowNibble = value & 15;

  if (highNibble > 0) {
    vdvHexValue += vdvHexCharacters.charAt(highNibble);
  }
  vdvHexValue += vdvHexCharacters.charAt(lowNibble);
  return vdvHexValue;
}

void IbisProtocol::processSpecialCharacters(String *telegram) {
  if (!telegram) return;
  telegram->replace("ä", "{");
  telegram->replace("ö", "|");
  telegram->replace("ü", "}");
  telegram->replace("ß", "~");
  telegram->replace("Ä", "[");
  telegram->replace("Ö", "\\");
  telegram->replace("Ü", "]");
}
