import requests
from time import sleep
import RPi.GPIO as GPIO

import math

import telemetryResponder

import random

commandCount = 0

config = {
    "velocity": 30,
    "angularVelocity": 20,
    "feedURL": "http://192.168.43.152:5000/telemetry",
    "postURL": "http://192.168.43.152:5000/telemetry/post"
}

telemetry = {
    "displacement": {
        "x": 0,
        "y": 0
    },
    "angle": 0,
    "ultrasonic": 0
}

rightMotor1 = 3
rightMotor2 = 5
rightMotorEnable = 7
leftMotor1 = 10
leftMotor2 = 12
leftMotorEnable = 8

def setRightForward():
    GPIO.output(rightMotor1, True)
    GPIO.output(rightMotor2, False)

def setRightBackward():
    GPIO.output(rightMotor1, False)
    GPIO.output(rightMotor2, True)

def setLeftForward():
    GPIO.output(leftMotor1, True)
    GPIO.output(leftMotor2, False)

def setLeftBackward():
    GPIO.output(leftMotor1, False)
    GPIO.output(leftMotor2, True)

def enableMotors():
    GPIO.output(rightMotorEnable, True)
    GPIO.output(leftMotorEnable, True)

def disableMotors():
    GPIO.output(rightMotorEnable, False)
    GPIO.output(leftMotorEnable, False)

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
        telemetry['displacement']['x'] = -cParams['distance'] * math.sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = cParams['distance'] * math.cos(telemetry['angle'] * math.pi / 180)
    elif command['instruction'] == "backward":
        driveBackward(abs(cParams['distance']/config['velocity']))
        telemetry['displacement']['x'] = cParams['distance'] * math.sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = -cParams['distance'] * math.cos(telemetry['angle'] * math.pi / 180)
    elif command['instruction'] == "rotate":
        angleTime = abs(cParams['angle']/config['angularVelocity'])
        telemetry['angle'] += cParams['angle']
        rotateRight(angleTime) if cParams['angle'] < 0 else rotateLeft(angleTime)

if __name__ == "__main__":
    GPIO.setmode(GPIO.BOARD)

    # Right Motor
    GPIO.setup(rightMotor1, GPIO.OUT)
    GPIO.setup(rightMotor2, GPIO.OUT)
    GPIO.setup(rightMotorEnable, GPIO.OUT)

    # Left Motor
    GPIO.setup(leftMotor1, GPIO.OUT)
    GPIO.setup(leftMotor2, GPIO.OUT)
    GPIO.setup(leftMotorEnable, GPIO.OUT)

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
