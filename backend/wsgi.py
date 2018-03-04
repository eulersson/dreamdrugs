from app import app
from app import DEBUG, ADDR, PORT

if __name__ == "__main__":
    app.run(debug=True, host=ADDR, port=PORT)
