const BookmarksService = {
  getBookmarks(db) {
    return db
      .select('*')
      .from('bookmarks')
  },

  getById(db, id) {
    return db
      .select('*')
      .from('bookmarks')
      .where('id', id)
      .first()
  }


}

module.exports = BookmarksService
