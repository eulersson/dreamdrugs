#!/bin/sh
if [ $DEBUG = 1 ]; then
  python app.py
else
  gunicorn -b ":${GUNICORNPORT}" run:app
fi
