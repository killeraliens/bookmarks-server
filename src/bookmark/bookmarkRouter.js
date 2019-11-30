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

function postBookmark(req, res, next) {
  const db = req.app.get('db')

  const reqFields = ['title', 'url', 'rating']
  reqFields.forEach(field => {
    if (!req.body[field]) {
      logger.error(`${field} required`)
      return res.status(400).json({ error: { message: `${field} required` } })
    }
  })

  const {title, url, description} = req.body
  const rating = Number(req.body.rating)

  if(!Number.isInteger(rating) || rating < 1 || rating > 5) {
    logger.error(`rating ${rating} must be a number in range of 1-5`)
    return res.status(400).json({ error: { message: `rating must be a number in range of 1-5` } })
  }

  const regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
  if(!regex.test(url)) {
    logger.error(`${url} is not a valid url`)
    return res.status(400).json({error: {message: 'url is invalid'}})
  }

  const newBookmark = { title, url, description, rating }

  BookmarksService.insertBookmark(db, newBookmark)
    .then(bookmark => {
      logger.info(`successful bookmark post with id ${bookmark.id}`)
      res
        .status(201)
        .location(`/bookmarks/${bookmark.id}`)
        .json(bookmark)
    })
    .catch(next)
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
