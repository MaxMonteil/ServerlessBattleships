import Bitmap from './Bitmap.js'
import Board from './Board.js'

const CLICK_EVENT = 'attack-board-clicked'

export default class AttacksBoard extends Board {
  constructor (api, gridDimensions, fill, stroke, options) {
    super(options.size, gridDimensions, fill, stroke, options.canvas, CLICK_EVENT)

    this.api = api

    this.isTurn = false
    this.gameOver = false

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

    this.canvas.addEventListener(CLICK_EVENT, this.gameTurn())
  }

  gameTurn () {
    return async ({ detail: clickedSquare }) => {
      // Player already attacked this square or it is not their turn
      if (this.attackMap.bits[clickedSquare] || !this.isTurn) {
        this.squares[clickedSquare].flash('red')
        return
      }

      this.setTurn(false)

      const map = this.getAttackAsMap(clickedSquare)
      this.attackMap.update(Bitmap.OR(this.attackMap, map).bitString)
      super.drawMap(map, { fill: 'black' })

      const enemyShips = new Bitmap(await this.api.sendAttack(map.bitString))
      this.gameOver = this.attackHitOrMiss(enemyShips)

      if (this.isGameWon(enemyShips)) {
        this.gameOver = await this.finishGame(true)
      }

      if (!this.gameOver) {
        this.api.pollForTurn(async () => {
          const winnerID = await this.api.getWinStatus()

          if (winnerID !== null && winnerID !== this.api.credentials.player) {
            this.finishGame(false)
            await this.api.endGame()
          } else {
            this.setTurn(true)
          }
        }, { immediate: true })
      }
    }
  }

  attackHitOrMiss (enemyShips) {
    this.hitMap.update(Bitmap.AND(enemyShips, this.attackMap).bitString)
    this.missMap.update(Bitmap.AND(Bitmap.NOT(enemyShips), this.attackMap).bitString)

    super.drawMap(this.hitMap, { fill: 'coral' })
    super.drawMap(this.missMap, { fill: 'lightblue' })
  }

  async finishGame (isWinner) {
    if (isWinner) {
      await this.api.setWinStatus()

      super.drawMap(this.hitMap, { fill: 'mediumseagreen' })
      this.turnDisplay.style.color = 'mediumseagreen'
      this.turnDisplay.innerText = 'You Won!'

      return true
    } else {
      this.turnDisplay.style.color = 'indianred'
      this.turnDisplay.innerText = 'You Lost...'

      return false
    }
  }

  isGameWon (enemyShips) {
    return Bitmap.EQ(Bitmap.AND(enemyShips, this.attackMap), enemyShips)
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
