const express = require('express')
const logger = require('../logger')
const uuid = require('uuid/v4')
const { BOOKMARKS } = require('../STORE')

const bookmarkRouter = express.Router()
const bodyParser = express.json()
const BookmarksService = require('./bookmarks-service')

bookmarkRouter
  .route('/bookmarks')
  .get(getBookmarks)
  .post(bodyParser, postBookmark)

bookmarkRouter
  .route('/bookmarks/:id')
  .get(getBookmark)
  .delete(deleteBookmark)


 function getBookmarks(req, res, next) {
   const db = req.app.get('db')
   BookmarksService.getBookmarks(db)
   .then(bookmarks => {
       logger.info('successful get /bookmarks')
       res.json(bookmarks)
   })
   .catch(next)
 }

function getBookmark(req, res, next) {
  const { id } = req.params
  const db = req.app.get('db');

  BookmarksService.getById(db, id)
    .then(bookmark => {
       if(!bookmark) {
         logger.error(`Bookmark with id ${id} not found`)
         return res.status(404).json({ error: { message: `Bookmark doesn't exist` } })
       }
      logger.info(`successful get /bookmark/${id}}`)
      res.json(bookmark)
    })
    .catch(next)

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

  function deleteBookmark(req, res) {
    const { id } = req.params

    const bmI = BOOKMARKS.findIndex(bm => bm.id == id)

    if (bmI === -1) {
      logger.error(`Bookmark with id ${id} does not exist, cannot delete`)
      return res.status(404).json({error: 'Not Found'})
    }

    BOOKMARKS.splice(bmI, 1)
    logger.info(`bookmark with id ${id} deleted`)
    res
      .status(204)
      .end()
  }


module.exports = bookmarkRouter
