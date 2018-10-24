import requests
import json

headers = {
    'Content-Type': 'application/json',
}

sender = {
    'identifier': 'rpi.local',
    'type': 'telemetry'
}

def sendTelemetry(telemetry, url):
    telemetry["sender"] = sender
    response = requests.post(url, headers=headers, data=json.dumps(telemetry))
    return response
