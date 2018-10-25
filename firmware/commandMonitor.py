import requests
from time import sleep
import RPi.GPIO as GPIO

import math

import telemetryResponder

import random

commandHistory = []

config = {
    "velocity": 30, # cm/s
    "angularVelocity": 20,
    "feedURL": "http://127.0.0.1:5000/telemetry",
    "postURL": "http://127.0.0.1:5000/telemetry/post"
}

telemetry = {
    "displacement": {
        "x": 0,
        "y": 0
    },
    "angle": 0,
    "ultrasonic": 0
}

def setRightForward():
    GPIO.output(3, True)
    GPIO.output(5, False)

def setRightBackward():
    GPIO.output(3, False)
    GPIO.output(5, True)

def setLeftForward():
    GPIO.output(10, True)
    GPIO.output(12, False)

def setLeftBackward():
    GPIO.output(10, False)
    GPIO.output(12, True)

def enableMotors():
    GPIO.output(7, True)
    GPIO.output(8, True)

def disableMotors():
    GPIO.output(7, False)
    GPIO.output(8, False)

def driveForward(driveTime=1):
    setRightForward()
    setLeftForward()
    enableMotors()
    sleep(driveTime)
    disableMotors()

def driveBackward(driveTime=1):
    setRightBackward()
    setLeftBackward()
    enableMotors()
    sleep(driveTime)
    disableMotors()

def rotateLeft(rotateTime=1):
    setRightForward()
    setLeftBackward()
    enableMotors()
    sleep(rotateTime)
    disableMotors()

def rotateRight(rotateTime=1):
    setRightBackward()
    setLeftForward()
    enableMotors()
    sleep(rotateTime)
    disableMotors()

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
        driveForward(abs(cParams['distance']/config['velocity']))
        telemetry['displacement']['x'] = -config['velocity'] * math.sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = config['velocity'] * math.cos(telemetry['angle'] * math.pi / 180)
        # telemetry['ultrasonic'] = 0
    elif command['instruction'] == "backward":
        driveBackward(abs(cParams['distance']/config['velocity']))
        telemetry['displacement']['x'] = config['velocity'] * math.sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = -config['velocity'] * math.cos(telemetry['angle'] * math.pi / 180)
    elif command['instruction'] == "rotate":
        angleTime = abs(cParams['angle']/config['angularVelocity'])
        telemetry['angle'] += cParams['angle']
        # telemetry['ultrasonic'] = 0
        if cParams['angle'] < 0:
            rotateRight(angleTime)
        else:
            rotateLeft(angleTime)

if __name__ == "__main__":
    GPIO.setmode(GPIO.BOARD)

    # Right Motor
    GPIO.setup(3, GPIO.OUT)
    GPIO.setup(5, GPIO.OUT)
    GPIO.setup(7, GPIO.OUT) # Enable 1

    # Left Motor
    GPIO.setup(8, GPIO.OUT) # Enable 2
    GPIO.setup(10, GPIO.OUT)
    GPIO.setup(12, GPIO.OUT)

    while True:
        currentFeed = requests.get(config['feedURL']).json()
        if not currentFeed['waitingForPi']:
            sleep(0.05)
            continue

        if len(currentFeed['commands']) > len(commandHistory):
            for command in currentFeed['commands'][len(commandHistory):]:
                commandHistory.append(command)
                executeCommand(command)
            telemetrySent = telemetryResponder.sendTelemetry(telemetry, config['postURL'])

            if not telemetrySent:
                print("ERROR: TELEMETRY NOT SENT:", telemetrySent)
                sleep(0.05)

        sleep(0.01)
