#!/bin/bash
pidof chromium-browser-v7 > /dev/null
if [[ $? -ne 0 ]] ; then
	echo "$(date) Restarting kiosk.sh" >> /home/###/kiosk.log
        sudo -u ### /bin/bash /home/###/kiosk.sh 
else
	echo "$(date) kiosk.sh is running. notthing to do.." >> /home/###/kiosk.log
fi
