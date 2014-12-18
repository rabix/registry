#!/bin/bash -e

BASEDIR=$(readlink -m "$(dirname $(readlink -e $0))/..")
START_DIR=`pwd`

npm install -g bower grunt grunt-cli forever

cd $BASEDIR
echo "Preparing backend"

npm install

cd $START_DIR
echo "Done."
