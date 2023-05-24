# Twitter Archive Page
This project aims to provide a simple front-end for the Twitter Archive data scraped from Twitter.
The entire project is written in JavaScript & HTML and uses a few lightweight libraries for templating and styling.
This is done intentionally so that the project can be run and hosted without any server-side code.

Eventually this project will support full local browsing, but for now it still requires a server to run due to limitations of local file access in browsers.

> **NOTE:** This project is still in early development and is not yet ready for public use. It is currently missing many features and may have bugs. If you want to contribute to the project, feel free to contact me on Twitter [@uplynxed](https://twitter.com/uplynxed).


## Table of Contents
- [Twitter Archive Page](#twitter-archive-page)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Examples](#examples)
  - [Usage](#usage)
  - [Dependencies](#dependencies)
  - [Development](#development)
  - [Twitter Archive Scraper](#twitter-archive-scraper)
  - [License](#license)



## Features
- Zero server-side code, can be hosted on any static web server.
- Works with any Twitter account, not just your own, as long as you have a tweets.json file for it.
- View tweets in a familiar Twitter-like timeline layout.
- View individual tweets and any backed-up replies to them.
- View tweet's with images, videos, GIFs, quoted tweets, polls, and more (to come).
- Filter tweets by media, replies, retweets, and more (to come).
- Search through the entire archive for specific tweets.
- Set a cutoff date to hide tweets newer than a certain date.
- Set tweets as favorites and view them in a separate list.
  - Export and import favorites as a JSON file.
- Responsive design for mobile and desktop.
- Dark/Light mode support.



## Examples
- [My Demo Archive](https://uplynxed.github.io/twitter-archive/)
- [KiXSTAr's Archive](https://kixstar.valk.cam/)



## Usage
1. Download the latest release from the [releases page](https://github.com/uplynxed/twitter-archive/releases).
2. Scrape your tweets using the scraper userscript or bookmarklet. (scraper is currently not publicly available, sorry!)
3. Download the resulting tweets.json file and place it in the same directory as this file.
4. Find the user ID of the account you want to view (you can use https://tweeterid.com/ to find it) and set it in the config.json file.
5. Upload the entire directory of the project to a web server. You can use GitHub Pages, Netlify, etc.
   - or run a local web server, using something simple like [XAMPP](https://www.apachefriends.org/index.html) or [USBWebserver](https://www.usbwebserver.net/webserver/) if you don't have one.
6. Open this file in a web browser. If you're using a local web server, you can use the URL `http://localhost/` to access it.
7. You're done! You can now view your archived tweets in a web browser.



## Dependencies
This project uses the following libraries and frameworks, which are currently loaded in from a CDN (Content Delivery Network) to reduce the size of the project.
| Library            | Purpose                           | Link                             |
| ------------------ | --------------------------------- | -------------------------------- |
| jQuery 3.6.0       | As a dependency for JSViews       | https://jquery.com/              |
| JSViews 1.0.13     | For templating and data binding   | https://www.jsviews.com/         |
| Bootstrap 5.3.0    | For styling and layout            | https://getbootstrap.com/        |
| Font Awesome 6.4.0 | For icons                         | https://fontawesome.com/         |
| Twemoji 14.0.2     | For parsing Twitter emojis        | https://twemoji.twitter.com/     |



## Development
If you want to contribute to this project, you can clone the repository and run it locally.
For development, I use [Visual Studio Code](https://code.visualstudio.com/) with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
You can use any web server you want if you don't want to use VS Code. Useful alternatives include [XAMPP](https://www.apachefriends.org/index.html) and [USBWebserver](https://www.usbwebserver.net/webserver/).

Since the project doesn't use any server-side code, it's pretty simple to get started with it.

If you need any help, feel free to contact me on Twitter [@uplynxed](https://twitter.com/uplynxed).



## Twitter Archive Scraper
The Twitter Archive Scraper is a userscript/bookmarklet that can be used to scrape your tweets from Twitter and save them as a JSON file.
It is currently not publicly available, but may be released in the future.

> **NOTE:** Depending on the number of requests, I'm willing to scrape your tweets for you. Contact me on Twitter [@uplynxed](https://twitter.com/uplynxed) if you're interested.


## License
This project is licensed under the [MIT License](LICENSE).

*This project is not affiliated with Twitter in any way.*