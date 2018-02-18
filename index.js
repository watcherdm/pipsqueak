class SecureString extends Object {
  constructor(pip, key, value, defaultValue) {
    super(value)
    this.valueOf = () => { return defaultValue }
    this.toString = this.valueOf
    this.track = () => {
      return pip.post('/squeak', {key: key})
    }
    this.squeak = () => {
      return this.track().then(() => {
        this.valueOf = () => { return atob(value) }
        this.toString = this.valueOf
        return this.valueOf()   
      })
    }    
  }
}

class PipSqueak extends Object {
  constructor(options) {
    super(options)
    this.host = options.host || window.location.origin
    this.mask = options.mask || null
    if (this.mask === null) {
      this.get('/mask').then(mask => {
        this.mask = mask
      }) 
    }
    if (options.tracking) {
      this.configureTracking(options.tracking)
    }
  }
  configureTracking(options) {
    this.trackingOptions = options
  }
  getMask(method, url) {
    return (((this.mask || {})[method]||{})[url]||{})
  }
  applyMask(payload, mask = {}) {
    const self = this
    return Object.keys(payload).reduce(function secureValues(mem, key) {
      if (typeof payload[key] !== 'object') {
        mem[key] = (mask.hasOwnProperty(key)) ? new SecureString(self, key, payload[key], mask[key]) : payload[key]
      } else {
        mem[key] = self.applyMask(payload[key], mask[key])
      }
      return mem;
    }, {})
  }
  updateProgress() {
    console.log('update progress', arguments)
  }
  request(method, path, data) {
    let url = path
    if (url.indexOf('//') === -1) {
      url = `${this.host}${url}`
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
      request.addEventListener("load", resolve.bind(request))
      request.addEventListener("error", reject.bind(request))
      request.addEventListener("abort", reject.bind(request))
      request.open(method, url)
      request.send(JSON.stringify(data))
    }).then((response) => {
      const payload = JSON.parse(response.currentTarget.response)
      return this.applyMask(payload, this.getMask(method, path))
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