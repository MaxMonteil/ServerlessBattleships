import Game from './Game.js'

function run () {
  new Game(500, 10, '#canvas').start()
}

window.onload = run
