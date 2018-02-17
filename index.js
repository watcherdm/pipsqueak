class SecureString extends Object {
  constructor(value) {
    super(value)
    this.valueOf = () => { return defaults[map[value]] }
    this.toString = this.valueOf
    this.track = () => {
      console.error(`user saw ${map[value]}`)
    }
    this.squeak = () => {
      this.track()
      this.valueOf = () => { return atob(value) }
      this.toString = this.valueOf
    }    
  }
}

class PipSqueak extends Object {
  constructor(options) {
    super(options)
    this.host = options.host || window.location.origin
    this.map = options.map || {}
    this.defaults = options.defaults || {}
    if (options.tracking) {
      this.configureTracking(options.tracking)
    }
  }
  configureTracking(options) {
    this.trackingOptions = options
  }
  getMask() {
    // fetch the mask from the pipsqueak server
  }
  getDefaults() {
    // fetch the defaults from the pipsqueak server

  }
  updateProgress() {
    console.log('update progress', argument)
  }
  request(method, url, data) {
    if (url.indexOf('//') === -1) {
      // probably missing host, add host config to url
      url = `${this.host}/${url}`
    }
    if (method === 'GET' && data !== undefined) {
      const queryString = Object.keys(data).reduce((mem, key) => {
        const val = data[key]
        mem += `${encodeURIComponent(key)}=${encodeURIComponent(val)}&`
        return mem
      }, '')
      url = `${url}?${queryString}`
    }
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.addEventListener("progress", this.updateProgress)
      request.addEventListener("load", resolve)
      request.addEventListener("error", reject)
      request.addEventListener("abort", reject)
      request.open(method, url)
      request.send(data)
    }).then((response) => {
      console.log(response)
    }).catch((response) => {
      console.error(response)
    })
  }
  get(url, data) {
    return this.request('GET', url, data)
  }
  post(url, data) {
    return this.request('POST', url, data)
  }
  put(url, data) {
    return this.request('PUT', url, data)
  }
  option(url, data) {
    return this.request('OPTION', url, data)
  }
  head(url, data) {
    return this.request('HEAD', url, data)
  }
  delete(url, data) {
    return this.request('DELETE', url, data)
  }

}