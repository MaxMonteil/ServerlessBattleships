import ApiService from '../api.js'

import ShipsBoard from './ShipsBoard.js'
import AttacksBoard from './AttacksBoard.js'

const GRID_DIMENSIONS = 10

export default class Game {
  constructor (detailsNodes, shipBoardData, attacksBoardData, serverInfo) {
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

    // SETUP
    this.gameInfo = document.getElementById(detailsNodes.game)
    this.lobbyNode = document.getElementById(detailsNodes.lobby)
    this.placementWait = document.getElementById(detailsNodes.placementWait)
  }

  async start () {
    try {
      const { player: playerID, game: gameID } = await this.api.joinGame()

      this.gameID = gameID
      this.playerID = playerID

      this.gameInfo.innerHTML = `Game: <strong>${gameID}</strong> | Player: <strong>${playerID + 1}</strong>`

      this.api.pollForPlayers(() => this.placeShips(), { immediate: true })
    } catch (e) {
      console.error(e.message)
    }
  }

  placeShips () {
    // We use the api to get a polling callback for ships board to run when
    // the player finishes placing their ships
    this.lobbyNode.style.display = 'none'

    const pollCallback = this.api.pollForReady(() => {
      this.placementWait.style.display = 'none'
      this.AttacksBoard.start()
    })
    this.ShipsBoard.start(pollCallback)
  }
}
