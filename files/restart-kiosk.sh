#!/bin/bash
pidof chromium-browser-v7 > /dev/null
if [[ $? -ne 0 ]] ; then
	echo "$(date) Restarting kiosk.sh" >> /home/suporte/kiosk.log
        sudo -u suporte /bin/bash /home/suporte/kiosk.sh 
else
	echo "$(date) kiosk.sh is running. notthing to do.." >> /home/suporte/kiosk.log
fi
