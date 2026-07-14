#include <Arduino.h>

// PIN DEFINITIONS (Locked per architecture)
#define PIN_HCSR04_RIGHT_TRIG 5   // D1
#define PIN_HCSR04_RIGHT_ECHO 4   // D2
#define PIN_PIEZO_OUT         0   // D3
#define PIN_LED_STROBE        2   // D4
#define PIN_HCSR04_LEFT_TRIG  14  // D5
#define PIN_HCSR04_LEFT_ECHO  12  // D6
#define PIN_PIR               13  // D7
#define PIN_BUZZER            15  // D8

// STATE MACHINE THRESHOLDS
const int DISTANCE_THRESHOLD_CRITICAL = 40; // cm
const int DISTANCE_THRESHOLD_WARN = 100;    // cm
const int DISTANCE_THRESHOLD_MAX = 200;     // cm

// TIMING CONSTANTS (Non-blocking)
const unsigned long SENSOR_POLL_INTERVAL = 100; // ms between ultrasonic pings
const unsigned long STROBE_FAST_INTERVAL = 50;  // ms
const unsigned long STROBE_SLOW_INTERVAL = 500; // ms
const unsigned long WAKEUP_TIMEOUT = 10000;     // ms to go back to sleep after no motion

// SYSTEM STATE
int currentThreatLevel = 0; // 0=Idle, 1=Wakeup, 2=Tracking, 3=Critical
unsigned long lastMotionTime = 0;
unsigned long lastSensorPollTime = 0;
unsigned long lastStrobeTime = 0;
bool ledState = false;

// DIRECTION TRACKING
unsigned long leftTriggerTime = 0;
unsigned long rightTriggerTime = 0;
int lastLeftDistance = 999;
int lastRightDistance = 999;

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n--- CropCalm Edge Node Initializing ---");

  // Pin Modes
  pinMode(PIN_HCSR04_RIGHT_TRIG, OUTPUT);
  pinMode(PIN_HCSR04_RIGHT_ECHO, INPUT);
  pinMode(PIN_HCSR04_LEFT_TRIG, OUTPUT);
  pinMode(PIN_HCSR04_LEFT_ECHO, INPUT);
  
  pinMode(PIN_PIR, INPUT);
  
  pinMode(PIN_LED_STROBE, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_PIEZO_OUT, OUTPUT);

  // Initial State Setup
  digitalWrite(PIN_LED_STROBE, LOW);
  digitalWrite(PIN_BUZZER, LOW);
  noTone(PIN_PIEZO_OUT);
  
  Serial.println("System Ready. Waiting for motion...");
}

// Non-blocking ping function
int pingUltrasonic(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Timeout added so we don't block forever if no echo
  long duration = pulseIn(echoPin, HIGH, 20000); // 20ms timeout (~3.4m)
  
  if (duration == 0) return 999; // No echo
  
  int distance = duration * 0.034 / 2;
  return distance;
}

