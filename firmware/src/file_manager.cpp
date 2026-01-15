#include "file_manager.h"

bool FileManager::init() {
  if (!LittleFS.begin(false)) {
    Serial.println("LittleFS Mount Failed");
    return false;
  }
  Serial.println("LittleFS Mounted");
  return true;
}

String FileManager::readFile(const String &path) {
  File file = LittleFS.open(path);
  if (!file) {
    Serial.printf("Failed to open file for reading: %s\n", path.c_str());
    return "";
  }

  String content = file.readString();
  file.close();
  return content;
}

bool FileManager::readIndex(IndexData &data) {
  String content = readFile("/index.json");
  if (content.isEmpty()) return false;

  JsonDocument doc;  // Dynamic size handling by ArduinoJson 7, or specify size
                     // if strictly needed. V7 is recommended.
  DeserializationError error = deserializeJson(doc, content);

  if (error) {
    Serial.print("readIndex: deserializeJson() failed: ");
    Serial.println(error.c_str());
    return false;
  }

  JsonArray buses = doc["buses"];
  for (JsonObject bus : buses) {
    RouteEntry entry;
    entry.name = bus["name"].as<String>();
    entry.file = bus["file"].as<String>();
    data.buses.push_back(entry);
  }

  JsonArray trams = doc["trams"];
  for (JsonObject tram : trams) {
    RouteEntry entry;
    entry.name = tram["name"].as<String>();
    entry.file = tram["file"].as<String>();
    data.trams.push_back(entry);
  }

  return true;
}

bool FileManager::readRoute(const String &filename,
                            RouteDetails &details,
                            int type) {
  String path = (type == 0 ? "/buses/" : "/trams/") + filename + ".json";
  String content = readFile(path);
  if (content.isEmpty()) return false;

  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, content);

  if (error) {
    Serial.print("readRoute: deserializeJson() failed: ");
    Serial.println(error.c_str());
    return false;
  }

  details.id = doc["id"].as<String>();
  details.name = doc["name"].as<String>();
  details.ibisLineCmd = doc["ibisLineCmd"].as<String>();
  details.ibisDestinationCmd = doc["ibisDestinationCmd"].as<String>();

  JsonArray bytes = doc["alfaSignBytes"];
  for (int b : bytes) {
    details.alfaSignBytes.push_back((uint8_t)b);
  }

  return true;
}
