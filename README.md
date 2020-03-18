# Serverless Battleships

This project is an assignment for our CMPS 297R: Cloud Computing course. The main aim is to create the battleship game using serverless technologies. The course recommends using Microsoft's Azure services and so that is what we'll use.

Building this game will happen over two distinct "phases".

First is recreating the main game itself which includes ship placement, 2 players connecting, sending attacks at each other, and so on. This phase would need a basic server to at least enable ad-hoc multiplayer. For this project, we chose to make the game using pure Javascript (a framework was deemed overkill) for the client side, and Python for the server.

One particularity of the assignment is that the game is supposed to maintain state using a file system instead of a database. The main logic behind that can also be implemented in the first phase.

The second phase involves the actual deployement of the game. The back-end will be divided and deployed to Azure using cloud functions. The front-end will be bundled and deployed to Netlify for a free option.

## Getting Started

### Prerequisites

Have [pipenv](https://pipenv.readthedocs.io/) installed on your machine in order to easily set up the server.

For the client I recommend installing [live-server](https://www.npmjs.com/package/live-server) to run the game in the browser. It also has the advantage of checking for file changes and automatically reloading the site for you.

### Installing

Clone the project.
```
git clone git@github.com:MaxMonteil/ServerlessBattleships.git && cd ServerlessBattleships
```

Install client side dependencies
```
cd client
npm install
```

Install server side dependencies
```
pipenv install
```

### Running

You will need 2 terminals.

In the `client` folder run `live-server`.

In the `server` folder run `pipenv run python devServer.py` or start the python shell first with `pipenv shell` then run `python devServer.py`.

## To Do

* [x] Display grid with HTML canvas
* [x] Implement game logic
* [x] Connect 2 players and maintain multiple games
* [ ] Use files to maintain game state
* [ ] Deploy server to Azure
* [ ] Deploy game to Netlify

### Nice to have

* [ ] Make the game responsive

## Built With

* HTML Canvas
* Javascript
* Python

## Acknowledgments

The design of the game is inspired from [this](https://upload.wikimedia.org/wikipedia/commons/e/e4/Battleships_Paper_Game.svg) image from the Wikipedia page about the Battleship game. All rights belong to Samuel Bednar
