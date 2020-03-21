import ApiService from '../api/ApiService.js'

import Bitmap from './Bitmap.js'
import Board from './Board.js'

const CLICK_EVENT = 'attack-board-clicked'

const COLORS = {
  HIT: 'coral',
  MISS: 'lightblue',
  WIN: 'mediumseagreen',
  LOSS: 'indianred',
  DEFAULT: 'gray',
  ERROR: 'red',
}

export default class AttacksBoard extends Board {
  constructor ({ size, id }, shipsBoard) {
    super(size, id.canvas, CLICK_EVENT)

    // REFERENCES
    this.attackSection = document.getElementById(id.section)
    this.turnDisplay = document.getElementById(id.turnDisplay)

    // DATA
    this.api = new ApiService()

    this.isTurn = false
    this.gameOver = false

    this.attackMap = new Bitmap('0'.repeat(this.size))
    this.hitMap = new Bitmap('0'.repeat(this.size))
    this.missMap = new Bitmap('0'.repeat(this.size))

    this.ShipsBoard = shipsBoard
  }

  start () {
    this.attackSection.style.visibility = 'visible'
    super.drawBoard()

    if (this.api.credentials.player === 0) {
      this.setTurn(true)
    } else {
      this.setTurn(false)
      this.api.pollForTurn(this.turnStart(), { immediate: true })
    }

    this.canvas.addEventListener(CLICK_EVENT, this.gameLoop())
  }

  turnStart () {
    return async () => {
      const winnerID = await this.api.getWinStatus()

      if (winnerID !== null && winnerID !== this.api.credentials.player) {
        // If the game discovers a win at this point, it means the player lost
        await this.gameLost()
        await this.api.endGame()
      } else {
        const receivedHits = new Bitmap(await this.api.getReceivedHits())
        this.updateShipsBoard(receivedHits)

        this.setTurn(true)
      }
    }
  }

  gameLoop () {
    return async ({ detail: clickedSquare }) => {
      // Player already attacked this square or it is not their turn
      if (this.attackMap.bits[clickedSquare] || !this.isTurn) {
        this.squares[clickedSquare].flash(COLORS.ERROR)
        return
      }

      this.setTurn(false)

      const map = this.getAttackAsMap(clickedSquare)
      this.attackMap.update(Bitmap.OR(this.attackMap, map).bitString)
      super.drawMap(map, { fill: COLORS.DEFAULT })

      await this.api.sendAttack(this.attackMap.bitString)
      const enemyShips = new Bitmap(await this.api.getEnemyShipMap())
      this.updateAttackBoard(enemyShips)

      if (this.isGameWon(enemyShips)) {
        await this.gameWon()
      }

      if (!this.gameOver) {
        this.api.pollForTurn(this.turnStart(), { immediate: true })
      }
    }
  }

  updateAttackBoard (enemyShips) {
    this.hitMap.update(this.getHits(enemyShips, this.attackMap).bitString)
    this.missMap.update(this.getMisses(enemyShips, this.attackMap).bitString)

    super.drawMap(this.hitMap, { fill: COLORS.HIT })
    super.drawMap(this.missMap, { fill: COLORS.MISS })
  }

  updateShipsBoard (enemyHits) {
    const hits = this.getHits(this.ShipsBoard.shipMap, enemyHits)
    const misses = this.getMisses(this.ShipsBoard.shipMap, enemyHits)

    this.ShipsBoard.drawMap(hits, { fill: COLORS.LOSS })
    this.ShipsBoard.drawMap(misses, { fill: COLORS.MISS })
  }

  async gameWon () {
    await this.api.setWinStatus()

    this.gameOver = true

    super.drawMap(this.hitMap, { fill: COLORS.WIN })
    this.turnDisplay.style.color = COLORS.WIN
    this.turnDisplay.innerText = 'You Won!'
  }

  async gameLost () {
    const receivedHits = new Bitmap(await this.api.getReceivedHits())
    const enemyShips = new Bitmap(await this.api.getEnemyShipMap())
    enemyShips.update(Bitmap.AND(Bitmap.NOT(this.attackMap), enemyShips).bitString)

    // show the last winning hit on you and where the enemy ships were
    this.updateShipsBoard(receivedHits)
    super.drawMap(enemyShips, { fill: COLORS.DEFAULT })

    this.turnDisplay.style.color = COLORS.LOSS
    this.turnDisplay.innerText = 'You Lost...'
  }

  isGameWon (enemyShips) {
    return Bitmap.EQ(Bitmap.AND(enemyShips, this.attackMap), enemyShips)
  }

  getAttackAsMap (square) {
    return new Bitmap('0'.repeat(square) + '1' + '0'.repeat(this.size - (square + 1)))
  }

  getHits (ships, attacks) {
    return Bitmap.AND(ships, attacks)
  }

  getMisses (ships, attacks) {
    return Bitmap.AND(Bitmap.NOT(ships), attacks)
  }

  setTurn (isTurn) {
    this.isTurn = isTurn

    if (isTurn) {
      this.turnDisplay.style.color = COLORS.WIN
      this.turnDisplay.innerText = 'It\'s your turn!'
    } else {
      this.turnDisplay.style.color = COLORS.DEFAULT
      this.turnDisplay.innerText = 'Other player\'s turn'
    }
  }
}
