#!/bin/bash

if [ -z "$1" ]
then
  echo "No login au file specified. Usage: ./install-script.sh <au-file> <repo> <branch>"
  exit 2
fi
if [ -z "$2" ]
then
  echo "No repository URL specified. Usage: ./install-script.sh <authentication> <repository> <branch>"
  exit 2
fi
if [ -z "$3" ]
then
  echo "No branch was speciifed specified for the given script. Usage: ./install-script.sh <authentication> <repository> <branch>"
  exit 2
fi

mkdir -p "$DBHOME/Scripts"
cd "$DBHOME/Scripts"

au=$1
repoURL=$2
branchName=$3

read -r u p < $au

cloneURL=$(sed -e "s^//^//$u:$p@^" <<<$repoURL)
git clone --single-branch --branch $branchName $cloneURL

folder=$(basename $repoURL)
folder=${folder%%.git}

cp $folder/*.jar ./
rm -rf $folder