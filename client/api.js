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
