const BookmarksService = {

  getBookmarks(db) {
    return db
      .select('*')
      .from('bookmarks')
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('bookmarks')
      .where('id', id)
      .first()
  }
}

module.exports = BookmarksService
