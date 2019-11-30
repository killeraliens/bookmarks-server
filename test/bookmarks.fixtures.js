function createBookmarksArray() {
  return [
    {
      id: 1,
      title: "uuid generator",
      url: "https://www.uuidgenerator.net/version1",
      description: "generates uuids",
      rating: 3
    },
    {
      id: 2,
      title: "goat's guide",
      url: "http://www.goatsguide.com",
      description: "fuck ye",
      rating: 5
    },
    {
      id: 3,
      title: "agalloch",
      url: "https://www.youtube.com/watch?v=JE_JnhgLnpw",
      description: "youtube video",
      rating: 5
    }
  ];
}

const createBookmarkObject = {
  goodBookmark() {
    return {
      "title": "cool title bro",
      "url": "http://www.goatsguide.com",
      "rating": 4,
      "description": "some description"
    }
  },

  missingTitleBookmark() {
    return {
      "url": "http://www.goatsguide.com"
    }
  },

  missingUrlBookmark() {
    return {
      "title": "some title"
    }
  },

  nanRatingBookmark() {
    return {
      "title": "cool title bro",
      "url": "http://www.goatsguide.com",
      "rating": "not a number!!"
    }
  },

  outOfRangeRatingBookmark() {
    return {
      "title": "cool title bro",
      "url": "http://www.goatsguide.com",
      "rating": 6
    }
  },

  invalidUrl() {
    return {
      "title": "cool title bro",
      "url": "htp://www.goatsguide.com",
      "rating": 4
    }
  }
}

module.exports = { createBookmarksArray, createBookmarkObject }
