#pragma once
#include <Arduino.h>
#include <lvgl.h>
#include "file_manager.h"

// Declare the custom font
LV_FONT_DECLARE(Montserrat);

class UIApp {
public:
  void init(FileManager *fileManager, IndexData *indexData);

private:
  FileManager *_fileManager;
  IndexData *_indexData;

  lv_obj_t *_label_home_selected;

  // State to track selection
  String _selected_bus_file;
  String _selected_tram_file;
  String _selected_bus_name;
  String _selected_tram_name;

  lv_obj_t *_last_bus_btn = nullptr;
  lv_obj_t *_last_tram_btn = nullptr;

  void create_home_tab(lv_obj_t *parent);
  void create_route_tab(lv_obj_t *parent, bool isTram);

  static void list_btn_event_handler(lv_event_t *e);
  static void apply_event_handler(lv_event_t *e);

  void onRouteSelect(lv_obj_t *btn,
                     bool isTram,
                     const char *file_id,
                     const char *name);
  void onApply(bool isTram, lv_obj_t *dropdown);
};
