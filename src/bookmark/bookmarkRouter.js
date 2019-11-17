const express = require('express')
const logger = require('../logger')
const uuid = require('uuid/v4')
const { BOOKMARKS } = require('../STORE')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
  .route('/bookmarks')
  .get(getBookmarks)
  .post(bodyParser, postBookmark)

bookmarkRouter
  .route('/bookmarks/:id')
  .get(getBookmark)


  function getBookmarks(req, res) {
    logger.info('successful get /bookmarks')
    res.json(BOOKMARKS)
  }

  function getBookmark(req, res) {
    const { id } = req.params

    const bookmarkI = BOOKMARKS.findIndex(bm => bm.id == id)

    if(bookmarkI === -1) {
      logger.error(`Bookmark with id ${id} not found`)
      return res.status(404).json({error: 'Not found'})
    }

    const bookmark = BOOKMARKS[bookmarkI]

    res.json(bookmark)
  }

  function postBookmark(req, res) {
    const { title, url, description='', rating=1 } = req.body

    if (!title) {
      logger.error('missing title')
      res.status(400).json({error: 'Invalid Data'})
    }

    if (!url) {
      logger.error('missing url')
      res.status(400).json({ error: 'Invalid Data' })
    }

    const id = uuid()
    const bookmark = {...req.body, id, description, rating}
    BOOKMARKS.push(bookmark)
    logger.info(`successful bookmark post with id ${id}`)

    res
      .status(201)
      .location(`/bookmarks/${id}`)
      .json(bookmark)
  }



module.exports = bookmarkRouter
