#!/bin/sh
if [ $NODE_ENV = "development" ]; then
  yarn dev
else
  yarn start
fi
