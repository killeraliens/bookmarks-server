const app = require('../src/app')

describe.skip('POST /bookmarks endpoint', () => {

  const goodBookmark = {
    "title": "cool title bro",
    "url": "http://www.goatsguide.com"
  }

  const missingTitleBookmark = {
    "url": "http://www.goatsguide.com"
  }

  const missingUrlBookmark = {
    "title": "some title"
  }

  it('responds with 201 and created bookmark upon success', () => {
    return supertest(app)
      .post('/bookmarks')
      .set(authHeader)
      .send(goodBookmark)
      .expect(201)
      .expect('Content-Type', /json/)
      .then(res => {
        expect(res.body).to.include.keys('id', 'title', 'description', 'rating', "url")
      })
  })

  it('returns 400 error with missing title', () => {
    return supertest(app)
      .post('/bookmarks')
      .set(authHeader)
      .send(missingTitleBookmark)
      .expect(400)
  })

  it('returns 400 error with missing url', () => {
    return supertest(app)
      .post('/bookmarks')
      .set(authHeader)
      .send(missingUrlBookmark)
      .expect(400)
  })

})
