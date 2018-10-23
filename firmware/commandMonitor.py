import requests
from time import sleep
import RPi.GPIO as GPIO

import math

import telemetryResponder

commandHistory = []

config = {
    "velocity": 10, # cm/s
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

GPIO.setmode(GPIO.BOARD)

# Right Motor
GPIO.setup(3, GPIO.OUT)
GPIO.setup(5, GPIO.OUT)
GPIO.setup(7, GPIO.OUT) # Enable 1

# Left Motor
GPIO.setup(8, GPIO.OUT) # Enable 2
GPIO.setup(10, GPIO.OUT)
GPIO.setup(12, GPIO.OUT)

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

def driveForward(driveTime=1, power=50):
    pwm.start(0)
    setRightForward()
    setLeftForward()
    pwm.ChangeDutyCycle(power)
    enableMotors()
    sleep(driveTime)
    disableMotors()
    pwm.stop()

def driveBackward(driveTime=1, power=50):
    pwm.start(0)
    setRightBackward()
    setLeftBackward()
    pwm.ChangeDutyCycle(power)
    enableMotors()
    sleep(driveTime)
    disableMotors()
    pwm.stop()

def rotateLeft(rotateTime=1, power=50):
    pwm.start(0)
    setRightForward()
    setLeftBackward()
    pwm.ChangeDutyCycle(power)
    enableMotors()
    sleep(rotateTime)
    disableMotors()
    pwm.stop()

def rotateRight(rotateTime=1, power=50):
    pwm.start(0)
    setRightBackward()
    setLeftForward()
    pwm.ChangeDutyCycle(power)
    enableMotors()
    sleep(rotateTime)
    disableMotors()
    pwm.stop()

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
        telemetry['displacement']['x'] = config['velocity'] * sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = -config['velocity'] * cos(telemetry['angle'] * math.pi / 180)
    elif command['instruction'] == "backward":
        driveBackward(abs(cParams['distance']/config['velocity']))
        telemetry['displacement']['x'] = -config['velocity'] * sin(telemetry['angle'] * math.pi / 180)
        telemetry['displacement']['y'] = config['velocity'] * cos(telemetry['angle'] * math.pi / 180)
    elif command['instruction'] == "rotate":
        angleTime = abs(cParams['angle']/config['angularVelocity'])
        telemetry['angle'] += cParams['angle']
        if cParams['angle'] < 0:
            rotateRight(angleTime)
        else:
            rotateLeft(angleTime)

while True:
    currentFeed = requests.get(config['feedURL']).json()
    if not currentFeed['waitingForPi']:
        sleep(0.2)
        continue

    if len(currentFeed['commands']) > len(commandHistory):
        for command in currentFeed['commands'][len(commandHistory):]:
            commandHistory.append(command)
            executeCommand(command)
        telemetryResponder.sendTelemetry(telemetry, config['postURL'])

    sleep(0.1)
