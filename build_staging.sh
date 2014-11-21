#!/bin/sh

DIR=/data/app/staging/registry

echo " ******* Starting build.. ******* "

cd $DIR

pwd

cd client

pwd

npm install

su sbg -c "bower install"

grunt

cd ..

cd server

pwd

npm install

cd ..

pwd

echo "Frontend build done, starting application.."

echo "******* Build ended.. ******* "
