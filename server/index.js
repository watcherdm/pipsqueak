const http = require('http')
const fs = require("fs")
const jsonPayload = {
  "name": "Gabriel Hernandez",
  "phone": "415-738-9873",
  "address": {
    "street": "3537 Dormer Ave.",
    "city": "Concord",
    "state": "CA",
    "zip": "94519"
  }
}

const maskSet = {
  "GET": {
    "/person": {
      "name": "John Smith",
      "phone": "555-555-1212",
      "address": {
        "street": "101 Main St.",
        "city": "Nowhere",
        "state": "ST",
        "zip": "90009"
      }
    }
  }
}

function maskPayload(payload, mask) {
  return Object.keys(payload).reduce(function secureValues(mem, key) {
    if (typeof payload[key] !== 'object') {
      mem[key] = (mask.hasOwnProperty(key)) ? (new Buffer(payload[key])).toString('base64') : payload[key]
    } else {
      mem[key] = maskPayload(payload[key], mask[key])
    }
    return mem;
  }, {})
}

http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(fs.readFileSync('server/index.html'))
  } else if (req.url === '/pipsqueak.js' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/javascript'})
    res.end(fs.readFileSync('index.js'))
  } else if (req.url === '/app.js' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/javascript'})
    res.end(fs.readFileSync('app.js'))
  } else if (req.url === '/app.css' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/css'})
    res.end(fs.readFileSync('app.css'))
  } else if (req.url === '/person' && req.method === 'GET') {
    console.log("person getting", req.url)
    const mask = maskSet[req.method][req.url]
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(maskPayload(jsonPayload, mask)))
  } else if (req.url === '/mask' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(maskSet))
  } else if (req.url === '/squeak' && req.method === 'POST') {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = JSON.parse(Buffer.concat(body).toString());
      fs.appendFile('squeak.log', `${(new Date()).getTime()}:: ${body.key} seen by user\n`, () => {
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({squeak: true}))
      })
    });
  }

}).listen(5000)