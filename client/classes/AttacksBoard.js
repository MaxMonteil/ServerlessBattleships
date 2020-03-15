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
    return () => {
      this.attackSection.style.visibility = 'visible'
      super.drawBoard()
    }
  }
}
