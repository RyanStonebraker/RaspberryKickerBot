import requests
import json

headers = {
    'Content-Type': 'application/json',
}

data = {
    'sender': {
        'identifier': 'rpi',
        'type': 'telemetry'
    },

    'instruction': 'forward',
    'parameters': {
        "distance": 10
    }
}
url = 'http://localhost:5000/telemetry/post'
response = requests.post(url, headers=headers, data=json.dumps(data))
print(response)
