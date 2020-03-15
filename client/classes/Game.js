import ApiService from '../api.js'

import ShipsBoard from './ShipsBoard.js'
import AttacksBoard from './AttacksBoard.js'

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
  }

  async start () {
    try {
      const { player: playerID, game: gameID } = await this.api.joinGame()

      this.gameID = gameID
      this.playerID = playerID

      console.log(gameID, playerID)

      this.ShipsBoard.start(this.AttacksBoard.getPlacementEndCallback())
    } catch (e) {
      console.error(e.message)
    }
  }

  getHits () { return Bitmap.AND(this.ShipsBoard.shipMap, this.AttacksBoard.attackMap) }

  getMiss () { return Bitmap.AND(Bitmap.NOT(this.ShipsBoard.shipMap), this.AttacksBoard.attackMap) }

  async initPlayer () {
    const playerID = await this.api.getPlayerId()
    if (!playerID) return false

    return playerID
  }
}
