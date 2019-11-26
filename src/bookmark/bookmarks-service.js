const BookmarksService = {
  getBookmarks(db) {
    return db
      .select('*')
      .from('bookmarks')
  }


}

module.exports = BookmarksService
