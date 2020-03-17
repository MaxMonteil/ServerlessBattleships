import Game from './classes/Game.js'

const SERVER = {
  url: 'http://localhost:5000/api',
  version: 'v1'
}

const detailsNodes = {
  lobby: '#lobby',
}

const shipBoardData = {
  size: 300,
  canvas: '#ships_canvas',
  section: '#ships_board',
  shipBoardInputs: 'ships_board_info',
  orientationDisplay: 'alignment',
  shipSelectForm:  'ship_select_form',
  endShipPlacementForm: 'ship_board_form'
}

const attacksBoardData = {
  size: 500,
  canvas: '#attacks_canvas',
  section: '#attacks_board',
}

function run () {
  new Game(detailsNodes, shipBoardData, attacksBoardData, SERVER).start()
}

window.onload = run
