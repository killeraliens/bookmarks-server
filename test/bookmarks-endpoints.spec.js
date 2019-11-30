const app = require('../src/app')
const knex = require('knex')
const { createBookmarksArray, createBookmarkObject } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', () => {
  let db;

  before('create knex instance', () => {
    db = knex({
      "client": "pg",
      "connection": process.env.TEST_DB_URL
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

  describe('GET /bookmarks', () => {

    context('given the bookmarks table has data', () => {
      const testBookmarks = createBookmarksArray()

      beforeEach('add bookmarks to table', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and array of all bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set(authHeader)
          .expect(200, testBookmarks)
      })
    })

    context('given the bookmarks table has no data', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/bookmarks')
          .set(authHeader)
          .expect(200, [])
      })
    })

  })

  describe('GET /bookmarks/:bookmark_id', () => {
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
          .get(`/bookmarks/2`)
          .set(authHeader)
          .expect(200, testBookmark)
      })
    })

    context('given the bookmarks table has no data', () => {
      it('responds with 404 if bookmark does not exist', () => {
        return supertest(app)
          .get('/bookmarks/666')
          .set(authHeader)
          .expect(404, {error: {message: `Bookmark doesn't exist`}})
      })
    })
  })

  describe('POST /bookmarks', () => {
    context('given that the body is accurate', () => {
      it('creates new bookmark and responds with 201 and new bookmark', () => {
        const goodBookmark = createBookmarkObject.goodBookmark()
        return supertest(app)
          .post('/bookmarks')
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
            expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
          })
          .then(res => {
            return supertest(app)
              .get(`/bookmarks/${res.body.id}`)
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
            .post('/bookmarks')
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
          .post('/bookmarks')
          .set(authHeader)
          .send(nanRatingBookmark)
          .expect(400, { error: { message: `rating must be a number in range of 1-5`}})
      })

      it('responds with 400 and error when rating is out of range', () => {
        const outOfRangeRatingBookmark = createBookmarkObject.outOfRangeRatingBookmark()
        return supertest(app)
          .post('/bookmarks')
          .set(authHeader)
          .send(outOfRangeRatingBookmark)
          .expect(400, { error: { message: `rating must be a number in range of 1-5` } })
      })

      it('responds with 400 and error when url is invalid', () => {
        const invalidUrl = createBookmarkObject.invalidUrl()
        return supertest(app)
          .post('/bookmarks')
          .set(authHeader)
          .send(invalidUrl)
          .expect(400, {error: {message: `url is invalid`}})
      })

    })



  })


})
