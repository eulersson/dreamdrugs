#!/bin/sh
docker rmi $(docker images -aq -f "dangling=true")
