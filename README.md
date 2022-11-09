# Netflix Movies Scraper

This project scrapes "all" movies from Netflix based on the main netflix genres, gathers information about each movie from its netflix detail page and the OMDB database, and downloads all data to a sql file in the project folder. To do this, I use Node.js and Puppeteer, and I gather movie information by making requests to the OMDB API. Sometimes the movie title taken from Netflix is the same as another movie that is older or newer. When movie data is requested from OMDB, OMDB returns the latest movie. This can cause some inaccurate results.

## DISCLAIMER and Future Development

This project was **solely for fun with the hopes of making it easier to choose a movie to watch**.

## How do you use this?

1. If you do not have Node.js, download it.
2. Clone the repository.
3. Unzip the downloaded directory.
4. Change into the directory via command line.
5. Type: `npm ci`. This will clean install the project and download the required modules. You should see a folder called 'node_modules' now inside the directory.
6. Update necessary info like netflix credentials in index.js file.
7. Run project with - Type in command line: `node .\index.js {{arg}}`, and click enter. (available args: movie, show, custom)
8. View the scraping status in the command line.

## Whose code and which websites/articles did I view when making this program?

The names and links below are my attempt to give credit to those whose public information/code helped me. I also spent a lot of time on Stack Overflow figuring out how to do things. I have only included links from Stack Overflow related to Puppeteer, Node.js, or an NPM module.

- Robert James Gabriel
  - https://dev.to/robertjgabriel/a-puppeteer-script-to-discover-and-download-all-netflix-categories-in-a-json-file-2md6
  - https://github.com/RobertJGabriel/netflix-categories
- John Untivero
  - https://gist.github.com/x43romp/2336deec8b533695cd2d
  - https://gist.githubusercontent.com/x43romp/2336deec8b533695cd2d/raw/c922e067b097e5e4cc39b37f1af0f62396edf3f7/NetflixCodes.json
- Fabian Grohs
  - https://www.youtube.com/watch?v=4q9CNtwdawA
- Andre Perunicic
  - https://intoli.com/blog/scrape-infinite-scroll/
- Eric Bidelman
  - https://www.youtube.com/watch?v=lhZOFUY1weo
- Scott Robinson
  - https://stackabuse.com/reading-and-writing-json-files-with-node-js/
- Tendai Mutunhire
  - https://stackabuse.com/writing-to-files-in-node-js/
- Stack Overflow
  - https://stackoverflow.com/questions/46088351/puppeteer-pass-variable-in-evaluate
  - https://stackoverflow.com/questions/46919013/puppeteer-wait-n-seconds-before-continuing-next-line
  - https://stackoverflow.com/questions/45052520/do-i-need-both-package-lock-json-and-package-json
  - https://stackoverflow.com/questions/10396305/npm-package-bin-script-for-windows
  - https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
  - https://stackoverflow.com/questions/5266152/how-to-exit-in-node-js
  - https://stackoverflow.com/questions/5869216/how-to-store-node-js-deployment-settings-configuration-files
  - https://stackoverflow.com/questions/45778474/proper-request-with-async-await-in-node-js
- Miscellaneous
  - https://developers.google.com/web/tools/puppeteer
  - https://code.visualstudio.com/docs/nodejs/nodejs-tutorial
  - https://pptr.dev/
  - https://www.npmjs.com/package/objects-to-csv
  - https://github.com/request/request-promise/issues/132
  - https://github.com/request/request-promise/issues/109
  - https://www.npmjs.com/package/request-promise
  - http://www.omdbapi.com/
  - https://www.npmjs.com/package/objects-to-csv
  - https://blog.npmjs.org/post/171556855892/introducing-npm-ci-for-faster-more-reliable
