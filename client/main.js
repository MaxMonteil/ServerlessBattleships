import Game from './classes/Game.js'

const SERVER = {
  url: 'http://localhost:5000/api',
  version: 'v1'
}

const shipBoardData = {
  shipBoardInputs: 'ships_board_info',
  orientationDisplay: 'alignment',
  shipSelectForm:  'ship_select_form',
  endShipPlacementForm: 'ship_board_form'
}

function run () {
  const game = new Game(500, 10, '#canvas', shipBoardData, SERVER)

  game.start()
}

window.onload = run
