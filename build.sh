#!/bin/sh

DIR=/home/filip/registry

service rabix-registry stop

echo " ******* Starting build.. ******* "


cd $DIR

git checkout .
git pull origin master

cd client

grunt

cd ..

service rabix-registry start

echo "******* Build ended.. ******* "
