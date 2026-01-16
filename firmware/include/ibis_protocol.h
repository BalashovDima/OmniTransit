#ifndef IBIS_PROTOCOL_H
#define IBIS_PROTOCOL_H

#include <Arduino.h>

class IbisProtocol {
public:
  /**
   * @brief Initialize IBIS Protocol
   * @param serial The HardwareSerial port to use (e.g. Serial2)
   */
  IbisProtocol(HardwareSerial &serial);

  /**
   * @brief configure serial port (1200 baud, 7E2)
   */
  void begin();

  /**
   * @brief Set Line Number (Command 'l')
   * @param line Line number (up to 3 digits usually)
   */
  void setLine(uint16_t line);

  /**
   * @brief Set Destination Number (Command 'z')
   * @param dest Destination number (up to 3 digits usually)
   */
  void setDestination(uint16_t dest);

  /**
   * @brief Set Cycle Number (Command 'xC')
   * @param cycle Cycle number (0-15 usually)
   */
  void setCycle(uint8_t cycle);

  /**
   * @brief Set Time (Command 'u')
   * @param hhmm Time string usually in "HHmm" format
   */
  void setTime(String hhmm);

  /**
   * @brief Set Text (Command 'v')
   * @param text Text to display
   */
  void setText(String text);

  /**
   * @brief Set Complex/Menu Text (Command 'zM')
   * @param text Text to display
   */
  void setComplexText(String text);

  /**
   * @brief Set Announcer/Symbol (Command 'lE')
   * @param number Symbol number
   */
  void setSymbol(String number);

  /**
   * @brief Set DS021t Multi-block text
   * @param address Address string
   * @param text Full text content (handles blocking automatically)
   */
  void setDS021t(String address, String text);

  /**
   * @brief Replace German umlauts with IBIS-specific mapped chars
   * @param telegram String to process (modified in-place)
   */
  void processSpecialCharacters(String *telegram);

private:
  HardwareSerial &_serial;

  /**
   * @brief Send a raw telegram with framing and checksum
   * @param content The telegram content (excluding CR and Parity)
   */
  void sendTelegram(String content);

  /**
   * @brief Calculate IBIS parity
   * @param text The text to verify
   * @param startChecksum Initial checksum value (default 0x72 for [7F ^ 0D])
   * @return Calculated parity byte
   */
  unsigned char calculateParity(const String &text,
                                unsigned char startChecksum = 0x72);

  /**
   * @brief Helper to format numbers with leading zeros
   */
  String padNumber(uint16_t num, uint8_t digits);

  /**
   * @brief Helper for VDV Hex encoding (DS021t)
   */
  String vdvHex(byte value);
};

#endif  // IBIS_PROTOCOL_H
