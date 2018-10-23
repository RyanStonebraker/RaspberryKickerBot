import requests
import json

headers = {
    'Content-Type': 'application/json',
}

data = {
    'sender': {
        'identifier': 'rpi.local',
        'type': 'telemetry'
    },
    'displacement': {
        'x': 0,
        'y': 0
    },
    'angle': 0,
    'ultrasonic': 0
}
url = 'http://localhost:5000/telemetry/post'
response = requests.post(url, headers=headers, data=json.dumps(data))
print(response)
