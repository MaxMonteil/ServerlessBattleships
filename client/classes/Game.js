import ApiService from '../api.js'

import ShipsBoard from './ShipsBoard.js'
import Bitmap from './Bitmap.js'

export default class Game {
  constructor (pixelDimensions, gridDimensions, canvasID, shipBoardData, serverInfo) {
    this.playerID = ''

    this.api = new ApiService(serverInfo)

    this.ShipsBoard = new ShipsBoard(
      this.api,
      pixelDimensions,
      gridDimensions,
      'lightblue',
      'white',
      canvasID,
      shipBoardData,
    )

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

      console.log(this.gameID, this.playerID)

      this.ShipsBoard.start()
    } catch (e) {
      console.error(e.message)
    }
  }
}
