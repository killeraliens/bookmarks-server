const app = require('../src/app')

describe('App', () => {
  it('should exist', () => {
     expect(app).to.be.a('function')
  })

  it('GET / without authorization returns 403', () => {
    return supertest(app)
      .get('/')
      .expect(403)
  })

})
