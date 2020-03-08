import Board from './Board.js'
import Bitmap from './Bitmap.js'
import Ship from './Ship.js'

export default class Game {
  constructor (dimensions, divisions, canvasID, orientationDisplay) {
    this.divisions = divisions
    this.size = divisions ** 2
    this.SEA_COLOR = 'lightblue'

    this.gameBoard = new Board(dimensions, divisions, this.SEA_COLOR, canvasID)

    this.orientationDisplay = document.querySelector('#alignment')

    this.seaMap = new Bitmap('1'.repeat(this.size))

    this.shipMap = new Bitmap('0'.repeat(100))

    this.ships = {
      Carrier: new Ship(5),
      Battleship: new Ship(4),
      Destroyer: new Ship(3),
      Submarine: new Ship(3),
      Patrol: new Ship(2),
    }
    this.selectedShip = this.ships.Carrier
    this.selectionCleanup = null

    this.attackMap = new Bitmap('0'.repeat(100))
  }

  updateOrientation () {
    this.orientationDisplay.innerText = this.selectedShip.alignment.toLowerCase()
  }

  getHits () { return Bitmap.AND(this.shipMap, this.attackMap) }

  getMiss () { return Bitmap.AND(Bitmap.NOT(this.shipMap), this.attackMap) }

  rotateSelectedShip () {
    if (this.selectedShip.anchor) {
      // "erase" the ship
      this.gameBoard.drawBitmap(this.selectedShip.bounds, this.SEA_COLOR, this.selectedShip.anchor, { skipCheck: true })
      this.selectedShip.anchor = null
    }
    this.selectedShip.rotate()
    this.updateOrientation()
  }

  selectShip (target, selector = null) {
    if (target instanceof Ship) {
      this.selectedShip = target
    } else {
      const selection = new FormData(target).get(selector)
      this.selectedShip = this.ships[selection]
      if (this.selectionCleanup) this.gameBoard.canvas.removeEventListener(...this.selectionCleanup)
    }

    this.placeShip(this.selectedShip)
  }

  placeShip (ship) {
    const handleShipPlacement = ({ detail: square }) => {
      // "erase" the ship by drawing ocean over it
      if (ship.anchor !== null) this.gameBoard.drawBitmap(ship.bounds, this.SEA_COLOR, ship.anchor, { skipCheck: true })
      ship.anchor = square
      this.gameBoard.drawBitmap(ship.bounds, 'black', square)
    }

    this.gameBoard.canvas.addEventListener('boardClicked', handleShipPlacement)

    this.selectionCleanup = ['boardClicked', handleShipPlacement]
  }

  start () {
    this.gameBoard.drawBoard()
    this.selectShip(this.ships.Carrier)
    this.updateOrientation()
  }
}
