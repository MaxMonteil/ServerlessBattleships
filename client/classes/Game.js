import ApiService from '../api.js'

import ShipsBoard from './ShipsBoard.js'
import AttacksBoard from './AttacksBoard.js'

const GRID_DIMENSIONS = 10

export default class Game {
  constructor (shipBoardData, attacksBoardData, serverInfo) {
    this.gameID = ''
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

      this.api.pollForPlayers(() => this.placeShips(), { immediate: true })
    } catch (e) {
      console.error(e.message)
    }
  }

  placeShips () {
    // We use the api to get a polling callback for ships board to run when
    // the player finishes placing their ships
    const pollCallback = this.api.pollForReady(() => this.AttacksBoard.start())
    this.ShipsBoard.start(pollCallback)
  }
}
