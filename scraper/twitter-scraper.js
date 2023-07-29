// ==UserScript==
// @name         Archive tweets scraper script
// @namespace    http://twitter.com/
// @version      1.0.5
// @description  Scapes tweets from Twitter's own API by intercepting XHR requests.
// @author       Avelyn "UPLYNXED" Neervoort <twitter.com/upLYNXed>
// @match        https://twitter.com/search?q=*
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	/**
	 * Archive tweets scraper script
	 *
	 * @author Avelyn "UPLYNXED" Neervoort <twitter.com/upLYNXed>
	 * @version 1.0.5
	 * @license MIT
	 *
	 * @description A javascript script to run from the console on twitter.com that archives tweets from twitter.com's own API and lets you download them as a JSON file for archival purposes.
	 *
	 * NOTE: This script is written to run as a userscript in Tampermonkey, but can also be run from the console.
	 *
	 * @usage If using Tampermonkey:
	 *			1. Install Tampermonkey from https://www.tampermonkey.net/
	*			2. Create a new userscript, copy and paste the contents of this file into the userscript, and save it
	*			3. Open a tab just for the purpose of running this script, and navigate to the twitter.com page you want to archive
	*			4. Click the Tampermonkey icon in the top right of your browser, and click the name of the userscript you created in step 2, make sure it is enabled.
	*			   Check if you can see the 'Archive Tweets' button in the top right of the page to confirm it is working.
	*			5. Scroll down to the bottom of the 'Tweets' profile page, then switch to the 'Replies' tab and repeat. Continue to the 'Media' tab and repeat again.
	*			6. For completionist's sake, run a search for the user with the query "(from:username)", replacing username for the profile you are archiving, and scroll down to the bottom again.
	*			   Repeat with a couple of different search queries but make sure to include the "(from:username)" part.
	*			7. Click the 'Archive Tweets' button that should be visible in the top right of the page, and wait for the JSON file to download.
	*
	*			8. To use this archive, you can use the "Twitter Archive" viewer at https://github.com/UPLYNXED/twitter-archive and follow the instructions in the index.html file there to set it up.
	*			   (or, once finished, you can upload the JSON file to [TODO: URL]) to view the archive)

	* @usage If not using Tampermonkey:
	*			1. Open a tab just for the purpose of running this script, and navigate to the twitter.com page you want to archive
	*			2. Open the console (F12 on most browsers)
	*			3. Copy and paste the contents of this file into the console, and press enter
	*			4. Follow steps 5-8 from the Tampermonkey instructions above after you have confirmed the script is working by checking for the 'Archive Tweets' button in the top right of the page.
	*/

	/**
	 * Object to store all tweets and users in that we've taken from the adaptive.json files.
	 * Remove duplicates by using the tweet ID (id_str) or user ID (id_str) as the key.
	 *
	 * @type {object} window.tweets_object
	 *
	 * @property {object} tweets The tweets object
	 * @property {object} users The users object
	 */
	window.tweets_object = {
		tweets: {},
		users: {}
	}

	/**
	 * Array to store all the conversation tweets in that we've taken from the adaptive.json files.
	 *
	 * @type {Array} window.conversation_tweets
	 */
	window.conversation_tweets = [];

	/**
	 * Object to store all the tweets in that we've taken from the adaptive.json files.
	 * Remove duplicates by using the tweet ID as the key.
	 *
	 * @type {object}
	 */
	var tweets = {};

	/**
	 * Object to store all the users in that we've taken from the adaptive.json files.
	 * Remove duplicates by using the user ID as the key.
	 *
	 * @type {object}
	 */
	var users = {};

	/**
	 * Object to store all the JSON API files in that we've taken from the network requests.
	 *
	 * @type {object}
	 */
	window.json_API_Files = {
		"adaptive.json": {},
		"UserTweets": {}
	};

	/**
	 * Object with previously downloaded tweets.
	 * To be assigned via the console by pasting the contents of the tweets.json file.
	 *
	 * @type {object}
	 *
	 * @property {object} tweets The tweets object
	 * @property {object} users The users object
	 */
	window.tweets_JSON_Upload = {};

	/**
	 * Download the tweets object as a JSON file.
	 *
	 * @param {object} tweets The tweets object to download
	 *
	 * @returns {boolean} Whether the tweets were downloaded successfully
	 */
	function download_Tweets_JSON_File(tweets_object = window.tweets_object) {
		if ( tweets_object !== undefined ) {
			tweets = tweets_object.tweets;
			users = tweets_object.users;
		} else {
			tweets = window.tweets_object.tweets;
			users = window.tweets_object.users;
		}

		// if the tweets object is empty
		if ( Object.keys(tweets).length === 0 && tweets.constructor === Object ) {
			// log an error
			console.error('tweets object is empty');
			return false;
		}

		// if the users object is empty
		if ( Object.keys(users).length === 0 && users.constructor === Object ) {
			// log an error
			console.error('users object is empty');
			return false;
		}

		// Check if the user objects inside the users object have the id_str property, if not, add it from the key
		for ( var user_id_str in users ) {
			if ( !users[user_id_str].hasOwnProperty('id_str') ) {
				users[user_id_str]['id_str'] = user_id_str;
			}
		}

		// Combine the tweets and users objects back into a single object
		window.tweets_object = {
			tweets: tweets,
			users: users
		};

		// Merge the output_object and the tweetsJSON object, if a tweetsJSON object exists
		if ( Object.keys(window.tweets_JSON_Upload).length !== 0 && window.tweets_JSON_Upload.constructor === Object ) {
			window.tweets_object.tweets    = Object.assign({}, window.tweets_object.tweets, window.tweets_JSON_Upload.tweets);
			window.tweets_object.users     = Object.assign({}, window.tweets_object.users, window.tweets_JSON_Upload.users);
		}

		// We no longer need the tweets_JSON_Upload object, so delete it
		delete window.tweets_JSON_Upload;

		// create a new blob from the tweets object
		var blob = new Blob( [ JSON.stringify(window.tweets_object) ], { type: 'application/json' } );
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = 'tweets.json';
		a.click();

		return true;
	}

	/**
	 * Function to upload a JSON file of tweets previously downloaded from this script.
	 *
	 * @returns {boolean} Whether the tweets were uploaded successfully
	 */
	function upload_Tweets_JSON_File() {
		var input = document.createElement('input');
		input.type = 'file';
		input.id = 'upload-tweets-input';
		input.accept = '.json';
		input.style.display = 'none';

		// wait until the page has loaded and insert the input element into the page
		requestIdleCallback(function() {
			document.body.appendChild(input);
		});

		input.addEventListener('change', function(e) {
			if ( e.target.files.length > 0 ) {
				var reader = new FileReader();
				reader.addEventListener('load', function(e) {
					try {
						window.tweets_JSON_Upload = JSON.parse(e.target.result);
						download_Tweets_JSON_File();
					} catch (e) {
						console.error(e.message);
					}
				});
				reader.readAsText(e.target.files[0]);
			}
		});

		return true;
	}


	/**
	 * Function to add the tweets and users from API files to the tweets_object object.
	 *
	 * @param {object} json_API_File The adaptive.json file to add the tweets from
	 *
	 * @returns {boolean} Whether the tweets were added successfully
	 */
	function append_Tweets(json_API_File) {
		// if the contents of the json_API_File is not an object
		if ( typeof json_API_File !== 'object' ) {
			console.error( 'ERROR: json_API_File is not an object.', json_API_File );
			return false;
		}

		// // if the json_API_File does not have a globalObjects property
		// if ( !json_API_File.hasOwnProperty('globalObjects') ) {
		// 	console.error( 'ERROR: json_API_File does not have a globalObjects property.', json_API_File );
		// 	return false;
		// }

		// if the json_API_File.globalObjects does not have a tweets or users property
		if ( !json_API_File.hasOwnProperty('tweets') || !json_API_File.hasOwnProperty('users') ) {
			console.error( 'ERROR: json_API_File does not have a tweets or users property.', json_API_File );
		}

		// // Iterate through the tweets in the json_API_File and add them to the tweets object if they don't already exist in it and order them by date
		// for ( var tweetId in json_API_File.globalObjects.tweets ) {
		// 	// if the tweetId is not in the tweets object
		// 	if ( !tweets.hasOwnProperty(tweetId) ) {
		// 		// add the tweet to the tweets object
		// 		tweets[tweetId] = json_API_File.globalObjects.tweets[tweetId];
		// 	} else {
		// 		return false;
		// 	}
		// }
		window.tweets_object.tweets = Object.assign({}, window.tweets_object.tweets, json_API_File.tweets);
		window.tweets_object.users 	= Object.assign({}, window.tweets_object.users, json_API_File.users);


		// order the tweets object by date
		window.tweets_object.tweets = Object.keys( window.tweets_object.tweets )
			.sort(function(a, b) {
				return new Date(window.tweets_object.tweets[a].created_at) - new Date(window.tweets_object.tweets[b].created_at);
			})
			.reduce(function(acc, key) {
				acc[key] = window.tweets_object.tweets[key];
				return acc;
			}, {});

		return true;
	}

	/**
	 * Function to add a button to the page to download the tweets object as a JSON file.
	 *
	 * @returns {boolean} Whether the button was added successfully
	 */
	function insert_Button_Download() {
		if ( document.getElementById('archive-tweets-button') ) {
			return false;
		}

		var button = document.createElement('button');
		button.id = 'archive-tweets-button';
		button.innerText = 'Archive Tweets';
		button.style.position = 'fixed';
		button.style.top = '0';
		button.style.right = '0';
		button.style.zIndex = '9999';

		// wait until the page has loaded and insert the button element into the page
		requestIdleCallback(function() {
			document.body.appendChild(button);
		});

		return true;
	}

	/**
	 * Function to add a button to the page to upload a JSON file of tweets.
	 *
	 * @returns {boolean} Whether the button was added successfully
	 */
	function insert_Button_Upload() {
		if ( document.getElementById('upload-tweets-button') ) {
			return false;
		}

		var button = document.createElement('button');
		button.id = 'upload-tweets-button';
		button.innerText = 'Upload Tweets';
		button.style.position = 'fixed';
		button.style.top = '30';
		button.style.right = '0';
		button.style.zIndex = '9999';

		// wait until the page has loaded and insert the button element into the page
		requestIdleCallback(function() {
			document.body.appendChild(button);
		});

		return true;
	}

	/**
	 * Function to add a button to the page to automatically scroll to the bottom of the page in intervals.
	 *
	 * @returns {boolean} Whether the button was added successfully
	 */
	function insert_Button_Auto_Scroll() {
		if ( document.getElementById('auto-scroll-button') ) {
			return false;
		}

		var button = document.createElement('button');
		button.id = 'auto-scroll-button';
		button.innerText = 'Auto Scroll';
		button.style.position = 'fixed';
		button.style.top = '60';
		button.style.right = '0';
		button.style.zIndex = '9999';

		// wait until the page has loaded and insert the button element into the page
		requestIdleCallback(function() {
			document.body.appendChild(button);
		});

		return true;
	}

	/**
	 * Function to add a button to the page to automatically archive the conversation tweets.
	 *
	 * @returns {boolean} Whether the button was added successfully
	 */
	function insert_Button_Auto_Browse_Conversation_Tweets() {
		if ( document.getElementById('auto-browse-convos-button') ) {
			return false;
		}

		var button = document.createElement('button');
		button.id = 'auto-browse-convos-button';
		button.innerText = 'Auto Browse Conversation Tweets';
		button.style.position = 'fixed';
		button.style.top = '90';
		button.style.right = '0';
		button.style.zIndex = '9999';

		// wait until the page has loaded and insert the button element into the page
		requestIdleCallback(function() {
			document.body.appendChild(button);
		});

		return true;
	}

	/**
	 * Function to add all buttons to the page.
	 *
	 * @returns {void}
	 */
	function insert_Buttons() {
		insert_Button_Download();
		insert_Button_Upload();
		insert_Button_Auto_Scroll();
		insert_Button_Auto_Browse_Conversation_Tweets();
	}

	/**
	 * Event listener for the button to download the tweets object as a JSON file.
	 */
	document.addEventListener('click', function(e) {
		if ( e.target.id === 'archive-tweets-button' ) {
			download_Tweets_JSON_File();
		} else if ( e.target.id === 'upload-tweets-button' ) {
			upload_Tweets_JSON_File();
		} else if ( e.target.id === 'auto-browse-convos-button' ) {
			filter_Conversation_Tweets(window.tweets_object.tweets);
			auto_Browse_Conversation_Tweets(window.conversation_tweets);
		}
	});

	/**
	 * Function to automatically scroll to the bottom of the page at a set interval.
	 *
	 * @param {number} interval The interval in milliseconds to scroll to the bottom of the page
	 *
	 * @returns {boolean} Whether we can keep scrolling (if we are at the end of the page, we can't)
	 */
	function scroll_To_Bottom(interval = 750) {
		// Start a setInterval to scroll to the bottom of the page every 750ms
		var scroll_interval = setInterval(function() {
			// Store the current scroll position
			var scroll_position = window.scrollY;

			requestIdleCallback(function() {
				// Scroll to the bottom of the page
				window.scrollTo(0, document.body.scrollHeight);
			});

			// If the scroll position is the same as it was before, we are at the very end of the page
			if ( scroll_position === window.scrollY ) {
				// Stop the setInterval
				clearInterval(scroll_interval);
				alert(`Done scrolling to the bottom of this page! We've found ${Object.keys(tweets).length} tweets and ${Object.keys(users).length} users so far.`);
				return false;
			} else {
				return true;
			}
		}, interval);
	}

	/**
	 * Function to filter tweets with a conversation_id_str
	 *
	 * @param {object} tweets_object The tweets object to check
	 *
	 * @returns {Array} An array of tweet objects that have a conversation_id_str
	 */
	function filter_Conversation_Tweets(tweets_object) {
		var conversation_tweets = [];
		Object.keys(tweets_object).forEach(function(tweet_id) {
			if ( tweets_object[tweet_id].hasOwnProperty('conversation_id_str') ) {
				// if the conversation_id_str does not match the tweet_id
				if ( tweets_object[tweet_id].conversation_id_str !== tweet_id ) {
					conversation_tweets.push( tweets_object[tweet_id].conversation_id_str );
				}
			}
		});

		// Merge the new array with the existing conversation_tweets array
		window.conversation_tweets = window.conversation_tweets.concat(conversation_tweets);

		return window.conversation_tweets;
	}

	/**
	 * Function to navigate to every first tweet in a conversation thread and scrape the tweets from there that match specific criteria.
	 *
	 * @param {object} tweets_array The tweet objects to check
	 *
	 * @returns {void}
	 */
	function auto_Browse_Conversation_Tweets(tweets_array) {
		// Iterate through the tweets in the tweets_array and navigate to the first tweet in the conversation thread
		tweets_array.forEach(function(conversation_id_str) {
			window.location.href = `https://twitter.com/i/web/status/${conversation_id_str}`;
			// wait 500ms for the page to load to start, then requestIdleCallback to wait for the page to finish loading
			setTimeout(function() {
				requestIdleCallback(function() {
					// Check if the page is a 404 page by looking for the text "Something went wrong. Try reloading." in the page
					if ( document.body.innerText.indexOf('Something went wrong. Try reloading.') > -1 ) {
						console.error('ERROR: 404 page');
						return false;
					}

					scroll_To_Bottom();
				});
			}, 500);
		});

		return;
	}

	/**
	 * Function to scrape the tweets and users from a JSON API file.
	 *
	 * @param {object} json_API_File The JSON API file to scrape the tweets and users from
	 * @param {string} type The type of JSON API file to scrape
	 *
	 * @returns {object} The tweets_object
	 */
	function scrape_From_JSON_API_File(json_API_File, type) {
		// if the contents of the json_API_File is not an object
		if ( typeof json_API_File !== 'object' ) {
			console.error( 'ERROR: json_API_File is not an object.', json_API_File );
			return false;
		}

		let types 					= ['UserTweets', 'UserMedia', 'UserTweetsAndReplies', 'TweetDetail'];
		let object_path_to_tweets 	= ['data', 'user', 'result', 'timeline_v2', 'timeline', 'instructions'];

		let output 	= {
			tweets: {},
			users: {}
		};

		// if the type is not in the types array
		if ( !types.includes(type) && type !== 'adaptive.json' ) {
			console.error( 'ERROR: type is not in the types array.', type );
			return false;
		}

		// Insert the buttons
		insert_Buttons();

		if ( type === 'adaptive.json' ) {							// If the type is adaptive.json, check if the json_API_File has globalObjects, globalObjects.tweets, and globalObjects.users properties
			// if the json_API_File does not have a globalObjects property
			if ( !json_API_File.hasOwnProperty('globalObjects') ) {
				console.error( 'ERROR: json_API_File does not have a globalObjects property.', json_API_File );
				return false;
			}

			// if the json_API_File.globalObjects does not have a tweets or users property
			if ( !json_API_File.globalObjects.hasOwnProperty('tweets') || !json_API_File.globalObjects.hasOwnProperty('users') ) {
				console.error( 'ERROR: json_API_File.globalObjects does not have a tweets or users property.', json_API_File );
			}

			output = json_API_File;
		} else if ( types.includes(type) ) {						// If the type is UserTweets, UserMedia, or UserTweetsAndReplies, check if the json_API_File has data and data.user properties
			// if the json_API_File does not have a data property
			if ( !json_API_File.hasOwnProperty('data') ) {
				console.error( 'ERROR: json_API_File does not have a data property.', json_API_File );
				return false;
			}

			// if the type is UserTweets, UserMedia, or UserTweetsAndReplies, check if the json_API_File.data does not have a user property
			if ( type === 'UserTweets' || type === 'UserMedia' || type === 'UserTweetsAndReplies' ) {
				if ( !json_API_File.data.hasOwnProperty('user') ) {
					console.error( 'ERROR: json_API_File.data does not have a user property.', json_API_File );
					return false;
				}
			} else if ( type === 'TweetDetail' ) {
				if ( !json_API_File.data.hasOwnProperty('threaded_conversation_with_injections_v2') ) {
					console.error( 'ERROR: json_API_File.data does not have a threaded_conversation_with_injections_v2 property.', json_API_File );
					return false;
				}

				object_path_to_tweets = ['data', 'threaded_conversation_with_injections_v2', 'instructions'];
			}



			// find the tweets in the json_API_File using the object_path_to_tweets array
			let instructions 	= object_path_to_tweets.reduce((prev, cur) => prev && prev[cur], json_API_File);
			let entries 		= [];

			// find which instructions are the tweets
			for ( var i = 0; i < instructions.length; i++ ) {
				if ( instructions[i].type === 'TimelineAddEntries' ) {
					entries = instructions[i].entries;
					break;
				}
			}

			// find which entries are the tweets
			for ( var i = 0; i < entries.length; i++ ) {
				let tweet = {};
				let user = {};
				if ( entries[i].content.entryType === 'TimelineTimelineItem' ) {
					// If the tweet has a trusted_friends_info_result property, it is a protected tweet and we need to skip it
					if ( entries[i].content.itemContent.tweet_results.result.hasOwnProperty('trusted_friends_info_result') ) {
						continue;
					}
					tweet 			= entries[i].content.itemContent.tweet_results.result.legacy;
					user 			= entries[i].content.itemContent.tweet_results.result.core.user_results.result.legacy;
					user['id_str'] 	= entries[i].content.itemContent.tweet_results.result.core.user_results.result.rest_id;

					output.tweets[tweet.id_str] = tweet;
					output.users[user.id_str] = user;
				} else if ( entries[i].content.entryType === 'TimelineTimelineModule' ) {
					tweet 			= entries[i].content.items;

					for ( var j = 0; j < tweet.length; j++ ) {
						let tweet_sub = {};
						let user_sub = {};
						if ( tweet[j].item.itemContent.itemType === 'TimelineTweet' ) {
							let tweet_property = "";
							if ( tweet[j].item.itemContent.tweet_results.result.hasOwnProperty('tweet') ) {
								tweet_property = "tweet";
							}

							// If the tweet has a trusted_friends_info_result property, it is a protected tweet and we need to skip it
							if ( entries[i].item.itemContent.tweet_results.result[tweet_property].hasOwnProperty('trusted_friends_info_result') ) {
								continue;
							}

							tweet_sub 			= tweet[j].item.itemContent.tweet_results.result[tweet_property].legacy;
							let core_sub 		= JSON.parse(JSON.stringify(tweet[j].item.itemContent.tweet_results.result[tweet_property]))
								core_sub		= core_sub.core;
							user_sub 			= core_sub.user_results.result.legacy;
							user_sub['id_str'] 	= core_sub.user_results.result.rest_id;

							if ( j === 0 ) {
								window.conversation_tweets.push(tweet.id_str);
							}

							output.tweets[tweet_sub.id_str] = tweet_sub;
							output.users[user_sub.id_str] = user_sub;
						}
					}
				}
			}
		}

		append_Tweets(output);

		// log the tweets object
		console.log('tweets: ', Object.keys(tweets).length, ' - users: ', Object.keys(users).length, tweets);

		return window.tweets_object;
	}

	/**
	 * Function to scrape the JSON API files from the network requests.
	 *
	 * @param {object} myXHR The XMLHttpRequest object
	 *
	 * @returns {void}
	 */
	function scrape_JSON_API_Files(myXHR) {
		// wait 2 seconds for the response to be ready
		setTimeout(function() {
			// if the response is ready
			if ( myXHR.xhr.readyState == 4 ) {
				// if the responseURL is adaptive.json
				if ( myXHR.xhr.responseURL.indexOf('adaptive.json') > -1 ) {
					window.json_API_Files["adaptive.json"][myXHR.xhr.responseURL] = myXHR.xhr.response;
					scrape_From_JSON_API_File(JSON.parse(myXHR.xhr.response), 'adaptive.json');
				}
				// if the responseURL is UserTweets
				else if ( myXHR.xhr.responseURL.indexOf('UserTweets') > -1 || myXHR.xhr.responseURL.indexOf('UserMedia') > -1 || myXHR.xhr.responseURL.indexOf('UserTweetsAndReplies') > -1  || myXHR.xhr.responseURL.indexOf('TweetDetail') > -1 ) {
					window.json_API_Files["UserTweets"][myXHR.xhr.responseURL] = myXHR.xhr.response;

					if ( myXHR.xhr.responseURL.indexOf('UserTweets') > -1 ) {
						scrape_From_JSON_API_File(JSON.parse(myXHR.xhr.response), 'UserTweets');
					} else if ( myXHR.xhr.responseURL.indexOf('UserMedia') > -1 ) {
						scrape_From_JSON_API_File(JSON.parse(myXHR.xhr.response), 'UserMedia');
					} else if ( myXHR.xhr.responseURL.indexOf('UserTweetsAndReplies') > -1 ) {
						scrape_From_JSON_API_File(JSON.parse(myXHR.xhr.response), 'UserTweetsAndReplies');
					} else if ( myXHR.xhr.responseURL.indexOf('TweetDetail') > -1 ) {
						scrape_From_JSON_API_File(JSON.parse(myXHR.xhr.response), 'TweetDetail');
					}
				}

			}
		}, 2000);
	}




	/** XMLHttpRequest Hijacing ***************************************************************/

	/**
	 * Store the original XMLHttpRequest object so we can use it despite the hijacking
	 *
	 * @type {object}
	 */
	var xmlreqc = XMLHttpRequest;

	/**
	 * Hijack the XMLHttpRequest object to monitor network requests
	 *
	 * @returns {object|null} The XHR object or null if the object could not be hijacked
	 */
	XMLHttpRequest = function() {
		try {
			this.xhr = new xmlreqc();
			let myXHR = this;

			// wait for the response console.log the responseURL
			this.xhr.onreadystatechange = scrape_JSON_API_Files( myXHR );

			return this.xhr;
		} catch (e) {
			console.error(e.message);
			return null;
		}
	}



	/**
	 * Hijack the XMLHttpRequest.open function to monitor network requests
	 *
	 * @param {string} method The method to use
	 * @param {string} url The URL to request
	 * @param {boolean} async Whether the request should be asynchronous
	 * @param {string} user The username to use for authentication
	 * @param {string} password The password to use for authentication
	 *
	 * @returns {object|null} The XHR object or null if the object could not be hijacked
	 */
	XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
		console.log('open');
		try {
			return this.xhr.open(method, url, async, user, password); // send it on
		} catch (e) {
			console.error(e.message);
			return null;
		}
	}

	/**
	 * Hijack the XMLHttpRequest.setRequestHeader function to monitor network requests
	 *
	 * @param {string} header The header to set
	 * @param {string} value The value to set the header to
	 */
	XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
		console.log('setRequestHeader');
		try {
			this.xhr.setRequestHeader(header, value); // send it on
		} catch (e) {
			console.error(e.message);
		}
	}

	/**
	 * Hijack the XMLHttpRequest.send function to monitor network requests
	 *
	 * @param {string} data The data to send
	 */
	XMLHttpRequest.prototype.send = function(data) {
		console.log('send');
		var myXHR = null;
		try {
			myXHR = this;
			this.xhr.onreadystatechange = function() {
				myXHR.onreadystatechangefunction();
			};
			this.xhr.send(data); // send it on
		} catch (e) {
			console.error(e.message);
		}
	}

	/**
	 * Hijack the XMLHttpRequest.onreadystatechange function to monitor network requests
	 */
	XMLHttpRequest.prototype.onreadystatechangefunction = function() {
		try {
			if ( this.xhr.readyState == 4 ) {
				console.log('onreadystatechange', this.xhr);
			}
			this.readyState = this.xhr.readyState;
			this.responseText = this.xhr.responseText;
			this.responseXML = this.xhr.responseXML;
			this.status = this.xhr.status;
			this.statusText = this.xhr.statusText;
		} catch (e) {
			console.error(e.message);
		}
		// if onreadystatechange is defined, call it
		if ( this.onreadystatechange ) {
			this.onreadystatechange();
		} else {
			console.log('onreadystatechange is not defined');
		}
	}
})();