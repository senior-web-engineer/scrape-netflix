#!/usr/bin/env node

const movieScraper = require("./movie-scraper.js");
const showScraper = require("./show-scraper.js");
const customScraper = require("./custom-scraper.js");
const mysql = require("mysql");

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "netflix",
});

(async () => {
  let user = {
    username: "nkajs2001@hotmail.com",
    password: "pu200000",
    profile: "Q",
  };
  let args = process.argv.slice(2);
  let results = [];
  if (args[0] == "custom") {
    results = await customScraper.scrape(user);
  } else if (args[0] == "movie") {
    results = await movieScraper.scrape(user);
  } else if (args[0] == "show") {
    results = await showScraper.scrape(user);
  } else {
    results = [];
    throw Error("Incorrect Arg");
  }

  console.log("Updating data to mysql...");

  pool.getConnection(function (err, connection) {
    var query = connection.query(
      "UPDATE netflix SET status=0",
      function (error, results, fields) {
        if (error) {
          console.log(error, "error on updating db");
        }
      }
    );

    results.forEach((re) => {
      // Use the connection
      var query = connection.query(
        "INSERT INTO netflix SET ? ON DUPLICATE KEY UPDATE title = VALUES(title), year = VALUES(year),duration = VALUES(duration), description = VALUES(description), cast = VALUES(cast), genres = VALUES(genres),rating = VALUES(rating),atributes = VALUES(atributes), status=1",
        re,
        function (error, results, fields) {
          if (error) {
            console.log(error, "error on inserting to db");
          }
        }
      );
    });

    // And done with the connection.
    connection.release();
    pool.end(function (err) {
      // all connections in the pool have ended
      console.log(" ALL Updating data to mysql ended");
      process.exitCode = 1;
    });
  });
})();
