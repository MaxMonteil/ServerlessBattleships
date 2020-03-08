import Game from './Game.js'

function run () {
  const game = new Game(500, 10, '#canvas', '#alignment', 'ship_select_form')
  game.start()
}

window.onload = run
