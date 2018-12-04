start:
	node api/server.js & electron .

server:
	node api/server.js &

backend:
	python3 firmware/commandMonitor.py &

simulation:
	node api/server.js & sleep 2 && python3 firmware/simulator.py & electron . &

backend_sim:
	python3 firmware/simulator.py

electron:
	electron . &

stop:
	killall node 2> /dev/null && killall python3 2> /dev/null && killall electron 2> /dev/null
