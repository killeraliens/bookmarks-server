CREATE TABLE bookmarks(
  id INT NOT NULL PRIMARY KEY GENERATE BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  rating INT,
  url TEXT NOT NULL
);