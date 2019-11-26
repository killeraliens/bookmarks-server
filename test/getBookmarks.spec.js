const app = require('../src/app')

describe.skip('GET /bookmarks endpoint', () => {

  it('responds with an array containing at least one bookmark', () => {
    return supertest(app)
      .get('/bookmarks')
      .set(authHeader)
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('array').with.lengthOf.at.least(1)
        const bookmark = res.body[0]
        expect(bookmark).to.include.keys('id', 'title', 'url', 'description', 'rating')
      })
  })
})
