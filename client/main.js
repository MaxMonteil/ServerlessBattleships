import Game from './Game.js'

function run () {
  const game = new Game(500, 10, '#canvas')
  game.start()

  const shipSelectForm = document.forms['ship_select_form']
  shipSelectForm.addEventListener('submit', e => {
    e.preventDefault()
    game.selectShip(e.target, 'ship_select')
  })
}

window.onload = run
