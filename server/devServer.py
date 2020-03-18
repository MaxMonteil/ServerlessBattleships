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


def next_turn(gameID):
    games[gameID]["turn"] = int(not games[gameID]["turn"])


def get_waiting_game():
    if len(lobby) == 0:
        gameID = str(uuid4())[:8]
        games[gameID] = {
            "turn": 0,
            "winner": None,
            "players": [new_player()],
        }
        lobby.append(gameID)

        return gameID, Player.ONE
    else:
        gameID = lobby.pop()
        games[gameID]["players"].append(new_player())

        return gameID, Player.TWO


@app.route("/api/v1/game", methods=["GET"])
def api_lobby():
    gameID, playerID = get_waiting_game()

    return jsonify({"game": gameID, "player": playerID.value}), 200


@app.route("/api/v1/shipmap", methods=["GET", "POST"])
def api_shipmap():
    gameID = request.args["game"]
    playerID = int(request.args["player"])

    if request.method == "GET":
        return jsonify(games[gameID]["players"][playerID]["shipmap"]), 200
    else:
        games[gameID]["players"][playerID]["shipmap"] = request.json
        return jsonify({"endpoint": request.base_url}), 201


@app.route("/api/v1/attack", methods=["GET", "POST"])
def api_attack():
    gameID = request.args["game"]
    playerID = int(request.args["player"])

    if request.method == "GET":
        return jsonify(games[gameID]["players"][int(not playerID)]["attack"]), 200
    else:
        if games[gameID]["turn"] == playerID:
            games[gameID]["players"][playerID]["attack"] = request.json
            next_turn(gameID)

            return jsonify(games[gameID]["players"][int(not playerID)]["shipmap"]), 201
        else:
            return jsonify({"message": "Not player's turn"}), 300


@app.route("/api/v1/win", methods=["GET", "POST"])
def api_game_won():
    gameID = request.args["game"]
    playerID = int(request.args["player"])

    if request.method == "GET":
        return jsonify(games[gameID]["winner"]), 200
    else:
        games[gameID]["winner"] = playerID
        return jsonify({"endpoint": request.base_url}), 201


@app.route("/api/v1/end_game", methods=["DELETE"])
def api_end_game():
    gameID = request.args["game"]
    games.pop(gameID, None)

    return jsonify(True), 200


@app.route("/api/v1/poll_players", methods=["GET"])
def api_poll_players():
    """Check if the game has 2 players."""

    gameID = request.args["game"]
    playerID = int(request.args["player"])

    return jsonify(
        playerID == Player.TWO.value or
        len(games[gameID]["players"]) == 2
    ), 200


@app.route("/api/v1/poll_ready", methods=["GET"])
def api_poll_ready():
    gameID = request.args["game"]
    playerID = int(request.args["player"])

    return jsonify(
        games[gameID]["players"][int(not playerID)]["shipmap"] is not None
    ), 200


@app.route("/api/v1/poll_turn", methods=["GET"])
def api_poll_turn():
    gameID = request.args["game"]
    playerID = int(request.args["player"])

    return jsonify(games[gameID]["turn"] == playerID), 200


@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    return response


app.run()
