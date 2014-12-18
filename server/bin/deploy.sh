#!/bin/bash -e

BASEDIR=$(readlink -m "$(dirname $(readlink -e $0))/..")
START_DIR=`pwd`

npm install -g forever

cd $BASEDIR
echo "Installing dependencies"

npm install

cd $START_DIR
echo "Done."