void loop() {
  unsigned long currentTime = millis();

  // 1. CHECK PIR FOR WAKEUP (THREAT LEVEL 0 -> 1)
  if (digitalRead(PIN_PIR) == HIGH) {
    lastMotionTime = currentTime;
    if (currentThreatLevel == 0) {
      currentThreatLevel = 1;
      Serial.println("PIR TRIGGERED: System Woke Up (Threat Level 1)");
    }
  }

  // Check Wakeup Timeout
  if (currentThreatLevel > 0 && (currentTime - lastMotionTime > WAKEUP_TIMEOUT)) {
    Serial.println("Timeout: System returning to Idle (Threat Level 0)");
    currentThreatLevel = 0;
    // Reset Actuators
    digitalWrite(PIN_LED_STROBE, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    noTone(PIN_PIEZO_OUT);
  }

  // 2. IF AWAKE, POLL ULTRASONIC SENSORS & DETERMINE DIRECTION
  if (currentThreatLevel > 0) {
    if (currentTime - lastSensorPollTime >= SENSOR_POLL_INTERVAL) {
      lastSensorPollTime = currentTime;
      
      int leftDist = pingUltrasonic(PIN_HCSR04_LEFT_TRIG, PIN_HCSR04_LEFT_ECHO);
      int rightDist = pingUltrasonic(PIN_HCSR04_RIGHT_TRIG, PIN_HCSR04_RIGHT_ECHO);
      
      int closestDist = min(leftDist, rightDist);
      
      // Direction Logic (Simplified for demo)
      if (leftDist < DISTANCE_THRESHOLD_MAX && lastLeftDistance >= DISTANCE_THRESHOLD_MAX) {
        Serial.print("Left Sensor Triggered. ");
        leftTriggerTime = currentTime;
        if (currentTime - rightTriggerTime < 2000) {
          Serial.println("-> HERD MOVING LEFT TO RIGHT ->");
        } else {
          Serial.println("");
        }
      }
      if (rightDist < DISTANCE_THRESHOLD_MAX && lastRightDistance >= DISTANCE_THRESHOLD_MAX) {
        Serial.print("Right Sensor Triggered. ");
        rightTriggerTime = currentTime;
        if (currentTime - leftTriggerTime < 2000) {
          Serial.println("<- HERD MOVING RIGHT TO LEFT <-");
        } else {
          Serial.println("");
        }
      }
      
      lastLeftDistance = leftDist;
      lastRightDistance = rightDist;

      // 3. THREAT LEVEL ESCALATION BASED ON DISTANCE
      if (closestDist < DISTANCE_THRESHOLD_CRITICAL) {
        if (currentThreatLevel != 3) {
          currentThreatLevel = 3;
          Serial.println("THREAT LEVEL 3: CRITICAL PROXIMITY! Activating Full Deterrent.");
        }
      } else if (closestDist < DISTANCE_THRESHOLD_WARN) {
        if (currentThreatLevel != 2) {
          currentThreatLevel = 2;
          Serial.println("THREAT LEVEL 2: Animal Tracking...");
        }
      } else {
        if (currentThreatLevel >= 2) {
           currentThreatLevel = 1;
           Serial.println("THREAT LEVEL 1: Animal receded. Monitoring...");
        }
      }
      
      // For debugging in serial monitor
      if (closestDist < DISTANCE_THRESHOLD_MAX) {
        Serial.print("Dist: "); Serial.print(closestDist); Serial.print("cm | Threat: "); Serial.println(currentThreatLevel);
      }
    }
  }

  // 4. ACTUATE BIOMIMETIC DETERRENTS NON-BLOCKING
  if (currentThreatLevel == 0) {
    // Everything off
    digitalWrite(PIN_LED_STROBE, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    noTone(PIN_PIEZO_OUT);
  } 
  else if (currentThreatLevel == 1) {
    // Slow Blink, No Noise
    if (currentTime - lastStrobeTime >= STROBE_SLOW_INTERVAL) {
      lastStrobeTime = currentTime;
      ledState = !ledState;
      digitalWrite(PIN_LED_STROBE, ledState);
    }
    digitalWrite(PIN_BUZZER, LOW);
    noTone(PIN_PIEZO_OUT);
  }
  else if (currentThreatLevel == 2) {
    // Faster Blink, Short Chirps
    if (currentTime - lastStrobeTime >= STROBE_SLOW_INTERVAL / 2) {
      lastStrobeTime = currentTime;
      ledState = !ledState;
      digitalWrite(PIN_LED_STROBE, ledState);
      // Optional chirp
      if (ledState) tone(PIN_PIEZO_OUT, 40000); else noTone(PIN_PIEZO_OUT);
    }
    digitalWrite(PIN_BUZZER, LOW);
  }
  else if (currentThreatLevel == 3) {
    // Frantic Strobe + Continuous Buzzer & Piezo
    if (currentTime - lastStrobeTime >= STROBE_FAST_INTERVAL) {
      lastStrobeTime = currentTime;
      ledState = !ledState;
      digitalWrite(PIN_LED_STROBE, ledState);
    }
    digitalWrite(PIN_BUZZER, HIGH);
    tone(PIN_PIEZO_OUT, 40000); // 40kHz ultrasound
  }
}
