#!/bin/sh

DIR=/data/app/registry

echo " ******* Starting build.. ******* "

cd $DIR

pwd

git checkout .
git pull origin master

cd client

pwd

npm install

su sbg -c "bower install"

grunt

cd ..

cd server

pwd

npm install

cd static
su sbg -c "bower install"
cd ..

grunt build-static
grunt docs

cd ..

pwd

echo "Frontend build done, starting application.."

echo "******* Build ended.. ******* "
