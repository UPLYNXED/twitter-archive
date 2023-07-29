# Twitter Scraper Userscript
This is a userscript that scrapes Twitter for tweets and saves them to a file. It is intended to be used with [tampermonkey](https://www.tampermonkey.net/), but it should work with other userscript managers as well.
You can also execute the script in the browser console, but you will have to do so on every actual full page (re)load.

## Usage
### Tampermonkey Installation (recommended)
1. Install tampermonkey or another userscript manager
2. Create a new userscript
3. Copy the contents of `twitter-scraper.js` into the userscript
4. Save the userscript
5. If you want to stop the script, disable the userscript

### Browser Console
1. Open the browser console
2. Copy the contents of `twitter-scraper.js` into the console
3. Press enter to execute the script
4. Repeat steps 2 and 3 on every actual full page (re)load
5. If you want to stop the script, refresh the page

### Executing a scrape
1. Open the Twitter page you want to scrape, this script is specifically written to run on Search and Profile pages.
2. If you are using tampermonkey, the script will automatically start. If you are using the browser console, you will have to execute the script manually.
3. The script runs fresh on every full page (re)load, so make sure not to refresh the page while the script is running.
4. In the current version, the script does not automatically scroll down to load more tweets. You will have to do this manually. See note 2 for more information.
5. Once you have scrolled down a page, it's recommended to repeat the process on every page of the profile you want to archive, and also include a search for the profile's username in the search bar ("from:username"). This will ensure that you get most of the tweets on the profile. You can also search for specific keywords to get tweets that are not on the profile (e.g. "from:username keyword").
6. Once you have scrolled down all the pages you want to archive, you can save the tweets to a file by clicking the "Archive Tweets" button in the top right corner of the page.
7. The tweets will be saved to a file called `tweets.json` in your downloads folder. You can open this file in a text editor or other program to view the tweets.
8. If you want to start a fresh scrape, you will have to refresh the page and start from step 4.

## Notes
1. You can upload a previous `tweets.json` file to continue a previous scrape. The script will automatically ignore tweets that are already in the file and only add new tweets.
2. The script will not automatically scroll down to load more tweets. You will have to do this manually. The easiest way to do this is to click the scroll wheel on your mouse and drag it down, and leave it there until the page stops scrolling.
3. You may get rate limited by Twitter if you scroll down too fast. If this happens, you will have to wait a few minutes before you can continue scrolling. You can also adjust the speed of your scrolling to avoid this.
4. Not all tweets will show up on the profile page. This is why it's recommended to use search terms to get tweets that are not on the profile page.
5. Optimal search terms for scraping a profile are "from:username" and "from:username keyword".
   - "from:username filter:replies" will only get replies from the profile. These tend to not show up on the profile page, so it's recommended to use this search term.
   - "from:username filter:media" will only get tweets with media from the profile. Use this if you want to be extra thorough (recommended).
   - "to:username" or "(@username)" will only get tweets that mention the profile. This is not recommended, as it could make the scrape take a very long time if the profile is popular.

## Known Issues
- The script currently does not yet autoscroll to load more tweets. This is planned for a future update.
- Buttons are currently overlapping on the top right corner of the page making certain features inaccessible. This is planned to be fixed soon.
- The script does not currently archive media (images, videos, etc.). This is planned for a future update, or possibly a separate script.
- The script does not currently archive entire threads automatically. The plan is to add a feature that will scrape entire threads if the first tweet is by the profile being scraped.
- The API has been changed again and the script is currently not working. This will be fixed soon.

## Planned Features
- Autoscroll to load more tweets
- Archive media (images, videos, etc.)
- Automatically scrape entire threads
- Ability to define a username and search terms and let the script handle scraping the different pages itself automatically.

## Changelog
### 1.0.5 (broken version)
- Initial public release
- Added ability to upload previous `tweets.json` file to continue a previous scrape
- Started work on autoscroll feature
- Started work on automatic thread scraping feature
- Added a rough first version of the README file documentation