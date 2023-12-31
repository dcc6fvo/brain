#!/bin/bash

export DISPLAY=:0

xset s noblank
xset s off
xset -dpms

data=$(date)

if pgrep -x unclutter >/dev/null
then
	echo "$data unclutter already running" >> /home/suporte/kiosk.log
else
	echo "$data starting unclutter" >> /home/suporte/kiosk.log
	unclutter -idle 0.5 -root &
fi


if pgrep -x chromium-browse >/dev/null
then
	echo "$data chromium already running" >> /home/suporte/kiosk.log
else
	echo "$data starting chromium" >> /home/suporte/kiosk.log
	sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/suporte/.config/chromium/Default/Preferences
	sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/suporte/.config/chromium/Default/Preferences

	/usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk --disable-pinch --overscroll-history-navigation=0
	#/usr/bin/chromium-browser --incognito --noerrdialogs --disable-infobars --kiosk --disable-pinch --overscroll-history-navigation=0
	#/usr/bin/chromium-browser --noerrdialogs --disable-infobars
fi
