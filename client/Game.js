import Board from './Board.js'
import Bitmap from './Bitmap.js'
import Ship from './Ship.js'

export default class Game {
  constructor (dimensions, divisions, canvasID) {
    this.divisions = divisions
    this.size = divisions ** 2
    this.SEA_COLOR = 'lightblue'

    this.gameBoard = new Board(dimensions, divisions, this.SEA_COLOR, canvasID)

    this.seaMap = new Bitmap('1'.repeat(this.size))

    this.shipMap = new Bitmap('0'.repeat(100))

    this.ships = {
      Carrier: new Ship(5),
      Battleship: new Ship(4),
      Destroyer: new Ship(3),
      Submarine: new Ship(3),
      Patrol: new Ship(2),
    }

    this.attackMap = new Bitmap('0'.repeat(100))
  }

  clearBoard () {
    this.gameBoard.drawBitmap(this.seaMap, this.SEA_COLOR)
  }

  getHits () { return Bitmap.AND(this.shipMap, this.attackMap) }

  getMiss () { return Bitmap.AND(Bitmap.NOT(this.shipMap), this.attackMap) }

  placeShip (ship) {
    const handleShipPlacement = ({ detail: square }) => {
      // "erase" the ship by drawing ocean over it
      if (ship.anchor) this.gameBoard.drawBitmap(ship.bounds, this.SEA_COLOR, ship.anchor, { skipCheck: true })
      ship.anchor = square
      this.gameBoard.drawBitmap(ship.bounds, 'black', square)
    }

    this.gameBoard.canvas.addEventListener('boardClicked', handleShipPlacement)

    return ['boardClicked', handleShipPlacement]
  }

  start () {
    this.gameBoard.drawBoard()
    const cleanup = this.placeShip(this.ships.Destroyer)
    // this.gameBoard.canvas.removeEventListener(...cleanup)

    // ROTATION
    window.addEventListener('keydown', e => {
      if (String.fromCharCode(e.keyCode) === 'R') {
        if (this.ships.Destroyer.anchor) {
          // "erase" the ship
          this.gameBoard.drawBitmap(this.ships.Destroyer.bounds, this.SEA_COLOR, this.ships.Destroyer.anchor, { skipCheck: true })
          this.ships.Destroyer.anchor = null
        }
        this.ships.Destroyer.rotate()
      }
    })
  }
}
