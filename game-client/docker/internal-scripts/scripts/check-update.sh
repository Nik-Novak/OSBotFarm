#!/bin/bash

cd $BASEDIR

echo "Checking for DreamBot updates..."
(cd /tmp && curl -L https://dreambot.org/DBLauncher.jar -O)
if [ $(cmp /tmp/DBLauncher.jar DreamBot/DBLauncher.jar) ] 
then
  echo "DreamBot was out of date, updating..."
  mv /tmp/DBLauncher.jar DreamBot/DBLauncher.jar
  chmod +x DreamBot/DBLauncher.jar
  echo "DreamBot updated successfully!"
else
  rm /tmp/DBLauncher.jar
  echo "DreamBot was already up-to-date."
fi