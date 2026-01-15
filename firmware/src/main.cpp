/*
 * SPDX-FileCopyrightText: 2024-2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: CC0-1.0
 */

#include "lvgl_v8_port.h"
#include <Arduino.h>
#include <esp_display_panel.hpp>
#include <lvgl.h>
#include "ui_app.h"
#include "file_manager.h"

/**
 * To use the built-in examples and demos of LVGL uncomment the includes below
 * respectively.
 * You also need to copy `lvgl/examples` to `lvgl/src/examples`. Similarly for
 * the demos `lvgl/demos` to `lvgl/src/demos`.
 */
// #include <demos/lv_demos.h>
// #include <examples/lv_examples.h>

using namespace esp_panel::drivers;
using namespace esp_panel::board;

void setup() {
  Serial.begin(115200);

  Serial.println("Initializing board");
  Board *board = new Board();
  board->init();
#if LVGL_PORT_AVOID_TEARING_MODE
  auto lcd = board->getLCD();
  // When avoid tearing function is enabled, the frame buffer number should be
  // set in the board driver
  lcd->configFrameBufferNumber(LVGL_PORT_DISP_BUFFER_NUM);
#if ESP_PANEL_DRIVERS_BUS_ENABLE_RGB && CONFIG_IDF_TARGET_ESP32S3
  auto lcd_bus = lcd->getBus();
  /**
   * As the anti-tearing feature typically consumes more PSRAM bandwidth, for
   * the ESP32-S3, we need to utilize the "bounce buffer" functionality to
   * enhance the RGB data bandwidth. This feature will consume
   * `bounce_buffer_size * bytes_per_pixel * 2` of SRAM memory.
   */
  if (lcd_bus->getBasicAttributes().type == ESP_PANEL_BUS_TYPE_RGB) {
    static_cast<BusRGB *>(lcd_bus)->configRGB_BounceBufferSize(
        lcd->getFrameWidth() * 10);
  }
#endif
#endif
  assert(board->begin());

  Serial.println("Initializing LVGL");
  lvgl_port_init(board->getLCD(), board->getTouch());

  Serial.println("Creating UI");

  static FileManager fileManager;
  static IndexData indexData;
  static UIApp uiApp;

  if (!fileManager.init()) {
    Serial.println("Failed to init filesystem!");
  }

  // Try to read index, create dummy if empty for testing robustness
  if (!fileManager.readIndex(indexData)) {
    Serial.println("Failed to read index or empty!");
    // Optional: Add dummy data if nothing found just so UI isn't empty?
    // user requested error handling, so we just log it. UI will be empty lists.
  }

  /* Lock the mutex due to the LVGL APIs are not thread-safe */
  lvgl_port_lock(-1);

  uiApp.init(&fileManager, &indexData);

  /* Release the mutex */
  lvgl_port_unlock();
}

void loop() {
  delay(10);
}
