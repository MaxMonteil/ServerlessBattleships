from pathlib import Path
from uuid import uuid4

LOBBY_DIR = Path("./lobby")
SAVE_FILES_PATH = Path("./games")


class Lobby:
    """Handle pending games"""

    @classmethod
    def get_waiting_game(self):
        try:
            lobby = [game.name for game in LOBBY_DIR.iterdir()]
        except FileNotFoundError:
            LOBBY_DIR.mkdir(exist_ok=True)
            lobby = []

        if len(lobby) == 0:
            game = Game()
            LOBBY_DIR.joinpath(game.id).touch()

            return game.id, Player.number_one
        else:
            game_id = lobby.pop()
            LOBBY_DIR.joinpath(game_id).unlink()
            game = Game.load_from_save(game_id)
            game.add_player()

            return game_id, Player.number_two

    @classmethod
    def end_game(self, game_id):
        """Removing the game file ends the game"""
        SAVE_FILES_PATH.joinpath(game_id).unlink()


class Game:
    def __init__(
        self, game_id=str(uuid4())[:8], players=[], save=True,
    ):
        SAVE_FILES_PATH.mkdir(parents=True, exist_ok=True)

        self.id = game_id
        self.players = players
        if len(players) == 0:
            self.players.append(Player(Player.number_one, turn=True))

        self._write_save_file()

    def check_game_full(self, player_id):
        return player_id == Player.number_two or len(self.players) == 2

    def check_players_ready(self):
        return [p.ships_ready for p in self.players].count(True) == len(self.players)

    def check_turn(self, player_id):
        return self.players[player_id].turn

    def next_turn(self):
        for player in self.players:
            player.turn = not player.turn

        self._write_save_file()

    def get_winner(self):
        for i, player in enumerate(self.players):
            if player.winner:
                return i

    def set_winner(self, player_id):
        for i, player in enumerate(self.players):
            player.winner = i == player_id
            player.game_over = True

        self._write_save_file()

    def add_player(self):
        if len(self.players) == 1:
            self.players.append(Player(Player.number_two))
            with open(SAVE_FILES_PATH.joinpath(self.id), "a") as f:
                f.write(str(self.players[-1]) + "\n")

    def save_ships(self, player_id, shipmap):
        self.players[player_id].shipmap = shipmap
        self._write_save_file()

    def save_attacks(self, player_id, attackmap):
        self.players[player_id].attackmap = attackmap
        self._write_save_file()

    def _write_save_file(self):
        with open(SAVE_FILES_PATH.joinpath(self.id), "w") as f:
            for player in self.players:
                f.write(str(player) + "\n")

    @classmethod
    def load_from_save(self, game_id):
        with open(SAVE_FILES_PATH.joinpath(game_id), "r") as f:
            lines = f.read()
        players = [Player.from_save(player) for player in lines.splitlines()]

        return Game(game_id, players, save=False)


class Player:
    number_one = 0
    number_two = 1

    def __init__(
        self,
        player,
        turn=False,
        game_over=False,
        winner=False,
        ships_ready=False,
        shipmap="0" * 100,
        attackmap="0" * 100,
    ):
        self.player = player
        self.turn = turn
        self.game_over = game_over
        self.winner = winner
        self.ships_ready = ships_ready
        self._shipmap = shipmap
        self.attackmap = attackmap

    @property
    def shipmap(self):
        return self._shipmap

    @shipmap.setter
    def shipmap(self, value):
        self.ships_ready = True
        self._shipmap = value

    @classmethod
    def from_save(self, parameter_list):
        """Turn all the bool like strings into proper types"""
        parameters = parameter_list.split(",")
        return Player(
            player=int(parameters[0]),
            turn=bool(int(parameters[1])),
            game_over=bool(int(parameters[2])),
            winner=bool(int(parameters[3])),
            ships_ready=bool(int(parameters[4])),
            shipmap=parameters[5],
            attackmap=parameters[6],
        )

    def __str__(self):
        """
        String representation of a player for writing to storage.

        CSV Format:
            player number, turn?, win?, winner, ready?, shipmap, attackmap
        """
        return ",".join(
            [
                str(self.player),
                str(int(self.turn)),
                str(int(self.game_over)),
                str(int(self.winner)),
                str(int(self.ships_ready)),
                self.shipmap,
                self.attackmap,
            ]
        )
