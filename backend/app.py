import os
from flask import Flask, request
from dreambox.times import TimesModel
from dreambox.glitch import GlitchModel

ADDR = "0.0.0.0"
PORT = int(os.getenv('FLASKPORT', '4000'))
DEBUG = bool(int(os.getenv('DEBUG', '1')))

app = Flask(__name__)
timesTenModel = TimesModel(10)
glitchModel = GlitchModel()

@app.route('/')
def index():
    return "Hello from the backend!"

@app.route('/newimage')
def new_image():
    impath = request.args.get('image', type=str)
    outimpath = glitchModel.run(impath)
    return "New image path is {}".format(outimpath)

@app.route('/timesten')
def timesten():
    x = request.args.get('x', type=float)
    result = timesTenModel.calculate(x)
    return "Result is {}".format(result)


if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)
