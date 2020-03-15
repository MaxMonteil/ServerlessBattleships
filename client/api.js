export default class ApiService {
  constructor ({ url, version }) {
    this.url = url
    this.version = version
  }

  async getPlayerId () {
    return this._getRequest('player')
  }

  async getShipMap (playerID) {
    return this._getRequest('shipmap', { player: playerID })
  }

  async saveShips (shipMap, playerID) {
    return this._postRequest('shipmap', shipMap, { player: playerID })
  }

  async _getRequest (resource, queries = {}) {
    let url = this._getEndpoint(resource)
    url.search = new URLSearchParams(queries).toString()

    const resp = await fetch(url)

    if (!resp.ok) return null

    return resp.json()
  }

  async _postRequest (resource, data, queries = {}) {
    let url = this._getEndpoint(resource)
    url.search = new URLSearchParams(queries).toString()

    const resp = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!resp.ok) return null

    return resp.json()
  }

  _getEndpoint (resource) {
    return new URL([this.url, this.version, resource].join('/'))
  }
}
