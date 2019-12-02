const express = require('express')
const logger = require('../logger')
const path = require('path')

const bookmarkRouter = express.Router()
const bodyParser = express.json()
const BookmarksService = require('./bookmarks-service')
const xss = require('xss')
function sanitizeData(bookmark) {
  return {
    id: bookmark.id,
    description: xss(bookmark.description),
    title: xss(bookmark.title),
    rating: bookmark.rating,
    url: xss(bookmark.url)
  }
}

bookmarkRouter
  .route('/bookmarks')
  .get(getBookmarks)
  .post(bodyParser, postBookmark)

bookmarkRouter
  .route('/bookmarks/:id')
  .all(checkExists)
  .get(getBookmark)
  .delete(deleteBookmark)
  .patch(bodyParser, patchBookmark)

function checkExists(req, res, next) {
  const { id } = req.params
  const db = req.app.get('db')

  BookmarksService
    .getById(db, id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).json({error: {message: `Bookmark doesn't exist`}})
      }
      res.bookmark = bookmark
      next()
    })
    .catch(next)
}

function getBookmarks(req, res, next) {
  const db = req.app.get('db')
  BookmarksService.getBookmarks(db)
  .then(bookmarks => {
      logger.info('successful get /bookmarks')
      res.json(bookmarks.map(bookmark => sanitizeData(bookmark)))
  })
  .catch(next)
}

function getBookmark(req, res, next) {
  res.json(sanitizeData(res.bookmark))
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
        .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
        .json(bookmark)
    })
    .catch(next)
}

function deleteBookmark(req, res, next) {
  const db = req.app.get('db')
  const id = res.bookmark.id
  //const { id } = req.params

  BookmarksService
    .deleteBookmark(db, id)
    .then(() => {
      logger.info(`bookmark with id ${id} deleted`)
      res
        .status(204)
        .end()
    })
    .catch(next)

}

function patchBookmark(req, res, next) {
  const db = req.app.get('db')
  const { id } = req.params
  const { title, url, rating, description } = req.body
  const patchBody = { title, url, rating, description }

  if (Object.values(patchBody).filter(val => val).length === 0) {
    return res.status(400).json({
      error: {
        message: `Bookmark must contain an update to relevant field (title, url, description, or rating)`}})
  }

  BookmarksService
    .updateBookmark(db, id, patchBody)
    .then(numOfRowsAffected => {
      res.status(204).end()
    })
    .catch(next)
}


module.exports = bookmarkRouter
