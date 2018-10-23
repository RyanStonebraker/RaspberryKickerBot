import requests
from time import sleep
import RPi.GPIO as GPIO

commandHistory = []

GPIO.setmode(GPIO.BOARD)
GPIO.setup(03, GPIO.OUT)
GPIO.setup(05, GPIO.OUT)
GPIO.setup(07, GPIO.OUT)

while True:
    currentFeed = requests.get('http://127.0.0.1:5000/telemetry').json()
    if not currentFeed['waitingForPi']:
        sleep(0.2)
        continue

    if len(currentFeed['commands']) > len(commandHistory):
        for command in currentFeed['commands'][len(commandHistory):]:
            executeCommand(command)

    sleep(0.1)

def driveForward(driveTime=1, power=50):
    pwm.start(0)
    GPIO.output(03, True)
    GPIO.output(05, False)
    pwm.ChangeDutyCycle(power)
    GPIO.output(07, True)
    sleep(driveTime)
    GPIO.output(07, False)
    pwm.stop()

def driveBackward(driveTime=1, power=50):
    pwm.start(0)
    GPIO.output(03, False)
    GPIO.output(05, True)
    pwm.ChangeDutyCycle(power)
    GPIO.output(07, True)
    sleep(driveTime)
    GPIO.output(07, False)
    pwm.stop()

def executeCommand(command):
    cParams = command['parameters']
    if command['instruction'] == "forward":
        driveForward()
        # TODO: drive cParams['distance']
    if commnad['instruction'] == "backward":
        driveBackward()
