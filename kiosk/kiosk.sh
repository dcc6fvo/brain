#!/bin/bash

export DISPLAY=:0

xset s noblank
xset s off
xset -dpms

data=$(date)

if pgrep -x unclutter >/dev/null
then
	echo "$data unclutter already running" >> /home/###/kiosk.log
else
	echo "$data starting unclutter" >> /home/###/kiosk.log
	unclutter -idle 0.5 -root &
fi


if pgrep -x chromium-browser >/dev/null
then
	echo "$data chromium already running" >> /home/###/kiosk.log
else
	echo "$data starting chromium" >> /home/###/kiosk.log
	sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/###/.config/chromium/Default/Preferences
	sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/###/.config/chromium/Default/Preferences

	sudo -u ### /usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk --disable-pinch --overscroll-history-navigation=0
	#/usr/bin/chromium-browser --incognito --noerrdialogs --disable-infobars --kiosk --disable-pinch --overscroll-history-navigation=0
	#/usr/bin/chromium-browser --noerrdialogs --disable-infobars
fi
