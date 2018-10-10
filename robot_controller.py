from gpiozero import Motor
from time import sleep

motor =  Motor(forward=14, backward=15)

while True:
    motor.forward()
    sleep(5)
    motor.backward()
    sleep(5)
