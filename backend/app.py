import logging
import math
import os
import threading
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
    # Data from POST request as JSON.
    data = request.get_json()

    # Get the model instance.
    model = MODELS[data.pop('model')]()

    # Run on a thread so it does not block.
    # TODO: Think properly how to handle backend errors.
    input_image_path = data.pop('image')
    process = threading.Thread(
        target=model.run,
        args=(input_image_path,),
        kwargs=data
    )
    process.start()

    return str(model.job_id)


@app.route('/getResult', methods=['GET'])
def getResult():
    job_id = request.args.get('jid', type=int)
    return '/uploads/%s.jpg' % job_id


# TODO: Instead of running this with python, use the flask wrapper script.
if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)

