#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include <vector>
#include <LittleFS.h>

struct RouteEntry {
  String name;
  String file;  // effectively the ID
};

struct IndexData {
  std::vector<RouteEntry> buses;
  std::vector<RouteEntry> trams;
};

struct RouteDetails {
  String id;
  String name;
  String ibisLineCmd;
  String ibisDestinationCmd;
  std::vector<uint8_t> alfaSignBytes;
};

class FileManager {
public:
  bool init();
  bool readIndex(IndexData &data);
  // type: 0 for bus, 1 for tram. Used to determine directory.
  bool readRoute(const String &filename, RouteDetails &details, int type);

private:
  String readFile(const String &path);
};
