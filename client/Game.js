import ShipsBoard from './ShipsBoard.js'
import Bitmap from './Bitmap.js'

export default class Game {
  constructor (pixelDimensions, gridDimensions, canvasID, orientationDisplayID, shipSelectFormID) {

    this.ShipsBoard = new ShipsBoard(
      pixelDimensions,
      gridDimensions,
      'lightblue',
      'white',
      canvasID,
      orientationDisplayID,
      shipSelectFormID,
    )

    this.attackMap = new Bitmap('0'.repeat(this.size))
  }

  getHits () { return Bitmap.AND(this.shipMap, this.attackMap) }

  getMiss () { return Bitmap.AND(Bitmap.NOT(this.shipMap), this.attackMap) }

  start () {
    this.ShipsBoard.drawBoard()
  }
}
