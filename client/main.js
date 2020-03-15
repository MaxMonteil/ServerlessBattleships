import Game from './classes/Game.js'

const SERVER = {
  url: 'http://localhost:5000/api',
  version: 'v1'
}

const shipBoardData = {
  canvas: '#ships_canvas',
  shipBoardInputs: 'ships_board_info',
  orientationDisplay: 'alignment',
  shipSelectForm:  'ship_select_form',
  endShipPlacementForm: 'ship_board_form'
}

function run () {
  new Game(500, 10, shipBoardData, SERVER)
    .start()
}

window.onload = run
