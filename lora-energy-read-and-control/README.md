Description:
A test model for sending energy and control data over LoRa. The test system is built as follows:

A Shelly Plus 1 (receiver) device with the LoRa Add-on is connected to the Internet and waits for LoRa data from other devices that don’t have Internet access. On the receiver, you need to add Virtual Components—specifically a boolean:200 for control and a number:200 for reading energy. The code also includes an option to forward the data via MQTT, if MQTT has been preconfigured on the device itself.

A Shelly Plus 1PM (sender) device with the LoRa Add-on has no direct Internet connectivity and is used to transmit the measured energy readings, as well as to be controlled via the LoRa connection.

Notes:
	1.	The LoRa settings on both Shelly devices must be identical.
	2.	Both devices must have the “Accept via LoRa” option enabled.
	3.	Please configure the transmission interval to be at least 1 or 5 minutes.

 TO Do:
 1. AES encryption
 2. Automatic Time sync on LoRa Sender from LoRa Receiver
    
