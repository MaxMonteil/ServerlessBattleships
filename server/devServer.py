from uuid import uuid4
from flask import Flask, jsonify, request

app = Flask(__name__)
app.config["DEBUG"] = True

players = {}


@app.route("/api/v1/player", methods=["GET"])
def api_player():
    playerID = str(uuid4())[:8]
    players[playerID] = {"shipmap": None}
    return jsonify(playerID), 200


@app.route("/api/v1/shipmap", methods=["GET", "POST"])
def api_shipmap():
    if request.method == "GET":
        return jsonify(players[request.args["player"]]["shipmap"]), 200
    else:
        players[request.args["player"]]["shipmap"] = request.json
        return jsonify({"endpoint": request.base_url}), 201


@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response


app.run()
