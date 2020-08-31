#!/bin/bash

if [ -z "$1" ]
then
  echo "No login au file specified. Usage: ./install-script.sh <au-file> <repo->"
  exit 2
fi
if [ -z "$2" ]
then
  echo "No repository URL specified. Usage: ./install-script.sh <authentication>"
  exit 2
fi

mkdir -p "$DBHOME/BotData"
cd "$DBHOME/BotData"

au=$1
repoURL=$2

read -r u p < $au

cloneURL=$(sed -e "s^//^//$u:$p@^" <<<$repoURL)
git clone $cloneURL

folder=$(basename $repoURL)
folder=${folder%%.git}

cp $folder/* ./
rm -rf $folder

# Pulling updated db client:
curl 'https://dreambot.org/download/dreambot-latest.jar' -o client.jar