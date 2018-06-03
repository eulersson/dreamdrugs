import logging
import math
import os
import time

from flask import Flask, request

from dreambox.progress import ProgressThread
from dreambox.inception5h import Inception5hModel

ADDR = "0.0.0.0"
PORT = int(os.getenv('FLASKPORT', '4000'))
DEBUG = bool(int(os.getenv('DEBUG', '1')))
LEVEL = logging.DEBUG if DEBUG else logging.INFO
FMT = '%(asctime)s [%(name)s] %(levelname)s - %(module)s.%(funcName)s:%(lineno)s %(message)s'
PROGRESS = None # TODO: make this a dictionary of key (id) value progress

# Initialize a Flask application.
app = Flask('dreambox')

# Configure flask werkzeug logger.
app.logger.setLevel(LEVEL)

# Setup dreambox logger with a stream and file handler.
dreambox_log = logging.getLogger('dreambox')
dreambox_log.setLevel(LEVEL)
fmt = logging.Formatter(FMT)
ch = logging.StreamHandler()
fh = logging.FileHandler('backend.log')
ch.setFormatter(fmt)
fh.setFormatter(fmt)
dreambox_log.addHandler(ch)
dreambox_log.addHandler(fh)

# Construct model instances.
MODELS = {
    'inception5h': Inception5hModel()
}


@app.route('/dream')
def dream():
    """Loads the passed image, processes it and returns a new one (as path)."""
    # Get the model instance.
    image_path = request.args.get('image', type=str)
    model_name = request.args.get('model', type=str)
    model = MODELS[model_name]

    # Thread to monitor the progress. See the /progress endpoint.
    global PROGRESS
    PROGRESS = ProgressThread(model)
    PROGRESS.start()

    # Values come as strings from the url, we need to sanitize accordingly
    # based on their type counterparts in javascript.
    def sanitize(value):
        if value.replace('.', '', 1).isdigit():
            return float(value) if '.' in value else int(value)

        js_map = {
            'false': False,
            'true': True,
            'undefined': None
        }
        return js_map[value] if value in js_map.keys() else value

    # Prepare the kwargs to pass to the model's run function.
    kwargs = {}
    for key, value in request.args.items():
        if key not in ['image', 'model']:
            kwargs[key] = sanitize(value)

    try:
        result_image_path = model.run(image_path, **kwargs)
    except:
        model.set_error_state() # sets progress to 999
        raise

    return result_image_path


@app.route('/progress')
def progress():
    """Queries the progress from the model. To be used in the frontend."""
    progress = str(int(round(PROGRESS.progress))) if PROGRESS else "0"
    if progress in ['100', '999']: # 999 means the backend errored
        MODELS['inception5h'].reset_progress()
        PROGRESS.reset_progress()

    return progress


if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)

