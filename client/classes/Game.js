import ApiService from '../api/ApiService.js'

import ShipsBoard from './ShipsBoard.js'
import AttacksBoard from './AttacksBoard.js'

export default class Game {
  constructor (detailsNodes, shipBoardData, attacksBoardData) {
    this.gameID = ''
    this.playerID = ''

    this.api = new ApiService()

    this.ShipsBoard = new ShipsBoard(
      this.api,
      shipBoardData,
    )

    this.AttacksBoard = new AttacksBoard(
      this.api,
      attacksBoardData,
      this.ShipsBoard,
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
