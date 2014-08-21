#!/bin/sh

PATH=/home/filip/registry

service rabix-registry stop

echo " ******* Starting build.. ******* "


cd $PATH

git checkout .
git pull origin master

cd client

grunt

cd ..

service rabix-registry start

echo "******* Build ended.. ******* "
