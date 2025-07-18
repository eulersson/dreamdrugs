#!/bin/sh
if [ $DEBUG = 1 ]; then
  python app.py
else
  gunicorn --workers 2 --bind ":${BACKEND_PORT}" run:app
fi
