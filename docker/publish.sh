#!/bin/bash
DEFAULT_AUTH_VERSION=v0.0.25

# Check if AUTH_VERSION is set as an argument
if [ -z ${1+x} ]; then
  echo "var is unset, set to $DEFAULT_AUTH_VERSION";
  AUTH_VERSION=$DEFAULT_AUTH_VERSION;
else
  echo "AUTH_VERSION is set to '$1'";
  AUTH_VERSION=$1;
fi

AUTH_VERSION=$AUTH_VERSION docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache auth

docker tag jhart/auth_backend:$AUTH_VERSION jhart/auth_backend:latest            

docker login

docker push jhart/auth_backend:$AUTH_VERSION
docker push jhart/auth_backend:latest
