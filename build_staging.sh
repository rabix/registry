#!/bin/sh

if [ -n "$1" ]; then
    DIR="$1"
else
    DIR=/data/app/staging/registry
fi

echo " ******* Starting build.. ******* "

cd $DIR

pwd

cd client

pwd

npm-cache install

#su sbg -c "bower install"
#bower install

grunt

cd ..

cd server

pwd

npm-cache install

grunt docs

cd static

#su sbg -c "bower install"
npm-cache install

cd ..

grunt build-static

cd ..

pwd

echo "Frontend build done, starting application.."

echo "******* Build ended.. ******* "
