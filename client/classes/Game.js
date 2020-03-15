import ApiService from '../api.js'

import ShipsBoard from './ShipsBoard.js'
import AttacksBoard from './AttacksBoard.js'
import Bitmap from './Bitmap.js'

const GRID_DIMENSIONS = 10

export default class Game {
  constructor (shipBoardData, attacksBoardData, serverInfo) {
    this.playerID = ''

    this.api = new ApiService(serverInfo)

    this.ShipsBoard = new ShipsBoard(
      this.api,
      GRID_DIMENSIONS,
      'white',
      'black',
      shipBoardData,
    )

    this.AttacksBoard = new AttacksBoard(
      this.api,
      GRID_DIMENSIONS,
      'white',
      'black',
      attacksBoardData,
    )
    this.attackSection = document.querySelector(attacksBoardData.section)
    this.attackMap = new Bitmap('0'.repeat(this.size))
  }

  async initPlayer () {
    const playerID = await this.api.getPlayerId()
    if (!playerID) return false

    return playerID
  }

  getHits () { return Bitmap.AND(this.shipMap, this.attackMap) }

  getMiss () { return Bitmap.AND(Bitmap.NOT(this.shipMap), this.attackMap) }

  async start () {
    try {
      const { player: playerID, game: gameID } = await this.api.joinGame()

      this.gameID = gameID
      this.playerID = playerID

      this.ShipsBoard.start(this.AttacksBoard.getPlacementEndCallback())
    } catch (e) {
      console.error(e.message)
    }
  }
}
