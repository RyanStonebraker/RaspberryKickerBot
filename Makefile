start:
	node api/server.js & sleep 2 && python3 firmware/commandMonitor.py && electron . &

simulation:
	node api/server.js & sleep 2 && python3 firmware/simulator.py & electron . &

electron:
	electron . &

stop:
	killall node 2> /dev/null && killall python3 2> /dev/null && killall electron 2> /dev/null
