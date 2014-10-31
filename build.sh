#!/bin/sh

DIR=/data/app/registry

service rabix-registry stop

echo " ******* Starting build.. ******* "


cd $DIR

git checkout .
git pull origin master

cd client


npm install

bower install

grunt

cd ..

cd server

npm install

cd ..

pwd

echo "Frontend build done"

service rabix-registry start

echo "******* Build ended.. ******* "
