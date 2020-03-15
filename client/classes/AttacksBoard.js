import Bitmap from './Bitmap.js'
import Board from './Board.js'

const CLICK_EVENT = 'attack-board-clicked'

export default class AttacksBoard extends Board {
  constructor (api, gridDimensions, fill, stroke, options) {
    super(options.size, gridDimensions, fill, stroke, options.canvas, CLICK_EVENT)

    this.api = api

    this.attackMap = new Bitmap('0'.repeat(this.size))

    // SETUP
    this.attackSection = document.querySelector(options.section)
  }

  getPlacementEndCallback () {
    return () => this.start()
  }

  start () {
    this.attackSection.style.visibility = 'visible'
    super.drawBoard()

    const playerAttack = async ({ detail: square }) => {
      this.squares[square].flash('blue')

      const map = this.getAttackAsMap(square)
      if (await this.api.sendAttack(map.bitString)) {
        this.squares[square].recolor('gray')
        this.pollForTurn()
      }
    }

    this.canvas.addEventListener(CLICK_EVENT, playerAttack)
  }

  getAttackAsMap (square) {
    return new Bitmap('0'.repeat(square) + '1' + '0'.repeat(this.size - (square + 1)))
  }

  pollForTurn (interval = 500) {
    setTimeout(async function poll () {
      const playersTurn = await this.api.pollForTurn()

      if (!playersTurn) {
        setTimeout(poll.bind(this), interval)
      } else {
        console.log(`It's the turn of player ${this.api.credentials.player}`)
      }
    }.bind(this), interval)
  }
}
