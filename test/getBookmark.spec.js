const app = require('../src/app')
//const logger = require('../src/logger')

describe.skip('GET /bookmarks/:id endpoint', () => {

  it('responds with 200 and bookmark if exists', () => {
    return supertest(app)
      .get('/bookmarks/1')
      .set(authHeader)
      .expect(200)
      .then(res => {
        expect(res.body).to.include.keys('id', 'title')
      })
  })

  it('responds with 404 if bookmark does not exist', () => {
    return supertest(app)
      .get('/bookmarks/666')
      .set(authHeader)
      .expect(404)
  })

})
