const puppeteer = require("puppeteer");

const netflixMoviesBaseUrl = "https://www.netflix.com/browse/genre/";
const netflixMoviesExtraParams = "?so=az";
const netflixLoginPage = "https://www.netflix.com/login";
const netflixDetailPageUrl = "https://www.netflix.com/title/";
const codes = require("./miscellaneous/codes-custom.json");
let results = [];

module.exports = {
  scrape: async function scrape(user) {
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

        results = await scrapeMovies(page, extractItems, results, user);
      } catch (e) {
        console.log(e, "error on loading genre");
        continue;
      }
    }

    console.log("Completed scraping Netflix show titles.");

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
        result.type = detail.type;
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
  scrollDelay = 1000
) {
  console.log("Scraping page.");

  let movies = [];
  try {
    let previousHeight;
    while (movies.length < 1000000000000) {
      console.log("length of shows: ", movies.length);
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
    console.log("No shows in this category.");
  }

  for (let i = 0; i < movies.length; i++) {
    if (!movieExists(results, movies[i].NFID)) {
      let movie = new Object();
      movie.title = movies[i].title;
      movie.img = movies[i].img;
      movie.url = movies[i].url;
      movie.NFID = extractID(movies[i].url);
      results.push(movie);
    }
  }

  return results;
}

function extractID(urlString) {
  let matches;
  matches = urlString.match(/\d+/g);
  return matches[0];
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

function extractItems() {
  const extractedPElements = document.querySelectorAll("p.fallback-text");
  const extractedAElements = document.querySelectorAll("a.slider-refocus");
  const extractedImgElements = document.querySelectorAll(
    "img.boxart-image-in-padded-container"
  );
  const items = [];
  let item = {};
  extractedPElements.forEach(function (element, i) {
    item = {
      title: element.innerText,
      img: extractedImgElements[i].getAttribute("src"),
      url: extractedAElements[i].getAttribute("href"),
    };
    items.push(item);
  });
  return items;
}

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
    type: len == 5 ? "movie" : "show",
  };

  return item;
}
