import os
import logging
import time

from flask import Flask, request
from dreambox.times import TimesModel
from dreambox.glitch import GlitchModel

ADDR = "0.0.0.0"
PORT = int(os.getenv('FLASKPORT', '4000'))
DEBUG = bool(int(os.getenv('DEBUG', '1')))

app = Flask('dreambox')

if DEBUG:
    app.logger.setLevel(logging.INFO)

timesTenModel = TimesModel(10)
glitchModel = GlitchModel()


@app.route('/newimage')
def new_image():
    impath = request.args.get('image', type=str)
    impath = glitchModel.initialize(impath)
    outimpath = glitchModel.run(impath)
    time.sleep(2)
    return outimpath


@app.route('/timesten')
def timesten():
    x = request.args.get('x', type=float)
    result = timesTenModel.calculate(x)
    return "Result is {}".format(result)


if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)
