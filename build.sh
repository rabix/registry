#!/bin/sh

DIR=/data/app/registry

echo " ******* Starting build.. ******* "

cd $DIR

pwd

git checkout .
git pull origin master

cd client

pwd

npm-cache install

grunt

cd ..

cd server

pwd

npm-cache install

cd static
bower install
cd ..

grunt build-static
grunt docs

cd ..

pwd

echo "Frontend build done, starting application.."

echo "******* Build ended.. ******* "
