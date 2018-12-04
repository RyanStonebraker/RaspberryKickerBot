import requests
from time import sleep

import math

import telemetryResponder

import random

commandCount = 0

config = {
    "velocity": 1,
    "angularVelocity": 20,
    "feedURL": "http://127.0.0.1:5000/telemetry",
    "postURL": "http://localhost:5000/telemetry/post"
}

telemetry = {
    "displacement": {
        "x": 0,
        "y": 0
    },
    "angle": 0,
    "ultrasonic": 0
}

def clearTelemery():
    telemetry['displacement'] = {
        "x": 0,
        "y": 0
    }
    telemetry['ultrasonic'] = 0
    telemetry['angle'] = telemetry['angle'] % 360

def executeCommand(command):
    clearTelemery()
    cParams = command['parameters']
    if command['instruction'] == "forward":
        telemetry['displacement']['x'] = -cParams['distance'] * config['velocity'] * math.sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = cParams['distance'] * config['velocity'] * math.cos(telemetry['angle'] * math.pi / 180)
        telemetry['ultrasonic'] = random.random() * 50 + 200 if random.random() * 100 - 95 > 0 else 0
    elif command['instruction'] == "backward":
        telemetry['displacement']['x'] = cParams['distance'] * config['velocity'] * math.sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = -cParams['distance'] * config['velocity'] * math.cos(telemetry['angle'] * math.pi / 180)
    elif command['instruction'] == "rotate":
        angleTime = abs(cParams['angle']/config['angularVelocity'])
        telemetry['angle'] += cParams['angle']
        telemetry['ultrasonic'] = random.random() * 50 + 200 if random.random() * 100 - 93 > 0 else 0

# Listen, execute, respond loop
while True:
    currentFeed = requests.get(config['feedURL']).json()
    if not currentFeed['waitingForPi']:
        sleep(0.05)
        continue

    if len(currentFeed['commands']) > commandCount:
        for command in currentFeed['commands'][commandCount:]:
            commandCount += 1
            executeCommand(command)
        telemetrySent = telemetryResponder.sendTelemetry(telemetry, config['postURL'])

        if not telemetrySent:
            print("ERROR: TELEMETRY NOT SENT:", telemetrySent)
            sleep(0.1)

    sleep(0.01)
