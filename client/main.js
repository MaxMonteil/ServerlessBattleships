import Game from './classes/Game.js'
require('dotenv').config()

const SERVER = {
  url: 'http://localhost:5000/api',
  version: 'v1',
}

const detailsNodes = {
  game: 'game_info',
  lobby: 'lobby',
  placementWait: 'placement_wait',
}

const shipBoardData = {
  size: 300,
  canvas: '#ships_canvas',
  section: '#ships_board',
  shipBoardInputs: 'ships_board_info',
  orientationDisplay: 'alignment',
  shipSelectForm: 'ship_select_form',
  endShipPlacementForm: 'ship_board_form',
  placementWait: 'placement_wait',
}

const attacksBoardData = {
  size: 500,
  canvas: '#attacks_canvas',
  section: '#attacks_board',
  turnDisplay: '#turn_display',
}

function run () {
  new Game(detailsNodes, shipBoardData, attacksBoardData, SERVER).start()
}

window.onload = run
