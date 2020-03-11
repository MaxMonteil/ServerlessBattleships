import Game from './classes/Game.js'

function run () {
  const game = new Game(500, 10, '#canvas',
    {
      shipBoardInputs: 'ships_board_info',
      orientationDisplay: 'alignment',
      shipSelectForm:  'ship_select_form',
      endShipPlacementForm: 'ship_board_form'
    })

  game.start()
}

window.onload = run
