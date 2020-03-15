from enum import Enum
from uuid import uuid4
from flask import Flask, jsonify, request

app = Flask(__name__)
app.config["DEBUG"] = True

lobby = []
games = {}


class Player(Enum):
    ONE = 0
    TWO = 1


def new_player():
    return {
        "shipmap": None,
        "attacks": None,
    }


def get_waiting_game():
    if len(lobby) == 0:
        return None
    else:
        return lobby.pop()


@app.route("/api/v1/game", methods=["GET"])
def api_lobby():
    gameID = get_waiting_game()

    if gameID is None:
        gameID = str(uuid4())[:8]
        lobby.append(gameID)
        games[gameID] = [new_player()]
        playerID = Player.ONE
    else:
        games[gameID].append(new_player())
        playerID = Player.TWO

    return jsonify({"game": gameID, "player": playerID.value}), 200


@app.route("/api/v1/shipmap", methods=["GET", "POST"])
def api_shipmap():
    gameID = request.args["game"]
    playerID = int(request.args["player"])

    if request.method == "GET":
        return jsonify(games[gameID][playerID]["shipmap"]), 200
    else:
        games[gameID][playerID]["shipmap"] = request.json
        return jsonify({"endpoint": request.base_url}), 201


@app.route("/api/v1/attack", methods=["GET", "POST"])
def api_attack():
    gameID = request.args["game"]
    playerID = int(request.args["player"])

    if request.method == "GET":
        return jsonify(games[gameID][playerID]["attack"]), 200
    else:
        games[gameID][playerID]["attack"] = request.json
        return jsonify({"endpoint": request.base_url}), 201


@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response


app.run()
