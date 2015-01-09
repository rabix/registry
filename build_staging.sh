#!/bin/sh

DIR=/data/app/staging/registry

echo " ******* Starting build.. ******* "

cd $DIR

pwd

cd client

pwd

npm install

su sbg -c "bower install --force"

grunt

cd ..

cd server

pwd

npm install

grunt docs

cd ..

pwd

echo "Frontend build done, starting application.."

echo "******* Build ended.. ******* "
