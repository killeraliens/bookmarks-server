const express = require('express')
const logger = require('../logger')
const { BOOKMARKS } = require('../STORE')

const bookmarkRouter = express.Router()

bookmarkRouter
  .route('/bookmarks')
  .get(getBookmarks)

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
      return res.status(400).json({error: 'Not found'})
    }

    res.json(BOOKMARKS[bookmarkI])
  }



module.exports = bookmarkRouter
