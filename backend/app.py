from flask import Flask, request
from dreambox.times import Model as TimesModel

app = Flask(__name__)
timesTenModel = TimesModel(10)

@app.route('/')
def index():
    return "Hello from the backend!"

@app.route('/timesten')
def timesten():
    x = request.args.get('x', type=float)
    result = timesTenModel.calculate(x)
    return "Result is {}".format(result)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)
