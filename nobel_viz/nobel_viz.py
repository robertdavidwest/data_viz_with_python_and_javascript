from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route("/")
def root():
    return send_from_directory(".", "templates/index.html")

@app.route("/d3")
def d3():
    return send_from_directory(".", "templates/d3_testing.html")

if __name__ == '__main__':
    app.run(port=8080, threaded=True)