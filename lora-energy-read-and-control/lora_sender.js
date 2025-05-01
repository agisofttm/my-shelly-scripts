//LoRa Sender
//
//Shelly Plus 1PM with LoRa Add-On sending power measurements 
//and can be controlled via LoRa receiver device in our case, 
//Shelly PLUS 1 with LoRa Add-On, without wifi connectivity 
//via LoRa Communication

// ====== LORA SENDER ======

let lastSent = 0;
let reportInterval = 10; // секунди (напр. 10 = на всеки 10 сек)
let minPower = 10;

function asciiToHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    let h = str.charCodeAt(i).toString(16);
    if (h.length < 2) h = "0" + h;
    hex += h;
  }
  return hex;
}

function hexToAscii(hex) {
  let s = "";
  for (let i = 0; i < hex.length; i += 2) {
    s += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return s;
}

function sendPowerStatus() {
  Shelly.call("Switch.GetStatus", { id: 0 }, function (status) {
    let power = status.apower;
    let relay = status.output ? 1 : 0;

    let json = JSON.stringify({ power: power.toFixed(1), relay: relay });
    let hex = asciiToHex(json);

    Shelly.call("LoRa.SendBytes", { id: 0, data: hex }, function (res, err) {
      if (err) print("[ERROR] LoRa TX:", err);
      else {
        print("[LoRa TX] Sending:", json);
        lastSent = Date.now();
      }
    });
  });
}

Shelly.addEventHandler(function (event) {
  if (!event || !event.info || !event.info.data) return;
  let text = hexToAscii(event.info.data).trim();
  print("[LoRa RX] Получена команда:", text);

  if (text === "SWITCH:1") {
    Shelly.call("Switch.Set", { id: 0, on: true }, function (res, err) {
      if (err) print("[ERROR] Relay ON:", JSON.stringify(err));
      else print("[ACTION] Relay turned ON");
    });
  } else if (text === "SWITCH:0") {
    Shelly.call("Switch.Set", { id: 0, on: false }, function (res, err) {
      if (err) print("[ERROR] Relay OFF:", JSON.stringify(err));
      else print("[ACTION] Relay turned OFF");
    });
  } else {
    print("[INFO] Unknown LoRa команда:", text);
  }
});

// Пращане на статус на всеки 10 секунди
Timer.set(10000, true, sendPowerStatus);