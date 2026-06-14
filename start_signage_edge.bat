@echo off
echo Starting Prime Exchange Display in Kiosk Mode using Microsoft Edge...
start msedge --kiosk --start-fullscreen --autoplay-policy=no-user-gesture-required "http://localhost:5173"
exit
