import Config from './Config.js'

const RESOURCES = {
  GAME: 'game',
  END_GAME: 'end_game',
  CHECK_WIN: 'win',
  SET_WIN: 'win',
  ENEMY_SHIPS: 'shipmap',
  SAVE_SHIPS: 'shipmap',
  ENEMY_HITS: 'attack',
  SAVE_HITS: 'attack',
  POLL_PLAYERS: 'poll_players',
  POLL_READY: 'poll_ready',
  POLL_TURN: 'poll_turn',
}

export default class ApiService {
  constructor () {
    const instance = this.constructor.instance
    if (instance) return instance

    this.url = Config.URL
    this.version = Config.VERSION
    this.credentials = {}

    this.constructor.instance = this
  }

  async joinGame () {
    const credentials = await this._getRequest(RESOURCES.GAME)

    if (credentials === null) throw new Error('Unable to join game')

    this.credentials = credentials
    return this.credentials
  }

  quitGame () {
    const url = this._buildEndpoint('quit_game')
    url.search = new URLSearchParams(this.credentials).toString()

    navigator.sendBeacon(url, JSON.stringify({ game: this.credentials }))
  }

  async endGame () {
    const url = this._buildEndpoint(RESOURCES.END_GAME)
    url.search = new URLSearchParams(this.credentials).toString()

    const resp = await fetch(url, {
      method: 'DELETE',
      mode: 'cors',
    })

    if (!resp.ok) return Promise.resolve(null)

    return resp.json()
  }

  async getEnemyShipMap () {
    return this._getRequest(RESOURCES.ENEMY_SHIPS)
  }

  async saveShips (shipMap) {
    return this._postRequest(RESOURCES.SAVE_SHIPS, shipMap)
  }

  async getReceivedHits () {
    return this._getRequest(RESOURCES.ENEMY_HITS)
  }

  async sendAttack (attackMap) {
    return this._postRequest(RESOURCES.SAVE_HITS, attackMap)
  }

  async getWinStatus () {
    return this._getRequest(RESOURCES.CHECK_WIN)
  }

  async setWinStatus () {
    return this._postRequest(RESOURCES.SET_WIN)
  }

  pollForPlayers (successCallback, options) {
    return this._pollService(RESOURCES.POLL_PLAYERS, successCallback, options)
  }

  pollForReady (successCallback, options) {
    return this._pollService(RESOURCES.POLL_READY, successCallback, options)
  }

  pollForTurn (successCallback, options) {
    return this._pollService(RESOURCES.POLL_TURN, successCallback, options)
  }

  _pollService (resource, pollEndCallback, options) {
    // The immediate option decides whether to start polling immediately
    // or return the poll service function for use as a callback later
    options = { immediate: false, interval: 1000, ...options }

    const pollFunction = () => setTimeout(async function poll () {
      if (!await this._getRequest(resource)) {
        setTimeout(poll.bind(this), options.interval)
      } else {
        pollEndCallback()
      }
    }.bind(this), options.interval)

    if (options.immediate) pollFunction()
    else return pollFunction
  }

  async _getRequest (resource) {
    const url = this._buildEndpoint(resource)
    url.search = new URLSearchParams(this.credentials).toString()

    const resp = await fetch(url)

    if (!resp.ok) return Promise.resolve(null)

    return resp.json()
  }

  async _postRequest (resource, data) {
    const url = this._buildEndpoint(resource)
    url.search = new URLSearchParams(this.credentials).toString()

    const resp = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!resp.ok) return Promise.resolve(null)

    return resp.json()
  }

  _buildEndpoint (resource) {
    return new URL([this.url, this.version, resource].join('/'))
  }
}
