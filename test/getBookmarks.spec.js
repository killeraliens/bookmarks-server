const app = require('../src/app')

describe('GET /bookmark endpoint', () => {
  it('responds with an array containing at least one bookmark', () => {
    return supertest(app)
      .get('/bookmark')
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('array')
      })
  })
})
