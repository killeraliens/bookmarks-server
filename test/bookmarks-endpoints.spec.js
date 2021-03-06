const app = require('../src/app')
const knex = require('knex')
const { createBookmarksArray, createBookmarkObject } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', () => {
  let db;

  before('create knex instance', () => {
    db = knex({
      "client": "pg",
      "connection": process.env.TEST_DATABASE_URL
    })
    app.set("db", db)
  })

  before('clean bookmarks table', () => {
    return db('bookmarks').truncate()
  })

  afterEach('cleanup', () => {
    return db('bookmarks').truncate()
  })

  after('kill knex instance', () => {
    return db.destroy()
  })

  describe('GET /api/bookmarks', () => {

    context('given the bookmarks table has data', () => {
      const testBookmarks = createBookmarksArray()

      beforeEach('add bookmarks to table', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and array of all bookmarks', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set(authHeader)
          .expect(200, testBookmarks)
      })
    })

    context('given the bookmarks table has no data', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set(authHeader)
          .expect(200, [])
      })
    })

    context('given there is XSS in bookmark fields', () => {
      const xssBookmark = createBookmarkObject.xssBookmark()
      const expectedBookmark = createBookmarkObject.sanitizedBookmark()
      beforeEach('insert xssBookmark', () => {
        return db
          .insert(xssBookmark)
          .into('bookmarks')
      })

      it('responds with 200 and sanitized bookmarks', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set(authHeader)
          .expect(200)
          .expect(res => {
            expect(res.body[0]).to.eql({...expectedBookmark, id: 1})
          })
      })

    })

  })

  describe('GET /api/bookmarks/:bookmark_id', () => {
    context('given the bookmarks table has data', () => {
      const testBookmarks = createBookmarksArray()

      beforeEach('add bookmarks to table', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and specified bookmark', () => {
        const testBookmark = testBookmarks[1]
        return supertest(app)
          .get(`/api/bookmarks/2`)
          .set(authHeader)
          .expect(200, testBookmark)
      })
    })

    context('given the bookmarks table has no data', () => {
      it('responds with 404 if bookmark does not exist', () => {
        return supertest(app)
          .get('/api/bookmarks/666')
          .set(authHeader)
          .expect(404, {error: {message: `Bookmark doesn't exist`}})
      })
    })

    context('given there is XSS in bookmark fields', () => {
      const xssBookmark = createBookmarkObject.xssBookmark()
      const expectedBookmark = createBookmarkObject.sanitizedBookmark()
      beforeEach('insert xssBookmark', () => {
        return db
          .insert(xssBookmark)
          .into('bookmarks')
      })

      it('responds with 200 and sanitized bookmarks', () => {
        return supertest(app)
          .get('/api/bookmarks/1')
          .set(authHeader)
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql({ ...expectedBookmark, id: 1 })
          })
      })

    })
  })

  describe('POST /api/bookmarks', () => {
    context('given that the body is accurate', () => {
      it('creates new bookmark and responds with 201 and new bookmark', () => {
        const goodBookmark = createBookmarkObject.goodBookmark()
        return supertest(app)
          .post('/api/bookmarks')
          .set(authHeader)
          .send(goodBookmark)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.include.keys(['id', 'title', 'description', 'rating', 'url'])
            expect(res.body.rating).to.eql(goodBookmark.rating)
            expect(res.body.title).to.eql(goodBookmark.title)
            expect(res.body.description).to.eql(goodBookmark.description)
            expect(res.body.url).to.eql(goodBookmark.url)
            expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
          })
          .then(res => {
            return supertest(app)
              .get(`/api/bookmarks/${res.body.id}`)
              .set(authHeader)
              .expect(200)
              .expect(() =>res.body)
          })
      })
    })

    context('given that the body has missing data', () => {
      const reqFields = ['title', 'url', 'rating']
      reqFields.forEach(field => {
        const newBookmark = createBookmarkObject.goodBookmark()
        it(`responds with 400 and required ${field} field error`, () => {
          delete newBookmark[field]
          return supertest(app)
            .post('/api/bookmarks')
            .set(authHeader)
            .send(newBookmark)
            .expect(400, {error: {message: `${field} required`}})
        })
      })
    })

    context('given that the body has invalid data', () => {
      it('responds with 400 and error when rating is not a number', () => {
        const nanRatingBookmark = createBookmarkObject.nanRatingBookmark()
        return supertest(app)
          .post('/api/bookmarks')
          .set(authHeader)
          .send(nanRatingBookmark)
          .expect(400, { error: { message: `rating must be a number in range of 1-5`}})
      })

      it('responds with 400 and error when rating is out of range', () => {
        const outOfRangeRatingBookmark = createBookmarkObject.outOfRangeRatingBookmark()
        return supertest(app)
          .post('/api/bookmarks')
          .set(authHeader)
          .send(outOfRangeRatingBookmark)
          .expect(400, { error: { message: `rating must be a number in range of 1-5` } })
      })

      it('responds with 400 and error when url is invalid', () => {
        const invalidUrl = createBookmarkObject.invalidUrl()
        return supertest(app)
          .post('/api/bookmarks')
          .set(authHeader)
          .send(invalidUrl)
          .expect(400, {error: {message: `url is invalid`}})
      })

    })



  })

  describe('DELETE /api/bookmarks/:bookmark_id', () => {
    const actualBookmarks = createBookmarksArray()
    beforeEach('insert bookmarks', () => {
      return db
        .insert(actualBookmarks)
        .into('bookmarks')
    })

    context('given that the bookmark exists', () => {
      const deleteId = actualBookmarks[0].id
      const expectedBookmarks = actualBookmarks.filter(bm => bm.id !== deleteId)


      it('responds with 204 and deletes bookmark', () => {
        return supertest(app)
          .delete(`/api/bookmarks/${deleteId}`)
          .set(authHeader)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get('/api/bookmarks')
              .set(authHeader)
              .expect(res => {
                expect(res.body).to.eql(expectedBookmarks)
              })
          })
      })
    })

    context('given that the bookmark does not exist', () => {
      const deleteId = 666

      it('responds with 404 and error message', () => {
        return supertest(app)
          .delete(`/api/bookmarks/${deleteId}`)
          .set(authHeader)
          .expect(404, { error: { message: `Bookmark doesn't exist`}})
      })
    })
  })

  describe('PATCH /api/bookmarks/:bookmark_id', () => {

    context('given that the bookmark exists', () => {
      const actualBookmarks = createBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .insert(actualBookmarks)
          .into('bookmarks')
      })

      const idToPatch = actualBookmarks[1].id
      const ogBookmark = actualBookmarks.find(bm => bm.id == idToPatch)

      it('responds with 204', () => {
        const patchBody = {
          description: `New description`,
          title: `New title`,
          rating: 1,
          url: `http://www.new-url.com`
        }
        const expectedBookmark = {
          ...ogBookmark,
          ...patchBody
        }
        return supertest(app)
          .patch(`/api/bookmarks/${idToPatch}`)
          .set(authHeader)
          .send(patchBody)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get(`/api/bookmarks/${idToPatch}`)
              .set(authHeader)
              .expect(expectedBookmark)
          })
      })

      it('responds with 400 when body does not contain at least one required field', () => {
        const missingFieldPatchBody = {
          notAField: `I should be title, url, description, or rating update`
        }

        return supertest(app)
          .patch(`/api/bookmarks/${idToPatch}`)
          .set(authHeader)
          .send(missingFieldPatchBody)
          .expect(400, { error: { message: `Bookmark must contain an update to relevant field (title, url, description, or rating)`}})
      })

      it('responds with 204 and ignores bad fields when updating at least one required field', () => {
        const mixedFieldPatchBody = {
          title: `I should be updated`,
          badField: `I should be ignored`
        }
        const expectedBookmark = {
          ...ogBookmark,
          title: mixedFieldPatchBody.title
        }

        return supertest(app)
          .patch(`/api/bookmarks/${idToPatch}`)
          .set(authHeader)
          .send(mixedFieldPatchBody)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get(`/api/bookmarks/${idToPatch}`)
              .set(authHeader)
              .expect(expectedBookmark)
          })
      })

    })

    context('given that there are no bookmarks', () => {
      it('responds with 404', () => {
        const badId = 123456
        return supertest(app)
          .patch(`/api/bookmarks/${badId}`)
          .set(authHeader)
          .expect(404, {error: {message: `Bookmark doesn't exist`}})
      })
    })

  })


})
