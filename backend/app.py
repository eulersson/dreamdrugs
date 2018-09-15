import json
import logging
import os
import threading

from flask import Flask, request

# Create globals based on received environment.
ADDR = "0.0.0.0"
PORT = int(os.getenv('FLASKPORT', '4000'))
DEBUG = bool(int(os.getenv('DEBUG', '1')))
LEVEL = logging.DEBUG if DEBUG else logging.INFO

# Initialize a Flask application.
app = Flask('dreambox')

# Configure flask werkzeug logger.
app.logger.setLevel(LEVEL)

# Setup 'dreambox' logger.
from dreambox.logging import setup_logging
log = setup_logging(LEVEL)

# Import models.
from dreambox.inception5h import Inception5hModel

# Map for the available models. Keys are what gets passed as URL parameters.
MODELS = {
    'inception5h': Inception5hModel
}


@app.route('/dream', methods=['POST'])
def dream():
    """
    Feeds an image to one of the available models. To control what model you
    want to use simply specify it as 'model' in the JSON data object of
    this POST request. To know which ones to use have a look at the global
    variable MODELS in this module.

    The image is read from the 'image' property of the POSTed JSON data object.

    The rest of key-values items from the POSTed JSON data it gets fed into the
    model's run function as keyword arguments. So that way you have access to
    the parameters of the algorithm a frontend.
    """
    # Data from POST request as JSON.
    data = request.get_json()
    log.warn(data)

    # Get the model instance and image path.
    model = MODELS[data.pop('model')]()
    input_image_path = data.pop('image')

    def calculate(**kwargs):
        try:
            model.run(input_image_path, **data)
        except Exception as e:
            model.notify_error(str(e))

    # Run on a thread so it does not block.
    process = threading.Thread(target=calculate)

    # Start dreaming!
    process.start()

    # Returns a handle for the frontend app to keep track of the progress.
    return str(model.job_id)


@app.route('/models', methods=['GET'])
def models():
    """
    Returns available models that have implementation.
    """
    return json.dumps(MODELS.keys())


@app.route('/result', methods=['GET'])
def result():
    """
    Given a job ID it returns the image it generated.
    """
    job_id = request.args.get('jid', type=int)
    return '/uploads/%s.jpg' % job_id


@app.route('/signature/<model>', methods=['GET'])
def signature(model):
    """
    Returns the information and constraints for the parameters of a specific
    model. That is used to inform the frontend about the parameters the model
    takes.

    An example of what the data could look like::

        {
            "layer_name": {
                "default": "mixed4a",
                "validation": {
                    "choices": [
                        "mixed4a",
                        "mixed4b"
                    ],
                    "type": "str"
                }
            },
            "num_iterations": {
                "default": 10,
                "validation": {
                    "range": [
                        1,
                        60
                    ],
                    "type": "int"
                }
            }
        }

    """
    signature = MODELS[model].get_signature()
    return json.dumps(signature)


# TODO: Instead of running this with python, use the flask wrapper script.
if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)

