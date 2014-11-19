#!/bin/sh

DIR=/data/app/staging/registry

sudo service rabix-staging stop

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

cd ..

pwd

echo "Frontend build done, starting application.."

sudo service rabix-staging start

echo "******* Build ended.. ******* "
