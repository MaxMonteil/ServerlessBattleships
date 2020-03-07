import Game from './Game.js'

function run () {
  const game = new Game(500, 10, '#canvas', '#alignment')
  game.start()

  // ROTATION
  window.addEventListener('keydown', e => {
    if (String.fromCharCode(e.keyCode) === 'R') game.rotateSelectedShip()
  })

  const shipSelectForm = document.forms['ship_select_form']
  shipSelectForm.addEventListener('submit', e => {
    e.preventDefault()
    game.selectShip(e.target, 'ship_select')
    game.updateOrientation()
  })
}

window.onload = run
