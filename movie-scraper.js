const puppeteer = require("puppeteer");
const {
  extractItemDetails,
  extractItems,
  apiKey,
  extractOMDBItem,
} = require("./utils.js");
const netflixMoviesBaseUrl = "https://www.netflix.com/browse/genre/";
const netflixMoviesExtraParams = "?so=az";
const netflixLoginPage = "https://www.netflix.com/login";
const netflixMoviesPage = "https://www.netflix.com/browse/genre/34399";
const netflixDetailPageUrl = "https://www.netflix.com/title/";
const omdbApiBaseUrl = "http://www.omdbapi.com/";

let results = [];

module.exports = {
  scrape: async function scrape(user) {
    // user.apiKey = await getApiKey.getApiKey();

    console.log("Starting scrape...");
    console.log("Launching headless browser...");
    const browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() === "image") {
        req.abort();
      } else {
        req.continue();
      }
    });
    // Open login page and login
    console.log("Loading Netflix login page...");
    await page.goto(netflixLoginPage);
    try {
      await page.type("#id_userLoginId", user.username);
      await page.waitForTimeout(2000);
      await page.type("#id_password", user.password);
      await page.waitForTimeout(2000);
      await page.keyboard.press("Enter");
      console.log("Logging in to Netflix...");
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 });
      await clickUserProfile(page, user);
    } catch (error) {
      await page.waitForTimeout(2000);
      await page.type("#id_password", user.password);
      await page.waitForTimeout(2000);
      await page.keyboard.press("Enter");
      console.log("Retrying logging in to Netflix...");
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 });
      await clickUserProfile(page, user);
    }

    await page.goto(netflixMoviesPage, {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    // Click the 'Genres' drop-down menu
    await page.click('div[label="Genres"] > div');
    console.log("Loading movie genres...");

    const codes = await page.evaluate(() => {
      let anchors = document.querySelectorAll(
        'div[label="Genres"] > div + div li > a'
      );
      let codes = [];

      for (let a of anchors) {
        let genre = {
          name: a.innerText,
          code: a.pathname.substr(a.pathname.lastIndexOf("/") + 1),
        };

        codes.push(genre);
      }

      return codes;
    });

    for (let c of codes) {
      try {
        console.log("Loading genre: " + c.name + " - " + c.code);
        await page.goto(
          netflixMoviesBaseUrl + c.code + netflixMoviesExtraParams,
          { waitUntil: "networkidle2", timeout: 0 }
        );
        let profileSelectionRequired = await page.evaluate(() => {
          let profileDiv = document.querySelector(".list-profiles");
          if (profileDiv === null) {
            return false;
          } else {
            return true;
          }
        });

        if (profileSelectionRequired) {
          console.log("User profile needed...");
          await clickUserProfile(page, user);
        }

        results = await scrapeMovies(page, extractItems, results, user, c);
      } catch (e) {
        console.log(e, "error on loading genre");
        continue;
      }
    }

    for (let result of results) {
      try {
        console.log("Loading detail: " + result.title + " - " + result.NFID);
        await page.goto(netflixDetailPageUrl + result.NFID, {
          waitUntil: "networkidle2",
          timeout: 0,
        });
        let profileSelectionRequired = await page.evaluate(() => {
          let profileDiv = document.querySelector(".list-profiles");
          if (profileDiv === null) {
            return false;
          } else {
            return true;
          }
        });

        if (profileSelectionRequired) {
          console.log("User profile needed...");
          await clickUserProfile(page, user);
        }

        let detail = await scrapeMovieDetails(page, extractItemDetails);
        result.year = detail.year;
        result.rating = detail.rating;
        result.duration = detail.duration;
        result.description = detail.description;
        result.cast = detail.cast;
        result.genres = detail.genres;
        result.atributes = detail.atributes;

        let movie = extractOMDBItem(result);
        result.imdbRating = movie.imdbRating;
        result.imdbVotes = movie.imdbVotes;
        result.tomatometer = movie.tomatometer;
        result.rated = movie.rated;
        result.director = movie.director;
        result.writer = movie.writer;
        result.plot = movie.plot;
        result.imdbID = movie.imdbID;
        result.awards = movie.awards;
        result.poster = movie.poster;
        result.metascore = movie.metascore;
        result.ytID = movie.ytID;
        console.log(result, "Loading detail done");
      } catch (e) {
        console.log(e, "error on loading detail");
        continue;
      }
    }

    browser.close();

    return results;
  },
};

async function scrapeMovieDetails(page, extractItemDetails) {
  console.log("Scraping detail page.");

  let detail = await page.evaluate(extractItemDetails);

  return detail;
}

async function scrapeMovies(
  page,
  extractItems,
  results,
  user,
  c,
  scrollDelay = 1000
) {
  console.log("Scraping page.");

  let movies = [];
  try {
    let previousHeight;
    while (movies.length < 1000000000000) {
      console.log("length of movies: ", movies.length);
      movies = await page.evaluate(extractItems);
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`,
        { timeout: 3000 }
      );
      await page.waitForTimeout(scrollDelay);
    }
  } catch (e) {
    console.log(e, "done scraping page");
  }

  if (movies.length === 0) {
    console.log("No movies in this category.");
  }

  for (let i = 0; i < movies.length; i++) {
    if (!movieExists(results, movies[i].NFID)) {
      // let movie = await extractOMDBItem(movies[i], c);
      let movie = movies[i];
      movie.name_cat = c.name;
      movie.code_cat = c.code;
      movie.type = c.type;
      results.push(movie);
    }
  }

  return results;
}

function movieExists(arrOfMovieObjects, movieNFID) {
  return arrOfMovieObjects.some(
    (movieObject) => movieNFID === movieObject.NFID
  );
}

async function clickUserProfile(page, user) {
  const indexOfUserAccount = await page.evaluate((profile) => {
    let userAccounts = document.querySelector(
      "#appMountPoint > div > div > div:nth-child(1) > div.bd.dark-background > div.profiles-gate-container > div > div > ul"
    ).children;

    // Default user profile index.
    let index = 0;

    for (let i = 0; i < userAccounts.length; i++) {
      if (userAccounts[i].innerText === profile) {
        index = i;
        break;
      }
    }

    return index + 1;
  }, user.profile);

  // Click the user account if the user entered a correct account name. Otherwise, choose 1st account.
  await page.click(
    "li.profile:nth-child(" +
      indexOfUserAccount +
      ") > div:nth-child(1) > a:nth-child(1)"
  );
  console.log("Loading user profile...");
  await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 });
}
