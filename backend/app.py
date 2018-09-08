import logging
import math
import os
import time

from flask import Flask, request

from dreambox.inception5h import Inception5hModel

ADDR = "0.0.0.0"
PORT = int(os.getenv('FLASKPORT', '4000'))
DEBUG = bool(int(os.getenv('DEBUG', '1')))
LEVEL = logging.DEBUG if DEBUG else logging.INFO
FMT = '%(asctime)s [%(name)s] %(levelname)s - %(module)s.%(funcName)s:%(lineno)s %(message)s'

# Initialize a Flask application.
app = Flask('dreambox')

# Configure flask werkzeug logger.
app.logger.setLevel(LEVEL)

# Setup dreambox logger with a stream and file handler.
log = logging.getLogger('dreambox')
log.setLevel(LEVEL)
fmt = logging.Formatter(FMT)
ch = logging.StreamHandler()
fh = logging.FileHandler('backend.log')
ch.setFormatter(fmt)
fh.setFormatter(fmt)
log.addHandler(ch)
log.addHandler(fh)

# Map for the available models. Keys are what gets passed as URL parameters.
MODELS = {
    'inception5h': Inception5hModel
}


@app.route('/dream', methods=['POST'])
def dream():
    """
    Loads the passed image, processes it and returns a new one (as path).
    """
    # Get the model instance.
    image_path = request.args.get('image', type=str)
    model_name = request.args.get('model', type=str)
    model = MODELS[model_name]()

    # Values come as strings from the url, we need to sanitize accordingly
    # based on their type counterparts in javascript.
    # TODO: instead of passing parameters through URI, we could send a data
    # body and JSONify on frontend so in here we retain the types.
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
    # TODO: optimize by popping first instead of checking in each iteration.
    kwargs = {}
    for key, value in request.args.items():
        if key not in ['image', 'model']:
            kwargs[key] = sanitize(value)

    try:
        # TODO: run this on a thread. So it doesn't block and we can return the job id.
        result_image_path = model.run(image_path, **kwargs)
    except:
        model.set_error_state()
        # TODO: Think properly how to handle backend errors.
        raise

    # TODO: should return the job id for that the execution of the model.
    return result_image_path


# TODO: Figure out a way to return an image given a job id.
@app.route('/getResult', methods=['GET'])
def getResult():
    job_id = request.args.get('jid', type=int)
    return '/uploads/%s.jpg' % job_id


# TODO: Instead of running this with python, use the flask wrapper script.
if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)

