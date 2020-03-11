import Game from './Game.js'

function run () {
  const game = new Game(500, 10, '#canvas',
    {
      orientationDisplay: 'alignment',
      shipSelectForm:  'ship_select_form',
      endShipPlacementForm: 'ship_board_form'
    })

  game.start()
}

window.onload = run
