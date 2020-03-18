import Game from './classes/Game.js'

// IDs of HTML elements for referencing during the game
const detailsNodes = {
  game: 'game_info',
  lobby: 'lobby',
  placementWait: 'placement_wait',
}

const shipBoardData = {
  size: 300,
  id: {
    canvas: 'ships_canvas',
    section: 'ships_board',
    shipBoardInputs: 'ships_board_info',
    orientationDisplay: 'alignment',
    shipSelectForm: 'ship_select_form',
    endShipPlacementForm: 'ship_board_form',
  },
}

const attacksBoardData = {
  size: 500,
  id: {
    canvas: 'attacks_canvas',
    section: 'attacks_board',
    turnDisplay: 'turn_display',
  },
}

function run () {
  new Game(detailsNodes, shipBoardData, attacksBoardData).start()
}

window.onload = run
