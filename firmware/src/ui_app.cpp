#include "ui_app.h"

#define FONT_SMALL &Montserrat
#define FONT_LARGE &Montserrat

void UIApp::init(FileManager *fileManager,
                 IndexData *indexData,
                 IbisProtocol *ibis) {
  _fileManager = fileManager;
  _indexData = indexData;
  _ibis = ibis;

  lv_obj_t *tabview = lv_tabview_create(lv_scr_act(), LV_DIR_TOP, 50);

  // Set font for tab buttons
  lv_obj_t *tab_btns = lv_tabview_get_tab_btns(tabview);
  lv_obj_set_style_text_font(tab_btns, FONT_SMALL, 0);

  lv_obj_t *tab1 = lv_tabview_add_tab(tabview, "Головна");  // Home
  lv_obj_t *tab2 = lv_tabview_add_tab(tabview, "Автобус");  // Bus
  lv_obj_t *tab3 = lv_tabview_add_tab(tabview, "Трамвай");  // Tram

  create_home_tab(tab1);
  create_route_tab(tab2, false);  // Bus
  create_route_tab(tab3, true);   // Tram
}

void UIApp::create_home_tab(lv_obj_t *parent) {
  _label_home_selected = lv_label_create(parent);
  lv_label_set_text(_label_home_selected, "Очікую вибору...");
  lv_obj_set_style_text_font(_label_home_selected, FONT_LARGE, 0);
  lv_obj_center(_label_home_selected);
}

void UIApp::create_route_tab(lv_obj_t *parent, bool isTram) {
  // Left side: List
  lv_obj_t *list = lv_list_create(parent);
  lv_obj_set_size(list, lv_pct(45), lv_pct(100));
  lv_obj_align(list, LV_ALIGN_TOP_LEFT, 0, 0);

  const std::vector<RouteEntry> &routes =
      isTram ? _indexData->trams : _indexData->buses;

  for (const auto &route : routes) {
    lv_obj_t *btn = lv_list_add_btn(list, NULL, route.name.c_str());
    lv_obj_set_style_text_font(btn, FONT_SMALL, 0);

    // Store metadata (file/id) in user data or event?
    // We can attach a pointer to a struct, or just copy string to user_data if
    // we allocate it? Simpler: use the event user_data to pass the UIApp
    // instance, and verify which btn text it is? Or store file_id as user_data
    // of the object. lv_obj_set_user_data is available. But we need to manage
    // memory if we allocate strings. The indexData persists, so we can store
    // pointer to RouteEntry in user_data of button!

    lv_obj_set_user_data(btn,
                         (void *)&route);  // Dangerous cast but route lives in
                                           // vector in main/global

    lv_obj_add_event_cb(btn, list_btn_event_handler, LV_EVENT_CLICKED, this);
  }

  // Right side: Controls
  lv_obj_t *container = lv_obj_create(parent);
  lv_obj_set_size(container, lv_pct(50), lv_pct(100));
  lv_obj_align(container, LV_ALIGN_TOP_RIGHT, 0, 0);
  lv_obj_set_flex_flow(container, LV_FLEX_FLOW_COLUMN);
  lv_obj_set_flex_align(container, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER,
                        LV_FLEX_ALIGN_CENTER);

  lv_obj_t *label = lv_label_create(container);
  lv_label_set_text(label, "Тип знаку:");
  lv_obj_set_style_text_font(label, FONT_SMALL, 0);

  lv_obj_t *dropdown = lv_dropdown_create(container);
  lv_dropdown_set_options(dropdown, "IBIS\nAlfa");
  lv_obj_set_style_text_font(dropdown, FONT_SMALL, 0);

  lv_obj_t *btn_apply = lv_btn_create(container);
  lv_obj_t *lbl_apply = lv_label_create(btn_apply);
  lv_label_set_text(lbl_apply, "Застосувати");
  lv_obj_set_style_text_font(lbl_apply, FONT_SMALL, 0);

  // Pass everything needed to callback
  // We need: UIApp instance, isTram, dropdown obj.
  // Can't pass multiple user_data easily.
  // Create a struct or wrapper?
  // Or just store the dropdown pointer in the class if unique?
  // Since there are two tabs, we have two dropdowns.
  // I will attach the UIApp instance to the button event, and the dropdown as
  // user_data of the button? No, event user_data is one pointer. I'll make a
  // helper struct.

  struct ApplyContext {
    UIApp *app;
    bool isTram;
    lv_obj_t *dropdown;
  };

  ApplyContext *ctx = new ApplyContext{this, isTram, dropdown};
  lv_obj_set_user_data(
      btn_apply, ctx);  // Button owns this memory effectively (leak if
                        // destroyed without cleanup, but app is permanent)
  lv_obj_add_event_cb(btn_apply, apply_event_handler, LV_EVENT_CLICKED, ctx);
}

