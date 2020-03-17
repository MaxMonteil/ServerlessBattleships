export default class ApiService {
  constructor ({ url, version }) {
    this.url = url
    this.version = version
    this.credentials = {}
  }

  async joinGame () {
    const credentials = await this._getRequest('game')

    if (credentials === null) throw new Error('Unable to join game')

    this.credentials = credentials
    return this.credentials
  }

  async getShipMap () {
    return await this._getRequest('shipmap')
  }

  async saveShips (shipMap) {
    return await this._postRequest('shipmap', shipMap)
  }

  async getAttacksMap () {
    return await this._getRequest('attack')
  }

  async sendAttack (attackMap) {
    return await this._postRequest('attack', attackMap)
  }

  pollForPlayers (successCallback, options) {
    return this._pollService('poll_players', successCallback, options)
  }

  pollForReady (successCallback, options) {
    return this._pollService('poll_ready', successCallback, options)
  }

  pollForTurn (successCallback, options) {
    return this._pollService('poll_turn', successCallback, options)
  }

  _pollService (resource, successCallback, options) {
    // The immediate option decides whether to start polling immediately
    // or return the poll service function for use as a callback later
    options = { ...{ immediate: false, interval: 1000 }, ...options }

    const pollFunction = () => setTimeout(async function poll () {
      // Recursive setTimeout gives us more control than setInterval
      if (!await this._getRequest(resource)) {
        setTimeout(poll.bind(this), options.interval)
      } else {
        successCallback()
      }
    }.bind(this), options.interval)

    if (options.immediate) pollFunction()
    else return pollFunction
  }

  async _getRequest (resource) {
    let url = this._getEndpoint(resource)
    url.search = new URLSearchParams(this.credentials).toString()

    const resp = await fetch(url)

    if (!resp.ok) return Promise.resolve(null)

    return resp.json()
  }

  async _postRequest (resource, data) {
    let url = this._getEndpoint(resource)
    url.search = new URLSearchParams(this.credentials).toString()

    const resp = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!resp.ok) return Promise.resolve(null)

    return resp.json()
  }

  _getEndpoint (resource) {
    return new URL([this.url, this.version, resource].join('/'))
  }
}
