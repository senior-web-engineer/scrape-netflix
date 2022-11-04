#!/usr/bin/env node

const movieScraper = require("./movie-scraper.js");
const showScraper = require("./show-scraper.js");
const ObjectsToCsv = require("objects-to-csv");
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

  const movieResults = await movieScraper.scrape(user);
  const showResults = await showScraper.scrape(user);

  //   console.log("Creating csv file...");
  //   const today = Date.now();
  //   const csvFileName = "netflix-movies-as-of-" + today + ".csv";
  //   const csv = new ObjectsToCsv(showResults);
  //   await csv.toDisk("./" + csvFileName);

  //   console.log(
  //     "A CSV file named " +
  //       csvFileName +
  //       " with all movie information has been created in this project's folder."
  //   );

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
    showResults.forEach((re) => {
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
    movieResults.forEach((re) => {
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
