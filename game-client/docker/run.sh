#!/bin/bash
EXT_PORT=$1
if [ -z $1 ]
then
  echo "Must provide an external port for this client to be reached at. (i.e. ./run.sh <port>)"
  exit 1
fi
docker run -it -e GIT_SCRIPT_NAME=rubex/polyester -e GIT_SCRIPT_BRANCH=master -e DISPLAY=:10.0 -e NODE_ENV=deployment -p $EXT_PORT:8000 -v /tmp/.X11-unix:/tmp/.X11-unix:rw images.osrsmillionaires.tk/dreambot-ubuntu $2
