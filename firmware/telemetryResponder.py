import requests
import json

# headers = {
#     'Content-Type': 'application/json',
# }

sender = {
    'identifier': 'rpi.local',
    'type': 'telemetry'
}
#
# telemetry = {
#     'sender': {
#         'identifier': 'rpi.local',
#         'type': 'telemetry'
#     },
#     'displacement': {
#         'x': 0,
#         'y': 0
#     },
#     'angle': 0,
#     'ultrasonic': 0
# }
# url = 'http://localhost:5000/telemetry/post'
# response = requests.post(url, headers=headers, data=json.dumps(telemetry))
# print(response)

def sendTelemetry(telemetry, url):
    telemetry["sender"] = sender
    response = requests.post(url, headers=headers, data=json.dumps(telemetry))
    return bool(response)
