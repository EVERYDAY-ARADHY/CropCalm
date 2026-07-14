# CropCalm - Network Architecture

This document maps out how the different hardware pieces communicate with each other over the air. Because farms often lack broadband internet, this is designed as an **Offline Local Area Network (LAN)** centered around the Raspberry Pi.

## 1. Network Topology (Hub-and-Spoke)

```mermaid
graph TD
    %% Node Definitions
    Phone[📱 Farmer's Smartphone\nBrowser: 192.168.4.1]
    
    subgraph The Hub - Farm Center
        Pi[🍓 Raspberry Pi 3B\nWi-Fi Hotspot: 'CropCalm-Net']
        MQTT[Mosquitto MQTT Broker\nPort 1883]
        NodeJS[Node.js Web Dashboard\nPort 80]
        
        Pi --- MQTT
        Pi --- NodeJS
    end
    
    subgraph The Edge - Perimeter
        ESP1[⚡ Edge Node 1\nNorth Fence\nMAC: A4:CF:12...]
        ESP2[⚡ Edge Node 2\nEast Fence\nMAC: B8:D1:44...]
        ESP3[⚡ Edge Node X\n(Easily Expandable)]
    end
    
    subgraph Global Cloud
        Telegram[Telegram Bot API\nFree Alerts via Phone Internet]
    end

    %% Connections
    ESP1 -->|MQTT Publish:\nThreat Level, Distance| MQTT
    ESP2 -->|MQTT Publish:\nThreat Level, Distance| MQTT
    ESP3 -.->|MQTT Publish| MQTT
    
    NodeJS -->|Subscribes to| MQTT
    MQTT -->|Global State:\nArm/Disarm| ESP1
    MQTT -->|Global State:\nArm/Disarm| ESP2
    
    Phone -->|USB Tethering| Pi
    NodeJS -->|API Request| Telegram
    
    Phone <==>|HTTP/WebSockets:\nViews Local Dashboard| NodeJS
```

---

## 2. How the Communication Works

### A. The Hub (Raspberry Pi)
The Raspberry Pi acts as the "Brain" and the router for the entire farm. 
*   It broadcasts a Wi-Fi network (e.g., SSID: `CropCalm-Net`) for the nodes to connect to.
*   **Showcase Internet Hack:** You can plug your smartphone into the Pi via USB and turn on "USB Tethering". This shares your phone's internet with the Pi for free, allowing the Pi to send Telegram alerts during the presentation without buying a dongle.
*   It runs a lightweight **MQTT Broker** (Mosquitto) that acts as the post office, sorting messages between the ESP8266 nodes and the dashboard.

### B. The Edge Nodes (ESP8266)
When you place a NodeMCU on the fence:
*   It connects to the `CropCalm-Net` Wi-Fi network.
*   If an animal triggers the sensors, it instantly sends an MQTT message to the Pi. Example:
    *   Topic: `cropcalm/sensors/MAC_ADDRESS/status`
    *   Payload: `{"threat": 3, "direction": "RIGHT", "distance_cm": 38}`
*   It listens for global commands from the Pi (like "Go to sleep, it is daytime").

### C. The Farmer (Smartphone)
When the farmer wants to check the farm status:
*   They walk within Wi-Fi range of the Pi (or the Pi is placed near the farmhouse).
*   They connect their phone to the `CropCalm-Net` Wi-Fi.
*   They open Chrome/Safari and type in the Pi's IP address (e.g., `192.168.4.1`).
*   The Node.js server sends a beautiful, live-updating webpage to their phone. They can see exactly which node is flashing, what the threat level is, and change settings (like assigning a specific Node to the "North Fence" in the software map).
