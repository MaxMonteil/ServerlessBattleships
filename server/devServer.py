from Classes import Lobby, Game
from flask import Flask, jsonify, request

app = Flask(__name__)
app.config["DEBUG"] = True


@app.route("/api/v1/game", methods=["GET"])
def api_lobby():
    game_id, player_id = Lobby.get_waiting_game()

    return jsonify({"game": game_id, "player": player_id}), 200


@app.route("/api/v1/shipmap", methods=["GET", "POST"])
def api_shipmap():
    game_id = request.args["game"]
    player_id = int(request.args["player"])

    game = Game.load_from_save(game_id)

    if request.method == "GET":
        return jsonify(game.players[int(not player_id)].shipmap), 200
    else:
        game.save_ships(player_id, request.json)
        return jsonify({"endpoint": request.base_url}), 201


@app.route("/api/v1/attack", methods=["GET", "POST"])
def api_attack():
    game_id = request.args["game"]
    player_id = int(request.args["player"])

    game = Game.load_from_save(game_id)

    if request.method == "GET":
        return jsonify(game.players[int(not player_id)].attackmap), 200
    else:
        if game.players[player_id].turn:
            game.save_attacks(player_id, request.json)
            game.next_turn()

            return jsonify({"endpoint": request.base_url}), 201
        else:
            return jsonify({"message": "Not player's turn"}), 300


@app.route("/api/v1/win", methods=["GET", "POST"])
def api_game_won():
    game_id = request.args["game"]
    player_id = int(request.args["player"])

    game = Game.load_from_save(game_id)

    if request.method == "GET":
        return jsonify(game.get_winner()), 200
    else:
        game.set_winner(player_id)
        return jsonify({"endpoint": request.base_url}), 201


@app.route("/api/v1/end_game", methods=["DELETE"])
def api_end_game():
    game_id = request.args["game"]
    Lobby.end_game(game_id)

    return jsonify(True), 200


@app.route("/api/v1/quit_game", methods=["POST"])
def api_quit_game():
    game_id = request.args["game"]
    Lobby.end_game(game_id)

    return jsonify(True), 200


@app.route("/api/v1/poll_players", methods=["GET"])
def api_poll_players():
    """Check if the game has 2 players."""

    game_id = request.args["game"]
    player_id = int(request.args["player"])

    game = Game.load_from_save(game_id)

    return jsonify(game.check_game_full(player_id)), 200


@app.route("/api/v1/poll_ready", methods=["GET"])
def api_poll_ready():
    game_id = request.args["game"]
    game = Game.load_from_save(game_id)

    return jsonify(game.check_players_ready()), 200


@app.route("/api/v1/poll_turn", methods=["GET"])
def api_poll_turn():
    game_id = request.args["game"]
    player_id = int(request.args["player"])

    game = Game.load_from_save(game_id)

    return jsonify(game.check_turn(player_id)), 200


@app.after_request
def add_header(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response


app.run()
