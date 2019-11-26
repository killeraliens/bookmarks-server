const app = require('../src/app')
const knex = require('knex')
const { createBookmarksArray } = require('./bookmarks.fixtures')

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
  })
})
