#!/bin/sh
if [ $DEBUG = 1 ]; then
  python app.py
else
  gunicorn --workers 2 --bind ":${GUNICORNPORT}" run:app
fi