void UIApp::list_btn_event_handler(lv_event_t *e) {
  lv_obj_t *btn = lv_event_get_target(e);
  UIApp *app = (UIApp *)lv_event_get_user_data(e);
  RouteEntry *route = (RouteEntry *)lv_obj_get_user_data(btn);

  // Determine if bus or tram based on checking which list it is?
  // Or check if route is in bus or tram vector?
  // Easier: The button does not know if it is bus or tram easily unless we
  // passed that. But we know based on which list parent? Let's deduce from
  // route internal knowledge or verify. Actually, update `onRouteSelect` to
  // figure it out or just update both/relevant if current tab logic? Simpler:
  // iterate buses to see if match.

  bool isTram = false;
  // Check if route pointer is in tram list
  for (const auto &r : app->_indexData->trams) {
    if (&r == route) {
      isTram = true;
      break;
    }
  }

  app->onRouteSelect(btn, isTram, route->file.c_str(), route->name.c_str());
}

void UIApp::onRouteSelect(lv_obj_t *btn,
                          bool isTram,
                          const char *file_id,
                          const char *name) {
  if (isTram) {
    _selected_tram_file = String(file_id);
    _selected_tram_name = String(name);
    if (_last_tram_btn) lv_obj_clear_state(_last_tram_btn, LV_STATE_CHECKED);
    _last_tram_btn = btn;
  } else {
    _selected_bus_file = String(file_id);
    _selected_bus_name = String(name);
    if (_last_bus_btn) lv_obj_clear_state(_last_bus_btn, LV_STATE_CHECKED);
    _last_bus_btn = btn;
  }
  lv_obj_add_state(btn, LV_STATE_CHECKED);
}

void UIApp::apply_event_handler(lv_event_t *e) {
  // data is ApplyContext
  struct ApplyContext {
    UIApp *app;
    bool isTram;
    lv_obj_t *dropdown;
  };
  ApplyContext *ctx = (ApplyContext *)lv_event_get_user_data(e);

  ctx->app->onApply(ctx->isTram, ctx->dropdown);
}

void UIApp::onApply(bool isTram, lv_obj_t *dropdown) {
  String selectedFile = isTram ? _selected_tram_file : _selected_bus_file;
  String selectedName = isTram ? _selected_tram_name : _selected_bus_name;

  if (selectedFile.isEmpty()) {
    Serial.println("No route selected!");
    return;
  }

  RouteDetails details;
  // Type: 0 for bus, 1 for tram
  if (_fileManager->readRoute(selectedFile, details, isTram ? 1 : 0)) {
    Serial.println("Parsing successful. Applying...");
    uint16_t selectedOpt = lv_dropdown_get_selected(dropdown);
    bool isIbis = (selectedOpt == 0);

    if (isIbis) {
      Serial.println("Sending IBIS commands...");
      if (_ibis) {
        // Parse line and dest as int, defaults to 0 if invalid
        uint16_t line = details.ibisLineCmd.toInt();
        uint16_t dest = details.ibisDestinationCmd.toInt();

        // Send Line
        _ibis->setLine(line);
        delay(200);  // Small delay between commands often helps
        // Send Destination
        _ibis->setDestination(dest);
        delay(200);
        // Often sending text is useful too?
        // _ibis->setText(details.alfaSignText);
        Serial.printf("IBIS sent: Line %d, Dest %d\n", line, dest);
      }
    } else {
      Serial.println("Sending Alfa Binary...");
      // Read binary file content
      String binPath =
          (isTram ? "/trams/" : "/buses/") + details.alfaSignBinFile;

      if (LittleFS.exists(binPath)) {
        File binFile = LittleFS.open(binPath, "r");
        if (binFile) {
          Stream &alfaSerial = Serial1;

          size_t sent = 0;
          uint8_t buf[64];
          while (binFile.available()) {
            size_t len = binFile.read(buf, sizeof(buf));
            alfaSerial.write(buf, len);
            sent += len;
          }
          binFile.close();
          Serial.printf("Alfa sent: %d bytes from %s\n", sent, binPath.c_str());
        } else {
          Serial.printf("Failed to open bin file: %s\n", binPath.c_str());
        }
      } else {
        Serial.printf("Bin file not found: %s\n", binPath.c_str());
      }
    }

    // Update Home Label
    lv_label_set_text_fmt(_label_home_selected, "Вибрано:\n%s\n(%s)",
                          selectedName.c_str(), isIbis ? "IBIS" : "Alfa");
  } else {
    Serial.println("Failed to read route file");
  }
}
