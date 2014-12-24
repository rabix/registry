#!/bin/sh

DIR=/data/app/registry

sudo service rabix-registry stop

echo " ******* Starting build.. ******* "

cd $DIR

pwd

git checkout .
git pull origin master

cd client

pwd

npm install

bower install

grunt

cd ..

cd server

pwd

npm install

grunt docs

cd ..

pwd

echo "Frontend build done, starting application.."

sudo service rabix-registry start

echo "******* Build ended.. ******* "
