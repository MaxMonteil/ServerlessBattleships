import Bitmap from './Bitmap.js'
import Board from './Board.js'

const CLICK_EVENT = 'attack-board-clicked'

export default class AttacksBoard extends Board {
  constructor (api, gridDimensions, fill, stroke, options) {
    super(options.size, gridDimensions, fill, stroke, options.canvas, CLICK_EVENT)

    this.api = api

    this.isTurn = false

    this.attackMap = new Bitmap('0'.repeat(this.size))
    this.hitMap = new Bitmap('0'.repeat(this.size))
    this.missMap = new Bitmap('0'.repeat(this.size))

    // SETUP
    this.attackSection = document.querySelector(options.section)
    this.turnDisplay = document.querySelector(options.turnDisplay)
  }

  start () {
    this.attackSection.style.visibility = 'visible'
    super.drawBoard()
    if (this.api.credentials.player === 0) {
      this.setTurn(true)
    } else {
      this.setTurn(false)
      this.api.pollForTurn(() => this.setTurn(true), { immediate: true })
    }

    const playerAttack = async ({ detail: clickedSquare }) => {
      // Player already attacked this square
      if (this.attackMap.bits[clickedSquare]) {
        this.squares[clickedSquare].flash('red')
        return
      }

      const map = this.getAttackAsMap(clickedSquare)
      this.attackMap.update(Bitmap.OR(this.attackMap, map).bitString)
      this.drawMap(map)

      this.resolveAttack(await this.api.sendAttack(map.bitString))
      this.setTurn(false)

      this.api.pollForTurn(() => this.setTurn(true), { immediate: true })
    }

    this.canvas.addEventListener(CLICK_EVENT, playerAttack)
  }

  drawMap (map, color = 'black') {
    const bits = map.bits

    for (let i = 0; i < this.attackMap.length; i++) {
      if (bits[i]) this.squares[i].recolor(color)
    }
  }

  resolveAttack (enemyShipsString) {
    const enemyShips = new Bitmap(enemyShipsString)
    this.hitMap.update(Bitmap.AND(enemyShips, this.attackMap).bitString)
    this.missMap.update(Bitmap.AND(Bitmap.NOT(enemyShips), this.attackMap).bitString)

    this.drawMap(this.hitMap, 'coral')
    this.drawMap(this.missMap, 'lightblue')
  }

  getAttackAsMap (square) {
    return new Bitmap('0'.repeat(square) + '1' + '0'.repeat(this.size - (square + 1)))
  }

  setTurn (isTurn) {
    this.isTurn = isTurn

    if (isTurn) {
      this.turnDisplay.style.color = 'coral'
      this.turnDisplay.innerText = 'It\'s your turn!'
    } else {
      this.turnDisplay.style.color = 'gray'
      this.turnDisplay.innerText = 'Other player\'s turn'
    }

  }
}
