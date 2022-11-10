const request = require("request-promise");
const omdbApiBaseUrl = "http://www.omdbapi.com/";
const googleYTAPIUrl =
  "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&key=AIzaSyA8NIAQEFhGj0na9W3-gjH6I3JGe4bjfnI";

function extractItemDetails() {
  const year = document.querySelector("div.year");
  const rating = document.querySelectorAll("span.maturity-rating")[1];
  const duration = document.querySelector("span.duration");
  const description = document.querySelector("p.previewModal--text");
  const len = document.querySelectorAll(
    ".about-container>div.previewModal--tags"
  ).length;

  const cast = document.querySelector(
    ".about-container>div.previewModal--tags:nth-child(2)"
  );
  const genres = document.querySelector(
    ".about-container>div.previewModal--tags:nth-child(" + (len - 1) + ")"
  );
  const atributes = document.querySelector(
    ".about-container>div.previewModal--tags:nth-child(" + len + ")"
  );

  let item = {
    year: year ? year.innerText : "NA",
    rating: rating ? rating.innerText : "NA",
    duration: duration ? duration.innerText : "NA",
    description: description ? description.innerText : "NA",
    cast: cast ? cast.innerText.split(":")[1] : "NA",
    genres: genres ? genres.innerText.split(":")[1] : "NA",
    atributes: atributes ? atributes.innerText.split(":")[1] : "NA",
  };

  return item;
}

function extractItems() {
  const extractedPElements = document.querySelectorAll("p.fallback-text");
  const extractedAElements = document.querySelectorAll("a.slider-refocus");
  const extractedImgElements = document.querySelectorAll(
    "img.boxart-image-in-padded-container"
  );
  const items = [];

  extractedPElements.forEach(function (element, i) {
    let url = extractedAElements[i].getAttribute("href");
    let item = {
      title: element.innerText,
      img: extractedImgElements[i].getAttribute("src"),
      url: url,
      NFID: url.match(/\d+/g)[0],
    };
    items.push(item);
  });
  return items;
}

async function extractYTUrl(title) {
  const requestOptions = {
    method: "GET",
    url: googleYTAPIUrl,
    qs: {
      q: title,
    },
    json: true,
  };

  console.log("Requesting information about " + title + " from google API...");

  let resultJSON;
  let videoId;
  try {
    resultJSON = await request(requestOptions);
  } catch {
    resultJSON = "False";
  }

  if (
    resultJSON !== "False" &&
    resultJSON !== undefined &&
    resultJSON !== null &&
    resultJSON !== ""
  ) {
    console.log("Response from google API passes checks.");
    videoId = resultJSON.items[0].id.videoId;
  } else {
    console.log("Response from google API fails checks.");
    videoId = "N/A";
  }
  console.log(videoId);
  return videoId;
}

async function extractOMDBItem(movies) {
  let movie = new Object();

  const requestOptions = {
    method: "GET",
    url: omdbApiBaseUrl,
    qs: {
      t: movies.title,
      plot: "full",
      year: movies.year,
      type: movies.type,
      apiKey: apiKey,
    },
    json: true,
  };

  console.log(
    "Requesting information about " + movies.title + " from Omdb API..."
  );

  let resultJSON;
  try {
    resultJSON = await request(requestOptions);
  } catch {
    resultJSON = "False";
  }

  if (
    resultJSON !== "False" &&
    resultJSON !== undefined &&
    resultJSON !== null &&
    resultJSON !== ""
  ) {
    console.log("Response from OMDB passes checks.");

    if (resultJSON.hasOwnProperty("imdbRating")) {
      movie.imdbRating = resultJSON.imdbRating;
      console.log("IMDB Rating: " + movie.imdbRating);
    } else {
      movie.imdbRating = "N/A";
      console.log("No IMDB Rating property.");
    }

    if (resultJSON.hasOwnProperty("imdbVotes")) {
      movie.imdbVotes = resultJSON.imdbVotes;
      console.log("IMDB Votes: " + movie.imdbVotes);
    } else {
      movie.imdbVotes = "N/A";
      console.log("No IMDB Votes property.");
    }

    if (resultJSON.hasOwnProperty("Rated")) {
      movie.rated = resultJSON.Rated;
    } else {
      movie.rated = "N/A";
    }
    if (resultJSON.hasOwnProperty("Director")) {
      movie.director = resultJSON.Director;
    } else {
      movie.director = "N/A";
    }
    if (resultJSON.hasOwnProperty("Writer")) {
      movie.writer = resultJSON.Writer;
    } else {
      movie.writer = "N/A";
    }
    if (resultJSON.hasOwnProperty("Plot")) {
      movie.plot = resultJSON.Plot;
    } else {
      movie.plot = "N/A";
    }
    if (resultJSON.hasOwnProperty("imdbID")) {
      movie.imdbID = resultJSON.imdbID;
    } else {
      movie.imdbID = "N/A";
    }
    if (resultJSON.hasOwnProperty("Awards")) {
      movie.awards = resultJSON.Awards;
    } else {
      movie.awards = "N/A";
    }
    if (resultJSON.hasOwnProperty("Poster")) {
      movie.poster = resultJSON.Poster;
    } else {
      movie.poster = "N/A";
    }
    if (resultJSON.hasOwnProperty("Metascore")) {
      movie.metascore = resultJSON.Metascore;
    } else {
      movie.metascore = "N/A";
    }
    movie.tomatometer = "N/A";
    if (resultJSON.hasOwnProperty("Ratings")) {
      for (let obj of resultJSON.Ratings) {
        if (obj.Source === "Rotten Tomatoes") {
          movie.tomatometer = obj.Value;
          break;
        }
      }
    }
    console.log("Tomatometer: " + movie.tomatometer);
  } else {
    movie.imdbRating = "N/A";
    movie.imdbVotes = "N/A";
    movie.tomatometer = "N/A";
    movie.rated = "N/A";
    movie.director = "N/A";
    movie.writer = "N/A";
    movie.plot = "N/A";
    movie.imdbID = "N/A";
    movie.awards = "N/A";
    movie.poster = "N/A";
    movie.metascore = "N/A";
    console.log(
      "Failed to get movie information from Omdb API. Requesting next movie..."
    );
  }

  let ytID = await extractYTUrl(movies.title);
  movie.ytID = ytID;

  return movie;
}

function extractID(urlString) {
  let matches;
  matches = urlString.match(/\d+/g);
  return matches[0];
}

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "netflix",
};

const user = {
  username: "nkajs2001@hotmail.com",
  password: "pu200000",
  profile: "Q",
};

const apiKey = "81ba8b2c";

module.exports = {
  extractItemDetails,
  extractItems,
  extractOMDBItem,
  dbConfig,
  user,
  apiKey,
};
