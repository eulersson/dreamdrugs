import base64
import json
import logging
import os
import io
import threading

from flask import Flask, request

# Create globals based on received environment.
ADDR = "0.0.0.0"
PORT = int(os.environ['BACKEND_PORT'])
DEBUG = bool(int(os.getenv('DEBUG', '1')))
LEVEL = logging.DEBUG if DEBUG else logging.INFO

# Initialize a Flask application.
app = Flask('dreamdrugs')

# Configure flask werkzeug logger.
app.logger.setLevel(LEVEL)

# Setup 'dreamdrugs' logger.
from dreamdrugs.logging import setup_logging  # noqa: E402
log = setup_logging(LEVEL)

# Import models.
from dreamdrugs import cancel_job, JobCancelled  # noqa: E402
from dreamdrugs.inception5h import Inception5hModel  # noqa: E402

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
    form_data = dict(request.form)
    log.debug(form_data)

    # Get parameters to be passed to the algorithm.
    parameters = json.loads(request.files['parameters'].read())

    def progress_callback(job_id, progress):
        pass

    # Get the model instance and image path.
    model = MODELS[form_data['model']](progress_callback=progress_callback)

    input_image = io.BytesIO()
    request.files['image'].save(input_image)

    def calculate(**kwargs):
        try:
            model.run(input_image, **parameters)
        except JobCancelled:
            message = 'Job has been cancelled.'
            log.error(message)
            model.notify_error(message)
        except Exception as e:
            log.exception("Errors happened while dreaming.")
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
    return json.dumps(list(MODELS.keys()))


@app.route('/result/<job_id>', methods=['GET'])
def result(job_id):
    """
    Given a job ID it returns the image it generated.
    """
    image_path = f"/uploads/{job_id}.jpg"

    with open(image_path, 'rb') as f:
        result = base64.b64encode(f.read()).decode()

    os.remove(image_path)
    return result


@app.route('/cancel/<job_id>', methods=['POST'])
def cancel(job_id):
    """
    Cancels a running job.
    """
    cancel_job(job_id)
    return 'success %s' % job_id


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
