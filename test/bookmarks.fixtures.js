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

module.exports = { createBookmarksArray }
