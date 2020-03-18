import ApiService from '../api/ApiService.js'

import ShipsBoard from './ShipsBoard.js'
import AttacksBoard from './AttacksBoard.js'

export default class Game {
  constructor (detailsNodes, shipBoardData, attacksBoardData) {
    // REFERENCES
    this.window = window
    this.gameInfo = document.getElementById(detailsNodes.game)
    this.lobbyNode = document.getElementById(detailsNodes.lobby)
    this.placementWait = document.getElementById(detailsNodes.placementWait)

    // DATA
    this.gameID = ''
    this.playerID = ''

    this.api = new ApiService()

    this.ShipsBoard = new ShipsBoard(shipBoardData)
    this.AttacksBoard = new AttacksBoard(attacksBoardData, this.ShipsBoard)
  }

  async start () {
    try {
      const { player: playerID, game: gameID } = await this.api.joinGame()

      this.gameID = gameID
      this.playerID = playerID

      this.gameInfo.innerHTML = `Game: <strong>${gameID}</strong> | Player: <strong>${playerID + 1}</strong>`

      this.api.pollForPlayers(() => this.startPlacingShips(), { immediate: true })
    } catch (e) {
      console.error(e.message)
    }
  }

  startPlacingShips () {
    // We use the api to get a polling callback for ships board to run when
    // the player finishes placing their ships
    this.lobbyNode.style.display = 'none'

    this.window.addEventListener('placement-done', () => {
      this.placementWait.style.display = 'block'

      this.api.pollForReady(() => this.startGameLoop(), { immediate: true })
    })

    this.ShipsBoard.start()
  }

  startGameLoop () {
    this.placementWait.style.display = 'none'
    this.AttacksBoard.start()
  }
}
