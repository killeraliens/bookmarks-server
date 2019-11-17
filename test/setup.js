const { expect } = require('chai')
const supertest = require('supertest')

const authHeader = {
  "Authorization": `Bearer ${process.env.API_TOKEN}`
}

global.expect = expect
global.supertest = supertest
global.authHeader = authHeader


