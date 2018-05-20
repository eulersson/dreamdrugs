import os
import logging
import time

from flask import Flask, request
from dreambox.times import TimesModel
from dreambox.glitch import GlitchModel
from dreambox.inception5h import Inception5hModel

ADDR = "0.0.0.0"
PORT = int(os.getenv('FLASKPORT', '4000'))
DEBUG = bool(int(os.getenv('DEBUG', '1')))

app = Flask('dreambox')

if DEBUG:
    app.logger.setLevel(logging.INFO)

timesTenModel = TimesModel(10)
glitchModel = GlitchModel()
inception5hModel = Inception5hModel()


@app.route('/newimage')
def new_image():
    impath = request.args.get('image', type=str)
    outimpath = inception5hModel.run(impath)
    return outimpath


@app.route('/timesten')
def timesten():
    x = request.args.get('x', type=float)
    result = timesTenModel.calculate(x)
    return "Result is {}".format(result)


if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)
