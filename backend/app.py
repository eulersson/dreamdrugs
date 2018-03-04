import os
from flask import Flask, request
from dreambox.times import Model as TimesModel

ADDR = "0.0.0.0"
PORT = 4000
DEBUG = bool(int(os.getenv('DEBUG', '1')))

app = Flask(__name__)
timesTenModel = TimesModel(10)

@app.route('/')
def index():
    return "Helloo from the backend!"

@app.route('/timesten')
def timesten():
    x = request.args.get('x', type=float)
    result = timesTenModel.calculate(x)
    return "Result is {}".format(result)

if __name__ == '__main__':
    app.run(debug=DEBUG, host=ADDR, port=PORT)
