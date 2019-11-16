const express = require('express')
const logger = require('../logger')
const { BOOKMARKS } = require('../STORE')

const bookmarkRouter = express.Router()

bookmarkRouter
  .route('/bookmarks')
  .get(getBookmarks)


  function getBookmarks(req, res) {
    logger.info('successful get /bookmarks')
    res.json(BOOKMARKS)
  }

module.exports = bookmarkRouter
