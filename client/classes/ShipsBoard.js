import ApiService from '../api/ApiService.js'

import Bitmap from './Bitmap.js'
import Board, { GRID_DIVISIONS } from './Board.js'
import Ship from './Ship.js'

const CANVAS_CLICK_EVENT = 'ships-board-clicked'

export default class ShipsBoard extends Board {
  constructor ({ size, id, form }) {
    super(size, id.canvas, CANVAS_CLICK_EVENT)

    // REFERENCES
    this.window = window
    this.shipsSection = document.getElementById(id.section)
    this.shipBoardInputs = document.getElementById(id.shipBoardInputs)
    this.orientationDisplay = document.getElementById(id.orientationDisplay)

    // Forms
    this.shipSelectForm = document.forms[form.shipSelect.id]
    this.shipSelectFormName = form.shipSelect.name
    this.endShipPlacementForm = document.forms[form.endShipPlacement.id]

    // DATA
    this.api = new ApiService()

    this.shipMap = new Bitmap('0'.repeat(this.size))

    this.ships = {
      Carrier: new Ship(5),
      Battleship: new Ship(4),
      // Destroyer: new Ship(3),
      // Submarine: new Ship(3),
      // Patrol: new Ship(2),
    }

    this.selectedShip = null
  }

  start () {
    this.shipsSection.style.visibility = 'visible'
    super.drawBoard()
    this.setupListeners()

    this.selectShip(this.ships.Carrier)
  }

  selectShip (target, selector = null) {
    if (target instanceof Ship) {
      this.selectedShip = target
    } else {
      const selection = new FormData(target).get(selector)
      this.selectedShip = this.ships[selection]

      if (this.listeners.canvas.callback !== null) this.teardownListeners('canvas')
    }

    this.watchShip(this.selectedShip)
    this.updateOrientation()
  }

  watchShip (ship) {
    const shipWatcher = ({ detail: square }) => {
      const { placementValid, map } = this.placeShip(ship, square)

      if (placementValid) {
        this.shipMap.update(map.bitString)
        super.drawMap(this.shipMap, { fill: this.selectedShip.color }, true)
      } else {
        this.squares[square].flash('red')
      }
    }

    this.canvas.addEventListener(CANVAS_CLICK_EVENT, shipWatcher)
    this.listeners.canvas[CANVAS_CLICK_EVENT] = shipWatcher
  }

  placeShip (ship, start) {
    const shipOffset = Ship.getOffsetIndices(ship, start, GRID_DIVISIONS)

    // Check for out-of-bounds along both axes
    const yValid = Math.max(...shipOffset) < this.size
    // if the ship is vertical, we don't need any checks since the width is 1 square
    const xValid = ship.alignment === 'VERTICAL' ||
      // for horizontal we check that each ship square is on the same row
      shipOffset.map(i => (i / GRID_DIVISIONS) >> 0).every((value, _, arr) => value === arr[0])

    const paddedShip = Ship.padBounds(shipOffset, this.size)

    // When placing an already present ship, remove it to allow positions that might overlap with itself
    const collisionCheckMap = ship.anchor === null
      ? this.shipMap
      : new Bitmap(this.removeShip(ship, false))
    // Check for collisions against other ships
    const collisions = !Bitmap.EQ(Bitmap.AND(collisionCheckMap, paddedShip), Bitmap.FALSE(this.size))

    if (!yValid || !xValid || collisions) return { placementValid: false, map: null }

    // this ship is already somewhere on the map
    if (ship.anchor !== null) this.shipMap.update(this.removeShip(ship))

    ship.anchor = start
    return {
      placementValid: true,
      map: Bitmap.OR(this.shipMap, paddedShip),
    }
  }

  removeShip (ship, removeAnchor = true) {
    const padShip = Ship.padBounds(Ship.getOffsetIndices(ship, ship.anchor, GRID_DIVISIONS), this.size)
    if (removeAnchor) ship.anchor = null
    return Bitmap.AND(this.shipMap, Bitmap.NOT(padShip)).bitString
  }

  updateOrientation () {
    this.orientationDisplay.innerText = this.selectedShip.alignment.toLowerCase()
  }

  hideBoardInputs () {
    this.shipBoardInputs.style.display = 'none'
  }

  allShipsPlaced () {
    return Object.values(this.ships).every(ship => ship.anchor !== null)
  }

  setupListeners () {
    this.listeners = {
      window: {
        keydown: e => this._handleShipRotation(e),
      },
      shipSelectForm: {
        submit: e => this._handleShipSelection(e),
      },
      endShipPlacementForm: {
        submit: e => this._handlePlacementEnd(e),
      },
      canvas: {
        [CANVAS_CLICK_EVENT]: null,
      },
    }

    for (const [target, listener] of Object.entries(this.listeners)) {
      for (const [event, handler] of Object.entries(listener)) {
        this[target].addEventListener(event, handler)
      }
    }
  }

  teardownListeners (target = null) {
    if (target !== null) {
      for (const [event, handler] of Object.entries(this.listeners[target])) {
        this[target].removeEventListener(event, handler)
      }
      return
    }

    for (const [target, listener] of Object.entries(this.listeners)) {
      for (const [event, handler] of Object.entries(listener)) {
        this[target].removeEventListener(event, handler)
      }
    }
  }

  _handleShipRotation (e) {
    if (String.fromCharCode(e.keyCode) !== 'R') return

    // The ship is present on the board somewhere, remove it before rotating
    if (this.selectedShip.anchor !== null) {
      this.shipMap.update(this.removeShip(this.selectedShip))
      super.drawMap(this.shipMap, { fill: this.selectedShip.color }, true)
    }

    this.selectedShip.rotate()
    this.updateOrientation()
  }

  _handleShipSelection (e) {
    e.preventDefault()
    this.selectShip(e.target, this.shipSelectFormName)
    this.updateOrientation()
  }

  async _handlePlacementEnd (e) {
    e.preventDefault()
    if (this.allShipsPlaced()) {
      const resp = await this.api.saveShips(this.shipMap.bitString)

      if (!resp) {
        console.error('Unable to save ship position to server')
        return
      }

      this.teardownListeners()
      this.hideBoardInputs()
      this.window.dispatchEvent(new Event('placement-done'))
    }
  }
}
