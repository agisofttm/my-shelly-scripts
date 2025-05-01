//LoRa Receiver
//
//Shelly Plus 1 with LoRa Add-On receiving power measurements 
//and can be controlled via LoRa sender device in our case, 
//Shelly PLUS 1 PM with LoRa Add-On, without wifi connectivity 
//via LoRa Communication

const CONFIG = {
  loRaId:        0,
  virtualPower:  "number:200",
  virtualRelay:  "boolean:200",
  mqttTopic:     "home/shelly/data",
  mqttQos:       0,
  mqttRetain:    false
};

function hexToAscii(hex) {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    let code = parseInt(hex.substr(i, 2), 16);
    if (!isNaN(code)) str += String.fromCharCode(code);
  }
  return str;
}

function asciiToHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += ("0" + str.charCodeAt(i).toString(16)).slice(-2);
  }
  return hex;
}

Shelly.addEventHandler(function (event) {
  if (event.name !== "lora" || !event.info || !event.info.data) return;

  let text = hexToAscii(event.info.data).trim();
  print("[LoRa RX] Got:", text);

  // Автоматично добавяне на липсваща '}'
  if (text.indexOf("{") === 0 && text.indexOf("}") === -1) {
    text += "}";
  }

  // Опит за JSON парсинг
  if (text.indexOf("{") === 0 && text.charAt(text.length - 1) === "}") {
    try {
      let obj = JSON.parse(text);

      if (typeof obj.power !== "undefined") {
        let p = parseFloat(obj.power);
        if (!isNaN(p)) {
          Virtual.getHandle(CONFIG.virtualPower).setValue(p);
          print("[INFO] Power:", p, "W");
        }
      }

      if (typeof obj.relay !== "undefined") {
        let r = obj.relay == 1;
        Virtual.getHandle(CONFIG.virtualRelay).setValue(r);
        print("[INFO] Relay:", r ? "ON" : "OFF");
      }

      if (typeof MQTT !== "undefined" && MQTT.isConnected()) {
        MQTT.publish(CONFIG.mqttTopic, text, CONFIG.mqttQos, CONFIG.mqttRetain);
        print("[MQTT] Published:", text);
      }
    } catch (e) {
      print("[ERROR] JSON parsing failed:", e);
    }
  } else {
    print("[WARNING] Non-JSON LoRa message:", text);
  }
});

Shelly.addStatusHandler(function (event) {
  if (event.component === CONFIG.virtualRelay && typeof event.delta.value === "boolean") {
    const cmd = event.delta.value ? "SWITCH:1" : "SWITCH:0";
    const hex = asciiToHex(cmd);
    print("[BUTTON] Pressed →", cmd);

    Shelly.call("LoRa.SendBytes", { id: CONFIG.loRaId, data: hex }, function (res, err) {
      if (err) print("[ERROR] LoRa TX:", JSON.stringify(err));
      else print("[LoRa TX] Sent cmd:", cmd);
    });
  }
});