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
  },

  insertBookmark(db, data){
    return db
      .insert(data)
      .into('bookmarks')
      .returning('*')
      .then(rows => rows[0])
  },

  deleteBookmark(db, id) {
    return db
      .from('bookmarks')
      .where('id', id)
      .delete()
  },

  updateBookmark(db, id, data) {
    return db
      .from('bookmarks')
      .where('id', id)
      .update(data)
  }

}

module.exports = BookmarksService
