/**
 * tweets.js
 * Loads and displays tweets from a tweets.json file
 * 
 * @author Caspar "UPLYNXED" Neervoort <twitter.com/upLYNXed>
 * @version 1.0.0
 * @license MIT
 * 
 * @uses config.json    - The file containing the config
 * @uses tweets.json    - The file containing the tweets to display
 * @uses JSRender       - The templating engine used to display the tweets
 * @uses JSViews		- The templating engine used to display the tweets
 * 
 * Author:  UPLYNXED (@uplynxed)
 */

/**
 * The config object, this is used to store the config
 * @type {object}
 */
let config = {
	theme: "auto",
	banner_pos_y: 65,
	filters: {
		"is_reply": "no_replies",
		"is_retweet": "no_retweets",
		"has_media": "all",
		"is_favorite": "all",
	},
};

/**
 * The filters_config object, this is used to define the filters and their options.
 * @type {object}
 * 
 * @key {string} filter - The filter name
 * @value {object} filter_def - The filter definition
 * @value {string} filter_def.title - The title of the filter
 * @value {string} filter_def.description - The description of the filter
 * @value {string} filter_def.type - The type of the filter
 * @value {string} filter_def.default - The default value of the filter
 * @value {object} filter_def.options - The options of the filter
 * @key {string} filter_def.options.option - The option name
 * @value {string} filter_def.options.option.title - The title of the option
 * @value {string} filter_def.options.option.description - The description of the option
 * @value {string} filter_def.options.option.value - The value of the option
 * @value {function} filter_def.options.option.callback - The callback function to call when the option is selected
 */
let filters_config = {
	"is_reply": {
		"title": "Replies",
		"description": "Select whether to show tweets that are replies or not.",
		"type": "select",
		"default": "false",
		"options": {
			"no_replies": {
				"title": "Hide replies",
				"description": "Hide all replies",
				"value": "false",
			},
			"all": {
				"title": "Show replies",
				"description": "Show all, including replies",
				"value": "true",
			},
			"replies": {
				"title": "Only show replies",
				"description": "Only show replies",
				"value": "only",
			},
		},
	},
	"is_retweet": {
		"title": "Retweets",
		"description": "Select whether to show tweets that are retweets or not.",
		"type": "select",
		"default": "false",
		"options": {
			"no_retweets": {
				"title": "Hide retweets",
				"description": "Hide all retweets",
				"value": "false",
			},
			"retweets": {
				"title": "Show retweets",
				"description": "Show all, including retweets",
				"value": "true",
			},
			"only_rt": {
				"title": "Only show retweets",
				"description": "Only show retweets (no quoted retweets)",
				"value": "only",
			},
			"only_qrt": {
				"title": "Only show quoted retweets",
				"description": "Only show quoted retweets",
				"value": "only_qrt",
			},
			"only_qrt_rt": {
				"title": "Only show quoted retweets and retweets",
				"description": "Only show quoted retweets and retweets",
				"value": "only_qrt_rt",
			}
		},
	},
	"has_media": {
		"title": "Media",
		"description": "Select whether to show tweets that have media or not.",
		"type": "select",
		"default": "true",
		"options": {
			"false": {
				"title": "Hide Media",
				"description": "Hide all tweets with media",
				"value": "false",
			},
			"true": {
				"title": "Show Media",
				"description": "Show all tweets with media",
				"value": "true",
			},
			"only": {
				"title": "Only Media",
				"description": "Only show tweets with media",
				"value": "only",
			},
			"only_img": {
				"title": "Only Images",
				"description": "Only show tweets with images",
				"value": "only_img",
			},
			"only_vid": {
				"title": "Only Videos",
				"description": "Only show tweets with videos",
				"value": "only_vid",
			},
			"only_gif": {
				"title": "Only GIFs",
				"description": "Only show tweets with GIFs",
				"value": "only_gif",
			},
			"only_crd": {
				"title": "Only Cards/Polls",
				"description": "Only show tweets with cards or polls",
				"value": "only_crd",
			},
		},
	},
	"is_favorited": {
		"title": "Favorites",
		"description": "Select whether to show tweets that are favorited or not.",
		"type": "select",
		"default": "true",
		"options": {
			"false": {
				"title": "Hide favorited tweets",
				"description": "Hide all favorited tweets",
				"value": "false",
				"callback": function() { },
			},
			"true": {
				"title": "Show favorited tweets",
				"description": "Show all favorited tweets",
				"value": "true",
				"callback": function() { },
			},
			"only": {
				"title": "Only show favorited tweets",
				"description": "Only show favorited tweets",
				"value": "only",
				"callback": function() { },
			},
		},
	},
	"date_cutoff": {
		"title": "Date Cutoff",
		"description": "Select whether to show tweets before or after a certain date.",
		"type": "checkbox",
		"default": false,
		"options": {
			"false": {
				"title": "Show all tweets",
				"description": "Show all tweets",
				"value": false,
				"callback": function() { },
			},
			"true": {
				"title": "Show only tweets before a certain date",
				"description": "Show only tweets before a certain date",
				"value": true,
				"callback": function() { },
			},
		},
	},
};





/**
 * Main user object, this is used to store the main user's data
 * @type {object}
 */
let main_user = {};

/**
 * The navigation hash object, this is used to store the hashes and their associated functions
 * @type {object}
 * @key {string} hash - The hash
 * @value {function} func - The function to call when the hash is matched
 */
let navHash = {
	"#": function() {
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });
		// Remove the hash from the URL
		window.hash = "";
		history.replaceState(null, null, window.location.pathname); // TODO: Figure this out
	},
	"#tweets": function( initial = false ) {
		showLoadingAnimation();

		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });

		// Set the "active" class on the "tweets" nav item only
		let nav_items = document.querySelectorAll(".nav-item a");
		nav_items.forEach(function(nav_item) {
			nav_item.classList.remove("active");
		});
		document.querySelector(".nav-item#tweets a").classList.add("active");

		// Set the title of the current loop
		tweets_object['current_loop'].title = "Archived Tweets";

		// Initialise with displayTweets() or switchTweetLoop()
		if ( initial ) {
			displayTweets({"tweets": tweets_object, "loop": "tweets_array", "offset": 0, "limit": 30});
		} else {
			switchTweetLoop("tweets_array", {"offset": 0, "limit": 30, "force": true});
		}
	},
	"#media": function( initial = false ) {
		showLoadingAnimation();
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });

		// Set the "active" class on the "media" nav item only
		let nav_items = document.querySelectorAll(".nav-item a");
		nav_items.forEach(function(nav_item) {
			nav_item.classList.remove("active");
		});
		document.querySelector(".nav-item#media a").classList.add("active");

		// Set the title of the current loop
		tweets_object['current_loop'].title = "Media";

		// Initialise with displayTweets() or switchTweetLoop()
		if ( initial ) {
			displayTweets({"tweets": tweets_object, "loop": "user_media", "offset": 0, "limit": 30});
		} else {
			switchTweetLoop("user_media", {"offset": 0, "limit": 30, "force": true});
		}
	},
	"#favorites": function( initial = false ) {
		showLoadingAnimation();
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });

		// Set the "active" class on the "favorites" nav item only
		let nav_items = document.querySelectorAll(".nav-item a");
		nav_items.forEach(function(nav_item) {
			nav_item.classList.remove("active");
		});
		document.querySelector(".nav-item#favorites a").classList.add("active");

		// Set the title of the current loop
		tweets_object['current_loop'].title = "Favorited Tweets";

		// Initialise with displayTweets() or switchTweetLoop()
		if ( initial ) {
			displayTweets({"tweets": tweets_object, "loop": "favorites", "offset": 0, "limit": 30});
		} else {
			switchTweetLoop("favorites", {"offset": 0, "limit": 30, "force": true});
		}
	},
	"#all-in-archive": function( initial = false ) {
		showLoadingAnimation();
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });
		// Set the "active" class on the "all-in-archive" nav item only
		document.querySelector(".nav-item a.active").classList.remove("active");

		tweets_object['all_in_archive'] = Object.values(tweets_object['tweets']).sort(function(a, b) {
			if ( tweets_object['current_loop'].sort === "newest" ) {
				return new Date(b.created_at) - new Date(a.created_at);
			} else if ( tweets_object['current_loop'].sort === "oldest" ) {
				return new Date(a.created_at) - new Date(b.created_at);
			}
		});

		// Set the title of the current loop
		tweets_object['current_loop'].title = "All Archived Tweets";

		// Initialise with displayTweets() or switchTweetLoop()
		if ( initial ) {
			displayTweets({"tweets": tweets_object, "loop": "all_in_archive", "offset": 0, "limit": 30});
		} else {
			switchTweetLoop("all_in_archive", {"offset": 0, "limit": 30, "force": true});
		}
	},
	"#search": function( initial = false ) { // TODO: Figure out how to implement this
		showLoadingAnimation();
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });

		// Remove the "active" class from all nav items
		let nav_items = document.querySelectorAll(".nav-item a");
		nav_items.forEach(function(nav_item) {
			nav_item.classList.remove("active");
		});

		// Set the title of the current loop
		tweets_object['current_loop'].title = "Search";

		// // Initialise with displayTweets() or switchTweetLoop()
		// if ( initial ) {
		// 	displayTweets({"tweets": tweets_object, "loop": "search_results"});
		// } else {
		// 	switchTweetLoop("search_results", {"force": true});
		// }
	},
	"#replies": function() {
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });
		// TODO: figure something out for this
	},
	"#retweets": function() {
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });
		// Display the retweets
		displayTweets({"tweets": tweets_object, "loop": "retweets"});
	},
	"#users": function() {
		// TODO: figure something out for this
	},
	"#about": function() {
		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: "instant" });
		// TODO: figure something out for this, some kind of customizable about page
	},
};

/**
 * tweets_object - contains the tweets, users and other data
 * 
 * @type {object}
 * @property {object} tweets 			- The tweets loaded from the tweets.json file and processed (processTweets())
 * 
 * @property {array} loaded_tweets 		- The current selection of tweets to display on the page
 * @property {object} current_loop 		- Describes the context of the currently active loop of tweets
 * @property {string} current_loop.name 			- The name of the current loop
 * @property {string} current_loop.title 			- A title for the current loop to display on the page
 * @property {array} current_loop.tweet_list 		- A working copy of the current loop of tweets that can be modified without affecting the original loop
 * @property {integer} current_loop.offset			- The offset of loaded tweets from the current loop
 * @property {integer} current_loop.limit			- The iterative limit of how many tweets to load at a time from the current loop
 * @property {string} current_loop.sort				- The sort order of the current loop
 * @property {array} current_loop.users_relevant 	- The users relevant to the current loop, used for conversation views
 * 
 * @property {object} users 			- The users loaded from the tweets.json file and processed
 * 
 * @property {object} conversations 	- The conversations grouped by conversation ID
 * 
 * @property {array} tweets_array 		- [loop] The tweets from the main user as an array (main user defined in config.json)
 * @property {array} favorites 			- [loop] The favorited tweets
 * @property {object} retweets 			- [loop] All retweets as an object
 * @property {array} user_media 		- [loop] The media posted by the main user as an array
 * @property {array} search_results 	- [loop] A dynamic array of search results, created as a search is performed
 * 
 * 
 */
let tweets_object = {
	/**
	 * The tweets object, this contains the tweets as an object, with the tweet_id_str as the key so they can be accessed by ID
	 * @type {object}
	 * @key {string} id - The ID of the tweet
	 * @value {object} tweet - The tweet itself
	 */
	"tweets": {},
	/**
	 * The loaded_tweets array, this contains the currently loaded tweets if there's any selected
	 * @type {Array}
	 * @value {object} tweet - The tweet itself
	 */
	"loaded_tweets": [],
	/**
	 * The current_loops string, this identifies the current loop
	 * @type {string}
	 * @value {string} loop - The current loop
	 */
	"current_loop": {
		"name": "tweets_array",
		"title": "Archived Tweets", // TODO: Implement this
		"tweet_list": () => {
			delete tweets_object['current_loop'].tweet_list;
			return tweets_object[tweets_object['current_loop'].name];
		},
		"offset": 0,
		"limit": 30,
		"sort": "newest",
		"users_relevant": [],
	},
	/**
	 * The users object, this contains the users as an object, with the user_id_str as the key so they can be accessed by ID
	 * @type {object}
	 * @key {string} id - The ID of the user
	 * @value {object} user - The user itself
	 */
	"users": {},
	/**
	 * The conversations object, this contains the replies as an object, with the conversation_id_str as the key so they can be accessed by the conversation ID
	 * @type {object}
	 * @key {string} conversation_id - The ID of the conversation
	 * @value {Array} replies - The replies themselves
	 * @value {object} replies.tweet - The tweet itself
	 */
	"conversations": {},
	/**
	 * The tweets array, this contains the tweets as an array so they can be looped through
	 * @type {Array}
	 * @value {object} tweet - The tweet itself
	 */
	"tweets_array": [],
	/**
	 * The favorites array, this contains the favorited tweets as an array so they can be looped through
	 * This value is stored locally in localStorage and can be exported and imported as a JSON file using exportFavorites() and importFavorites()
	 * @type {Array}
	 * @value {string} tweet_id_str - The ID of the tweet
	 */
	"favorites": [],
	/**
	 * The retweets object, this contains the retweets as an array so they can be looped through
	 * @type {Array}
	 * @value {object} tweet - The tweet itself
	 */
	"retweets": [],
	/**
	 * user_feed, this is a function that returns all the tweets and retweets by the main user as an array. It replaces itself with the array once it's been called once
	 * @returns {Array} - The tweets as an array
	 */
	"user_feed": () => {
		// delete this.user_feed;										// Delete the getter so it can be redefined
		// this.user_feed = this.tweets_array.concat(this.retweets); 	// Redefine the getter
		// tweets_object['tweets_array'].sort(function(a, b) {			// Sort the array by date
		// 	return new Date(a.created_at) - new Date(b.created_at);
		// });
		// return this.user_feed;										// Return the array
	},
	/**
	 * user_media, this is a function that returns all the media posted by the main user as an array. It replaces itself with the array once it's been called once
	 * @returns {Array} - The media as an array
	 */
	get user_media() {
		delete this.user_media;											// Delete the getter so it can be redefined
		// Do not continue if this is not in the top level of the tweets_object
		if ( this.tweets_array === undefined ) { // Does not work because the tweets_array is referenced in the prototype in the __proto__ object
			return undefined;
		}
		this.user_media = this.tweets_array.filter(function(tweet) { 	// Redefine user_media
			return tweet.extended_entities !== undefined;
		});
		return this.user_media;											// Return the array
	},
	__proto__: { // The prototype of the tweets object
		/**
		 * Get tweet poster's user object
		 * @returns {object} - The user object
		 */
		get user() {
			delete this.user; 										// Delete the getter so it can be redefined
			if ( this.user_id_str === undefined ) { 					// If there is no user associated with the given object
				return undefined;
			} else if ( tweets_object.users[this.user_id_str] === undefined ) { 	// If the user doesn't exist in the users object
				return undefined;
			}
			return tweets_object.users[this.user_id_str];
		},
		/**
		 * Get a tweet's conversation by ID
		 * @returns {Object} - The conversation object
		 * @returns {Array} - The conversation object.tweets - The tweets in the conversation
		 * @returns {Integer} - The conversation object.index - The index of the current tweet in the conversation array
		 */
		get conversation() {
			delete this.conversation; 										// Delete the getter so it can be redefined
			if ( this.conversation_id_str === undefined || this.user_id_str === undefined ) { // If there is no conversation associated with the given object or no user associated with the given object
				return undefined;
			}

			if ( tweets_object['conversations'][this.conversation_id_str] === undefined ) { // If the conversation doesn't exist in the replies object
				return undefined;
			}
			
			let conversation = {
				"tweets": tweets_object['conversations'][this.conversation_id_str],
				"index": 0,
			};

			// Get the index of the current tweet in the conversation array
			conversation.index = conversation.tweets.indexOf(this);

			return conversation;
		},
		/**
		 * Get a tweet's replies
		 * @returns {Array} - The replies
		 */
		get replies() {
			delete this.replies; 										// Delete the getter so it can be redefined
			if ( this.user_id_str === undefined ) {	// If there is no user associated with the given object
				return undefined;
			}

			let replies = [];

			// If the tweet's id_str exists as a key in the conversations object, return that property
			if ( tweets_object['conversations'][this.id_str] !== undefined ) {
				replies = tweets_object['conversations'][this.id_str];

				// Remove the current tweet from the replies array
				replies = replies.filter(function(tweet) {
					return tweet.id_str !== this.id_str;
				}, this);

				this.replies = replies; 									// Redefine the getter

				return replies;												// Return the replies as we don't need to look further
			}

			// If the tweet's conversation_id_str exists as a key in the conversations object, look for the tweet in the conversation
			if ( this.conversation_id_str !== undefined && tweets_object['conversations'][this.conversation_id_str] !== undefined ) {
				// Get any tweet with it's in_reply_to_status_id_str set to the current tweet's id_str
				replies = tweets_object['conversations'][this.conversation_id_str].filter(function(tweet) {
					return tweet.in_reply_to_status_id_str === this.id_str;
				}, this);
			} else {
				// Get any tweet with it's in_reply_to_status_id_str set to the current tweet's id_str in a parent conversation object
				replies = Object.values(tweets_object['tweets']).filter(function(tweet) {
					return tweet.in_reply_to_status_id_str === this.id_str;
				}, this);
			}

			this.replies = replies; 									// Redefine the getter

			return replies;
		},
		/**
		 * Get tweet's or a user's url
		 * @returns {string} - The url
		 */
		get url_path() {
			delete this.url_path; 											// Delete the getter so it can be redefined
			let url_path = ""; 												
			if ( this.screen_name !== undefined ) { 							// If the given object is a user
				if ( this.id_str === main_user.id_str ) { 							// If the given user is the main user
					url_path = "#";
					return "#";
				}
				url_path = `https://twitter.com/${this.screen_name}`;
				this.url_path = url_path;
				return url_path;
			} else if ( this.user_id_str !== undefined ) { 						// If the given object is a tweet or has an associated user
				if ( this.user_id_str === main_user.id_str ) { 						// If the given tweet is by the main user
					url_path = "#";
				} else { 															// If the given tweet is not by the main user
					url_path = "https://twitter.com/"
				}
				url_path += `${this.user.screen_name}/status/${this.id_str}`; // TODO: Check if tweet is in archive and use local URL if it is
				this.url_path = url_path;
				return url_path;
			} else if ( this.id_str === undefined ) { 							// If the given object is not a tweet or a user somehow
				url_path = 'javascript:console.log("Error: Not a valid object.");';
				this.url_path = url_path;
				return url_path;
			} else { 															// If it is a valid tweet or user, but something else went wrong
				url_path = 'javascript:console.log("Error: Something went wrong.");';
				this.url_path = url_path;
				return url_path;
			}
		},
	}
};

/**
 * The media replacements object, this is used to keep track of media URL replacements to local or archived URLs
 * @type {object}
 * @key {string} url - The URL of the media
 * @property {string} filename - The filename of the media
 * @property {string} orig_url - The original URL of the media
 * @property {string} type - The type of media
 * @property {string} url - The local URL of the media in case it was downloaded
 * @property {string} wayback_url - The Wayback Machine URL of the media in case it has been archived there
 * @property {string} resolved_url - The URL that the media was successfully loaded from on the page
 */
let media_replacements = {};


/**
 * Initialize the page
 * 
 * @returns {void}
 */
function init() {
	// Attach the scroll handler
	attachScrollHandler();

	// Load the config
	config = loadConfig();

	// Load the tweets
	loadTweets("tweets.json");

	// Load the media replacements from localStorage
	loadMediaReplacements();

	// Set the theme
	setTheme(config.theme);

	// Configure the templating engine (JSRender)
	$.views.settings.allowCode(true); // Allow code in tags
	registerCustomTags(); // Register custom tags

	// Set the main user
	setMainUser(tweets_object['users'][config.id]);

	// Process the users
	processUsers();

	// Process the tweets and display them
	processTweets(() => {
		loadFavorites();
		handleNavHashChange();
	});

	// // Run navigation hash handler on page load
	// handleNavHashChange();

	// Attach the breakpoint resize handlers
	attachBreakpointHandlers();

	// Attach the navigation hash handler
	attachNavHashHandler();
}

/**
 * Loads the config from a config.json file
 * 
 * @returns {object} - The config object
 */
function loadConfig(file = "config.json") {
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) { // If the request is successful
			config_file = JSON.parse(this.responseText); // Parse the response as JSON;

			// Merge the config_file object with the config object, overwriting any existing values
			Object.assign(config, config_file);

			// Copy the date_cutoff related properties to the tweets_object.current_loop object
			try {
				config.date_cutoff = new Date(config.date_cutoff);
				tweets_object['current_loop'].date_cutoff = config.date_cutoff.getTime();
				if (config.date_cutoff_toggle !== undefined && config.date_cutoff != false) {
					tweets_object['current_loop'].date_cutoff_toggle = (config.date_cutoff_toggle === undefined) ? false : config.date_cutoff_toggle;
					tweets_object['current_loop'].date_cutoff_toggle_option = (config.date_cutoff_toggle_option === undefined) ? true : config.date_cutoff_toggle_option;
				} else {
					tweets_object['current_loop'].date_cutoff_toggle = false;
					tweets_object['current_loop'].date_cutoff_toggle_option = false;
				}
			} catch (e) {
				console.error( 'Error: Invalid date_cutoff value in config.json', e );
			}
		}
	};

	// Build the request URL
	let request_url = "";
	if (window.location.pathname.endsWith("/") || window.location.pathname == "/") {
		request_url = window.location.href.split("#");
		request_url = request_url[0] + file;
	} else {
		request_url = window.location.href.split("#");
		request_url = request_url[0].split("/");
		request_url.pop();
		request_url = request_url.join("/") + "/" + file;
	}

	xhttp.open("GET", request_url, false);
	xhttp.send();

	return config;
}

/**
 * Loads the tweets from a tweets.json file
 * 
 * @param {string} file - The file to load tweets from
 * @param {function} callback - The callback function to call when the tweets are loaded
 * 
 * @returns {object} - The tweets object
 */
function loadTweets(file = "tweets.json", callback = function() {}) {
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) { // If the request is successful
			// Merge the tweets_object with the JSON file object, overwriting any existing values
			Object.assign(tweets_object, JSON.parse(this.responseText));

			Object.entries(tweets_object['tweets']).forEach(function([key, value]) {
				// Optimize the tweet
				tweets_object['tweets'][key] = optimizeTweet(tweets_object['tweets'][key]);

				// Initialize the tweet object
				tweets_object['tweets'][key] = initializeTweet(tweets_object['tweets'][key]);
			});
		}

		callback;
	};

	// Build the request URL
	let request_url = "";
	if (window.location.pathname.endsWith("/") || window.location.pathname == "/") {
		request_url = window.location.href.split("#");
		request_url = request_url[0] + file;
	} else {
		request_url = window.location.href.split("#");
		request_url = request_url[0].split("/");
		request_url.pop();
		request_url = request_url.join("/") + "/" + file;
	}

	xhttp.open("GET", request_url, false);
	xhttp.send();

	return tweets_object;
}

/**
 * Initialize a tweet object
 * - Sets the prototype of the tweet to the tweets_object prototype
 * - Converts the date to a Date object
 * 
 * @param {object} tweet - The tweet object to initialize
 * 
 * @returns {object} - The initialized tweet object
 */
function initializeTweet(tweet) {
	// Set the prototype of the tweet to the tweets_object prototype
	Object.setPrototypeOf( tweet, tweets_object.__proto__ ); 
	// If tweet contains a retweet, set the prototype of the retweet to the tweets_object prototype
	if ( tweet.retweeted_status_result !== undefined ) {
		let retweet = tweet.retweeted_status_result.result;

		// Add the retweeted user to the users object if it doesn't exist
		if (tweets_object['users'][retweet.core.user_results.result.rest_id] !== undefined) {
			tweets_object['users'][retweet.core.user_results.result.rest_id] 		= retweet.core.user_results.result.legacy;
			tweets_object['users'][retweet.core.user_results.result.rest_id].id_str = retweet.core.user_results.result.rest_id;
		}

		// If the retweet contains a quoted tweet, set the prototype of the quoted tweet to the tweets_object prototype
		if ( retweet.quoted_status_result !== undefined ) {
			if ( retweet.quoted_status_result.result.legacy !== undefined ) {
				let quoted_tweet = tweet.retweeted_status_result.result.quoted_status_result.result;

				// Change the date format of the tweets
				quoted_tweet.legacy.created_at = new Date(tweet.created_at).getTime();

				// Add the quoted tweet to the tweets_object.tweets object
				tweets_object['tweets'][quoted_tweet.legacy.id_str] = quoted_tweet.legacy;

				// Add the quoted tweet user to the users object if it doesn't exist
				if (tweets_object['users'][quoted_tweet.core.user_results.result.rest_id] !== undefined) {
					tweets_object['users'][quoted_tweet.core.user_results.result.rest_id] 		= quoted_tweet.core.user_results.result.legacy;
					tweets_object['users'][quoted_tweet.core.user_results.result.rest_id].id_str = quoted_tweet.core.user_results.result.rest_id;
				}

				Object.setPrototypeOf( quoted_tweet.legacy, tweets_object.__proto__ );
			}
		}

		Object.setPrototypeOf( retweet.legacy, tweets_object.__proto__ );
	}

	// Change the date format of the tweets
	tweet.created_at = new Date(tweet.created_at).getTime();

	return tweet;
}

/**
 * Optimize a tweet object
 * 
 * @param {object} tweet - The tweet object to optimize
 * 
 * @returns {object} - The optimized tweet object
 */
function optimizeTweet(tweet) {
	// Remove unused properties
	let unused_properties = [
		"bookmarked",
		"coordinates",
		"display_text_range",
		"ext",
		"ext_edit_control",
		"ext_views",
		"geo",
		"id",
		"in_reply_to_status_id",
		"in_reply_to_user_id",
		"lang",
		"place",
		"possibly_sensitive",
		"possibly_sensitive_editable",
		"supplemental_language",
		"truncated",
		"user_id",
	];

	unused_properties.forEach(function(property) {
		delete tweet[property];
	});

	// Remove unused properties from the media objects
	if (tweet.extended_entities !== undefined && tweet.entities !== undefined) {
		let unused_media_properties = [
			"additional_media_info",
			"ext_sensitive_media_warning",
			"features",
			"id",
			"indices",
		];

		unused_media_properties.forEach(function(property) {
			if (tweet.extended_entities.media !== undefined) {
				tweet.extended_entities.media.forEach(function(media) {
					delete media[property];
				});
			}
			if (tweet.entities.media !== undefined) {
				tweet.entities.media.forEach(function(media) {
					delete media[property];
				});
			}
		});
	}

	return tweet;
}

/**
 * Process the tweets object
 * 
 * @param {function} callback - The callback function to call when the tweets are processed
 * 
 * @returns {object} - The processed tweets object
 */
function processTweets(callback = function() {}) {
	// Convert tweets to an array
	tweets_object['tweets_array'] = Object
		.keys(tweets_object['tweets'])
		.map(function(key) {
			return tweets_object['tweets'][key];
		});

	console.log(tweets_object);

	// Remove ads from the tweets
	tweets_object['tweets_array'] = discardAds(tweets_object['tweets_array']);

	// Handle Quoted Tweets and Replies
	let tweets_quoted = []; // An array to store the quoted tweets

	tweets_object['tweets_array'].forEach(function(tweet) {
		/** Move any quoted tweets to a "quoted_tweet" property inside the tweet that quoted it and:
		 *	- merge the quoted tweet's "entities.user_mentions" with the main tweet's "entities.user_mentions"
		 *	- merge the quoted tweet's "entities.urls" with the main tweet's "entities.urls"
		 *	- add the quoted tweet to the tweets_quoted array so we can filter it out later
		 */
		if (tweet.quoted_status_id_str !== undefined) {
			let quoted_tweet = tweets_object['tweets'][tweet.quoted_status_id_str]; 	// Get the quoted tweet
			tweet.quoted_tweet = quoted_tweet;										 	// Add the quoted tweet to the tweet object

			if (tweet.quoted_tweet !== undefined) {							// If the quoted tweet exists
				tweet.quoted_tweet.entities.user_mentions.forEach(function(user_mention) {	// Merge the quoted tweet's user mentions with the main tweet's user mentions
					tweet.entities.user_mentions.push(user_mention);
				});
			
				tweet.quoted_tweet.entities.urls.forEach(function(url) {					// Merge the quoted tweet's urls with the main tweet's urls
					tweet.entities.urls.push(url);
				});
			}

			tweets_quoted.push(quoted_tweet); 
		}

		// Copy any conversation tweets to a "conversations" object inside the tweets_object
		if (tweet.conversation_id_str !== undefined) {
			if (tweets_object['conversations'][tweet.conversation_id_str] === undefined) { // If the conversation doesn't exist in the replies object
				tweets_object['conversations'][tweet.conversation_id_str] = []; // Create the conversation in the replies object
			}
			tweets_object['conversations'][tweet.conversation_id_str].push(tweet);
		}

		// Copy any tweets that are replies to a "replies" object inside the tweet object it is replying to
		if (tweet.in_reply_to_status_id_str !== undefined && tweet.in_reply_to_status_id_str !== null) {
			let tweet_replied_to = tweets_object['tweets'][tweet.in_reply_to_status_id_str]; // Get the tweet this tweet is replying to
			if (tweet_replied_to !== undefined) { // If the tweet this tweet is replying to exists
				if (tweet_replied_to.replies === undefined) { // If the tweet this tweet is replying to doesn't have a replies object
					tweet_replied_to.replies = []; // Create the replies object
				}
				tweet_replied_to.replies.push( tweet ); // Add the tweet to the replies object
			}
		}

		// Modify retweets
		/** If the tweet is a retweet:
		 *	- rename the tweet's "user" property to the "retweeting_user" property
		 *	- rename the tweet's "user_id_str" to "retweeting_user_id_str"
		 *	- replace the retweet's "user" to the main tweet "user"
		 *	- replace the tweet's "full_text" with the retweet's "full_text"
		 *	- replace the retweet's "entities" to the main tweet's "entities"
		 *	- replace the retweet's "extended_entities" to the main tweet's "extended_entities"
		 *	- replace the retweet's "is_quote_status" to the main tweet's "is_quote_status"
		 *	- replace the retweet's "quoted_status_id_str" to the main tweet's "quoted_status_id_str"
		 *	- replace the retweet's "quoted_status_permalink" to the main tweet's "quoted_status_permalink"
		 *	- replace the retweet's "reply_count", "retweet_count", and "favorite_count" to the main tweet
		 */
		if (tweet.retweeted_status_result !== undefined) {
			let retweet 				= tweet.retweeted_status_result.result.legacy;
			let retweet_user 			= tweet.retweeted_status_result.result.core.user_results.result.legacy;
				retweet_user['id_str'] 	= tweet.retweeted_status_result.result.core.user_results.result.rest_id;

			tweet.retweeting_user 			= tweet.user;
			tweet.retweeting_user_id_str 	= tweet.user_id_str;
			tweet.user 						= retweet_user;
			tweet.user_id_str 				= retweet_user.id_str;
			tweet.full_text 				= retweet.full_text;
			tweet.entities 					= retweet.entities;
			tweet.extended_entities 		= retweet.extended_entities;
			tweet.is_quote_status 			= retweet.is_quote_status;
			tweet.quoted_status_id_str 		= retweet.quoted_status_id_str;
			tweet.quoted_status_permalink 	= retweet.quoted_status_permalink;
			tweet.reply_count 				= retweet.reply_count;
			tweet.retweet_count 			= retweet.retweet_count;
			tweet.favorite_count 			= retweet.favorite_count;

			// If a tweet contains a "quoted_status_result" property, copy it to the tweet's "quoted_tweet" property
			if (tweet.retweeted_status_result.result.quoted_status_result !== undefined) {
				// Check for a tombstone property
				if (tweet.retweeted_status_result.result.quoted_status_result.result.tombstone !== undefined) {
					tweet.is_quote_status = true;
				} else {
					tweet.quoted_tweet = tweet.retweeted_status_result.result.quoted_status_result.result.legacy;
				}
			}
		}

		// Add filter object properties to the tweet object
		tweet['filters'] = {
			'is_by_main_user': tweet.user_id_str === main_user.id_str,

			'is_reply': tweet.in_reply_to_status_id_str !== undefined && tweet.in_reply_to_status_id_str !== null,
			'is_reply_to_main_user': tweet.in_reply_to_user_id_str === main_user.id_str,

			'is_retweet': tweet.retweeted_status_result !== undefined,
			'is_quote': tweet.is_quote_status === true,

			'has_media': tweet.extended_entities !== undefined || tweet.entities.media !== undefined || (tweet.entities.urls !== undefined && tweet.entities.urls.length > 0) || tweet.card !== undefined,
			'media_types': {},
			'has_mention': tweet.entities?.user_mentions !== undefined && tweet.entities?.user_mentions?.length > 0,
			'has_hashtag': tweet.entities?.hashtags !== undefined && tweet.entities?.hashtags?.length > 0,
		};

		tweet.filters['media_types'] = (() => {
			delete tweet.filters.media_types; // Delete the getter so it can be redefined

			let media_types = {};
			if (tweet.filters.has_media === true) {
				if (tweet.extended_entities?.media !== undefined) {
					tweet.extended_entities.media.forEach(function(media) {
						media_types[media.type] = true;
					});
				}
				if (tweet.card !== undefined) {
					if (tweet.card.name.includes("poll")) {
						media_types['poll'] = true;
					} else {
						media_types['card'] = tweet.card.url;
					}
				}
				if (tweet.entities?.urls !== undefined && tweet.entities?.urls?.length > 0) {
					media_types['url'] = tweet.entities.urls.map(function(url) {
						return url.expanded_url;
					});
				}
			}

			tweet.filters.media_types = media_types; // Redefine the getter to the static value

			return media_types;
		})();
	});

	// Remove any conversations from the replies object that only have one tweet in them
	Object.entries(tweets_object['conversations']).filter(function([key, value]) {
		return value.length <= 1;
	}).forEach(function([key, value]) {
		delete tweets_object['conversations'][key];
	});

	// Remove any:
	// - quoted tweets
	// - tweets not by the main user, unless the tweet was retweeted by the main user
	tweets_object['tweets_array'] = tweets_object['tweets_array'].filter(function(tweet) {
		if (tweets_quoted.indexOf(tweet) !== -1) {
			return false;
		}
		if (tweet.user_id_str !== main_user.id_str) {
			if (tweet.retweeting_user_id_str !== main_user.id_str) {
				return false;
			}
		}
		return true;
	});

	// Order the tweets by date
	tweets_object['tweets_array'] = tweets_object['tweets_array'].sort(function(a, b) {
		return new Date(b.created_at) - new Date(a.created_at);
	});

	// Set the currently loaded tweets to the tweets array by default
	tweets_object['current_loop']['tweet_list'] = tweets_object['tweets_array'];

	callback();

	return tweets_object;
}

/** 
 * Process Users
 * 
 * @param {object} args - Function arguments
 * @param {object} args.users - The users to process
 * @param {function} args.callback - The callback function to call when the users are processed
 * 
 * @returns {object} - The processed users
 */
function processUsers(callback = function() {}) {
	callback = (callback === undefined) ? function() {} : callback;

	// Get the users from the tweets_object
	let users = tweets_object['users'];
	// Turn the users object into an array. The key in the original object is numeric, use it as the index in the new array
	let users_array = Object.keys(users).map(function(key) {
		return users[key.toString()];
	});

	// Add former screen_name to the relevant user's object
	if (config.aliases !== undefined && config.aliases.length > 0) {
		config.aliases.forEach(function(alias) {
			// Find the user in the users object
			let user = resolveUserObject({ "screen_name": alias.current });
			// If the user is found, add the former screen_name to the user object
			if (user !== undefined) {
				if (user['former_screen_names'] !== undefined && user['former_screen_names'].length !== 0) {
					user['former_screen_names'] = alias.former;
				}
			}
		});
	}

	// Process each provided user
	users_array.forEach(function(user) {
		// // Optimize the user object by removing unused properties
		// delete user.can_dm;
		// delete user.can_media_tag;
		// delete user.fast_followers_count;
		// delete user.has_custom_timelines;
		// delete user.is_translator;
		// delete user.is_translation_enabled;
		// delete user.possibly_sensitive;
		// delete user.translator_type;
		// delete user.withheld_in_countries;
		// delete user.ext_has_nft_avatar;
		// delete user.geo_enabled;
		// delete user.has_extended_profile;

		// Order the properties in the user object
		user_properties_order = [ // The order of the properties in the user object
			"id_str",
			"screen_name",
			"name",
			"description",
			"location",
			"created_at",
			"statuses_count",
			"followers_count",
			"friends_count",
			"favourites_count",
			"listed_count",
			"pinned_tweet_ids_str",
			"protected",
			"entities",
			"verified",
			"profile_image_url_https",
			"profile_image_url",
			"profile_banner_url",
			"profile_banner_url_https",
			"profile_background_image_url",
			"profile_background_image_url_https",
			"profile_link_color",
			"url",
			"url_path",
			// "user_tweets",
		];

		// Sort the properties in the user object
		let sorted_user = {};
		user_properties_order.forEach(function(property) {
			if (user[property] === undefined) {
				return;
			}
			sorted_user[property] = JSON.parse(JSON.stringify(user[property]));
		});

		// Add a getter function to get the user's tweets from the archived tweets
		Object.defineProperty(sorted_user, 'user_tweets', {
			get: function() {
				delete user.user_tweets; // Delete the getter so it can be redefined
				let tweets = Object.values(tweets_object['tweets']);
				let user_tweets = tweets.filter(function(tweet) {
					return tweet.user_id_str === user.id_str || tweet.retweeting_user_id_str === user.id_str || tweet.quoted_tweet?.user_id_str === user.id_str;
				});
				user.user_tweets = user_tweets; // Redefine the getter to the static value
				return user_tweets;
			}
		});

		// Set the prototype of the user to the tweets_object prototype
		Object.setPrototypeOf( sorted_user, tweets_object.__proto__ ); 

		// Add the sorted user object to the users object
		users[user.id_str] = sorted_user;
	});

	// Put the users back into the tweets_object
	tweets_object['users'] = users;

	callback();

	return users;
}


/**
 * Filters tweets by the given filter
 * 
 * @param {object} tweets - The tweets to filter
 * @param {object} filters - The filters to apply
 * @param {object} args - Additional arguments
 * @param {function} args.callback - The callback function to call after the tweets have been filtered
 *
 * @returns {object} - The filtered tweets
 */
function filterTweets(tweets, filters, args = { "callback": function() {} }) {
	let callback = (args.callback === undefined) ? function() {} : args.callback;

	// Start counting execution time
	console.time(`Filtering tweets. Execution Time:`);

	// let loop_tweets = tweets_object;

	// Filter the tweets based on the given filters and the tweet's filters object
	let filtered_tweets = tweets.filter(function(tweet) {
		// For each filter, check if the tweet passes the filter
		return Object.entries(filters).every(function([key, value]) {
			// Use the filters object in the tweet to filter the tweets

			// // Check if the reply filter is set to a value in the filters_config object's options object
			// Check if 'is_reply' is a valid match.
			switch (key) {
				case 'is_reply':
					switch (value) {
						case 'replies':
							return tweet.filters.is_reply === true;
						case 'no_replies':
							return tweet.filters.is_reply === false;
						default:
							return true;
					}
				case 'is_retweet':
					switch (value) {
						case 'retweets':				// Only show retweets
							return tweet.filters.is_retweet === true;
						case 'quotetweets': 			// Only show quote tweets
							return tweet.filters.is_quote === true && tweet.filters.is_retweet === false;
						case 'retweets_quotetweets': 	// Show both retweets and quote tweets
							return tweet.filters.is_retweet === true || tweet.filters.is_quote === true;
						case 'no_retweets':				// Only show tweets that are not retweets
							return tweet.filters.is_retweet === false;
						case 'no_quotetweets':			// Only show tweets that are not quote tweets
							return tweet.filters.is_quote === false;
						case 'no_retweets_quotetweets':	// Only show tweets that are not retweets or quote tweets
							return tweet.filters.is_retweet === false && tweet.filters.is_quote === false;
						default:
							return true;
					}
				case 'has_media':
					switch (value) {
						case 'media':					// Only show tweets with media
							return tweet.filters.has_media === true;
						case 'images':					// Only show tweets with images
							return tweet.filters.has_media === true && tweet.filters.media_types['photo'] !== undefined;
						case 'videos':					// Only show tweets with videos
							return tweet.filters.has_media === true && tweet.filters.media_types['video'] !== undefined;
						case 'gifs':					// Only show tweets with gifs
							return tweet.filters.has_media === true && tweet.filters.media_types['animated_gif'] !== undefined;
						case 'cards':					// Only show tweets with cards
							return tweet.filters.has_media === true && tweet.filters.media_types['card'] !== undefined;
						case 'polls':					// Only show tweets with polls
							return tweet.filters.has_media === true && tweet.filters.media_types['poll'] !== undefined;
						case 'no_media':				// Only show tweets without media
							return tweet.filters.has_media === false;
						default:
							return true;
					}
				case 'is_favorite':
					switch (value) {
						case 'favorites':				// Only show tweets that are favorited
							return tweet.favorited === true;
						case 'no_favorites':			// Only show tweets that are not favorited
							return tweet.favorited === false;
						default:
							return true;
					}
				default:
					return true;
			}
		});
	});

	// End counting execution time
	console.timeEnd(`Filtering tweets. Execution Time:`);

	callback();

	return filtered_tweets;
}

/**
 * Handles on change events for filter input elements
 * 
 * @param {event} e - The event
 * @param {object} args - Additional arguments
 * @param {object} args.filter - The changed filter
 * 
 * @returns {Object} - The filtered tweets
 */
function handleFilters(e, args = { "filter": "" }, initial = false ) {
	let loop 	= tweets_object['current_loop'].name;
	// let current_tweets 	= tweets_object['current_loop']['tweet_list'];

	let filter 	= (args.filter === undefined || args.filter === "") ? e.target.name : args.filter;
	let value 	= e.target.value;

	// Get the default filters from the config object and the current_loop object (if defined)
	let default_filters = config.filters;
	let current_filters = tweets_object['current_loop']?.filters;

	// Overwrite the default filters with the current filters
	current_filters = Object.assign(default_filters, current_filters);

	// Overwrite the current filters with the new filter value
	current_filters[filter] = value;

	// Filter the tweets
	let filtered_tweets = filterTweets(tweets_object[loop], current_filters);

	// Store the filtered tweets
	// tweets_object[loop] = filtered_tweets;
	tweets_object['current_loop']['tweet_list'] = filtered_tweets;

	// Display the filtered tweets
	console.log(loop, current_filters, filtered_tweets, tweets_object[loop]);

	
	// Render the filtered tweets
	// if ( initial ) {
		displayTweets({"tweets": tweets_object, "loop": loop}, false);
	// } else {
	// 	switchTweetLoop(loop, {"force": true});
	// }

	return filtered_tweets;
}


/**
 * Displays tweets on the page
 * 
 * @param {object} args 			- Additional arguments
 * @param {string} args.loop 			- The loop to display the tweets in
 * @param {integer} args.offset 		- The offset to start displaying the tweets at
 * @param {integer} args.limit 			- The number of tweets to display
 * @param {integer} args.tweet_offset 	- The number of tweets to offset
 * @param {object} args.context 		- The tweets_object context to pass along to the template
 * @param {boolean} initial 		- Whether this is the initial display of the tweets
 * 
 * @returns {void}
 */
function displayTweets(args = { "loop": "tweets_array", "offset": 0, "limit": 30, "tweet_offset": 0, "context": tweets_object }, initial = true) {
	showLoadingAnimation();

	// Default args
	const default_args = {
		"loop": "tweets_array",
		"offset": 0,
		"limit": 30,
		"tweet_offset": 0,
		"context": tweets_object,
	};

	// Merge the default args with the given args
	args = Object.assign(default_args, args);

	// Start counting execution time
	console.time(`Displaying tweets: ${args.loop}, offset: ${args.offset}, limit: ${args.limit}. Execution Time:`);

	// TODO: I don't think the ternary operators are needed anymore with the default_args object now
	let loop 			= (args.loop === undefined) 		? "tweets_array" 	: args.loop;
	let offset 			= (args.offset === undefined) 		? undefined 		: args.offset;
	let limit 			= (args.limit === undefined) 		? undefined 		: args.limit;
	let tweet_offset 	= (args.tweet_offset === undefined) ? 0 				: args.tweet_offset;
	let context 		= (args.context === undefined) 		? tweets_object 	: args.context;

	let tweetContainer 	= document.getElementsByClassName("tweets")[0];
	let tweetsTemplate	= $.templates["tweet-list"];

	// Set the loop to the current loop
	tweets_object['current_loop'].name 			= loop;
	tweets_object['current_loop'].offset 		= offset;
	tweets_object['current_loop'].limit 		= limit;
	tweets_object['current_loop'].tweet_offset 	= tweet_offset;

	// Get the tweets from the current loop's array on initial run of the function
	if ( initial ) {
		// Filter the tweets, if the loop is not 'tweet_thread' or 'tweet_single'
		if ( loop !== "tweet_thread" && loop !== "tweet_single" ) {
			let filtered_tweets = filterTweets(tweets_object[loop], config.filters);
			tweets_object['current_loop'].tweet_list = filtered_tweets;
		} else {
			tweets_object['current_loop'].tweet_list = tweets_object[loop];
		}
	}

	// Set the currently loaded tweets to the right loop. If an offset and limit are specified, slice the array
	if (offset !== undefined && limit !== undefined) {
		// tweets_object['loaded_tweets'] = tweets_object[loop].slice(offset, offset + tweet_offset + limit);
		tweets_object['loaded_tweets'] = tweets_object['current_loop']['tweet_list'].slice(offset, offset + tweet_offset + limit);
		// tweets_object['current_loop']['tweet_list'] = tweets_object[loop].slice(offset, offset + tweet_offset + limit);
	} else {
		// tweets_object['loaded_tweets'] = tweets_object[loop];
		tweets_object['loaded_tweets'] = tweets_object['current_loop']['tweet_list'];
		// tweets_object['current_loop']['tweet_list'] = tweets_object[loop];
	}

	// Define the list views
	let list_views = [ "tweets_array", "user_media", "favorites", "search_results", "all_in_archive", "filtered_tweets" ];

	// Define the args
	let helpers = {
		// Window
		"window": window,
		// Context Data:
		"main_user": main_user,
		"list_views": list_views,
		// Options / Config:
		"config": config,
		// Filters:
		"replies": "no_replies",
		"retweets": "no_retweets",
		"favorites": "all",
		"media": "all",
		"sort_order": "newest",
		"date_cutoff_toggle": config.date_cutoff_toggle,
		"filters": config.filters,
		"filter_handler": handleFilters,
	};

	// Render the tweets using JSViews
	tweetsTemplate.link(tweetContainer, context, helpers);

	// Link the html element
	$.link(true, "html", context, helpers);

	// Set the content title
	setContentTitle( tweets_object['current_loop'].title );

	hideLoadingAnimation(attachVideoPlayHandler);

	// Stop counting execution time and log it
	console.timeEnd(`Displaying tweets: ${args.loop}, offset: ${args.offset}, limit: ${args.limit}. Execution Time:`);

	return;
}

/**
 * Display more tweets as the user scrolls down
 * 
 * @param {event} e - The scroll event
 * 
 * @returns {void}
 */
function displayMoreTweets( e ) {
	let current_loop 	= tweets_object['current_loop'].name;
	let current_tweets 	= tweets_object['current_loop'].tweet_list;
	let offset 			= tweets_object['current_loop'].offset;
	let limit 			= tweets_object['current_loop'].limit;
	let tweet_offset 	= tweets_object['current_loop'].tweet_offset;

	let scroll_distance = 100; // The distance from the bottom of the page to start loading more tweets
	let scroll_position = window.innerHeight + window.scrollY; // The current scroll position
	let page_height 	= document.body.offsetHeight; // The height of the page

	let list_end 		= document.querySelector(".tweet-list-end");
	let list_loading 	= document.querySelector(".tweet-list-loading");

	let list_end_exists = (list_end !== null) ? true : false;
	let list_loading_exists = (list_loading !== null) ? true : false;

	// If the length of the current tweets is less than the limit
	if (current_tweets.length <= limit) {
		// Hide the tweet-list-loading element
		if ( list_loading_exists ) {
			list_loading.classList.add("d-none");
		}

		// Show the tweet-list-end element
		if ( list_end_exists ) {
			list_end.classList.remove("d-none");
		}

		// If there are no tweets to display
		if (current_tweets.length === 0) {
			document.querySelector(".tweet-list-empty").classList.remove("d-none");
		}

		return;
	}

	// If the user has scrolled to the bottom of the page
	if ( scroll_position >= (page_height - scroll_distance) ) {
		// If there are more tweets to display
		if (current_tweets.length > offset ) {
			// Hide the tweet-list-end element
			if ( list_end_exists ) {
				list_end.classList.add("d-none");
			}

			// Show the tweet-list-loading element
			if ( list_loading_exists ) {
				list_loading.classList.remove("d-none");
			}

			// Define the new offset
			offset += tweet_offset + limit;

			// Reset the tweet offset
			tweets_object['current_loop'].tweet_offset = 0;

			// Get the next tweets
			let next_tweets = current_tweets.slice(offset, offset + limit);

			// Add the next tweets to the current tweets
			$.observable(tweets_object["loaded_tweets"]).insert(next_tweets);
			// $.observable(tweets_object['current_loop']['tweet_list']).insert(next_tweets);

			hideLoadingAnimation(attachVideoPlayHandler);

			// Update the current loop offset
			tweets_object['current_loop'].offset = offset;
		} else {
			// Hide the tweet-list-loading element
			if ( list_loading_exists ) {
				document.querySelector(".tweet-list-loading").classList.add("d-none");
			}

			// If the current tweet list is empty, show the tweet-list-empty element
			if ( document.querySelectorAll('.tweet').length === 0 ) {
				document.querySelector(".tweet-list-empty")?.classList?.remove("d-none");
			} else {
				// Show the tweet-list-end element
				if ( list_end_exists ) {
					document.querySelector(".tweet-list-end").classList.remove("d-none");
				}
			}
		}
	}

	return;
}

/**
 * Switch between the different tweet loops
 * 
 * @param {string} loop - The loop to switch to
 * @param {object} args - The arguments
 * @param {integer} args.offset - The offset to use
 * @param {integer} args.limit - The limit to use
 * @param {boolean} args.force - Whether to force the switch
 * 
 * @returns {object} - The current tweets object
 */
function switchTweetLoop( loop = "tweets_array", args = { "offset": 0, "limit": 30, "tweet_offset": 0, "force": false } ) {
	let offset 			= (args.offset === undefined) 		? 0 	: args.offset;
	let limit 			= (args.limit === undefined) 		? 30 	: args.limit;
	let force 			= (args.force === undefined) 		? false : args.force;
	let tweet_offset 	= (args.tweet_offset === undefined) ? 0 : args.tweet_offset;

	// If the loop is the same as the current loop and force is false, don't switch
	if ( loop === tweets_object['current_loop'].name && force === false ) {
		// return tweets_object[ 'loaded_tweets' ];
		return tweets_object['current_loop']['tweet_list'];
	}

	// Update the current loop
	$.observable( tweets_object['current_loop'] ).setProperty( "name", loop );
	tweets_object['current_loop'].offset 		= offset;
	tweets_object['current_loop'].limit 		= limit;
	tweets_object['current_loop'].tweet_offset 	= tweet_offset;

	// Filter the tweets, if the loop is not 'tweet_thread' or 'tweet_single'
	if ( loop !== "tweet_thread" && loop !== "tweet_single" ) {
		let filtered_tweets = filterTweets(tweets_object[loop], config.filters);

		// Set the current_loop tweet_list to the current loop's tweets
		tweets_object['current_loop']['tweet_list'] = filtered_tweets;
	} else {
		// Set the current_loop tweet_list to the current loop's tweets
		tweets_object['current_loop']['tweet_list'] = tweets_object[loop];
	}

	//Swap the loaded_tweets array with the new loop
	let new_tweets = tweets_object['current_loop']['tweet_list'].slice( offset, offset + tweet_offset + limit );

	// Refresh the loaded_tweets array with $.observable()
	$.observable( tweets_object['loaded_tweets'] ).refresh( new_tweets );

	// Set the content title
	setContentTitle( tweets_object['current_loop'].title );

	hideLoadingAnimation(attachVideoPlayHandler);

	return tweets_object[ 'loaded_tweets' ];
	// return tweets_object['current_loop']['tweet_list'];
}

/**
 * Show the loading animation
 * 
 * @returns {void}
 */
function showLoadingAnimation() {
	let loadingAnimation = document.querySelector(".loading-spinner");
	loadingAnimation.classList.remove("d-none");
}

/**
 * Hide the loading animation
 * 
 * @returns {void}
 */
function hideLoadingAnimation(callback = function() {}) {
	let loadingAnimation = document.querySelector(".loading-spinner");
	requestIdleCallback(function() {
		loadingAnimation.classList.add("d-none");
		callback();
	});
}


/**
 * Embed external media
 * Uses JSRender for embed templates
 * 
 * @todo complete rewrite
 * 
 * @param {object} params - The parameters
 * @param {string} params.url - The URL of the media to embed
 * @param {string} params.type - The type of media to embed (video, photo, etc.)
 * @param {string} params.source - The source of the media (youtube, twitch, vimeo, streamable, soundcloud, etc.)
 * @param {string} params.tweet_id - The ID of the tweet the media is in
 * @param {string} params.user_id - The ID of the user who posted the media
 * 
 * @returns {object} media - The media object
 * @returns {string} media.embed - The media embed html code as a string
 * @returns {string} media.thumbnail - The URL of the media's thumbnail (if applicable)
 * @returns {string} media.filename - The filename of the media (if applicable)
 * @returns {string} media.type - The type of media
 * @returns {string} media.source - The source of the media
 * @returns {string} media.tweet_id - The ID of the tweet the media is in
 * @returns {string} media.user_id - The ID of the user who posted the media
 */
function embedMedia({ url, type, source, tweet_id, user_id }) {
	let media = {
		"embed": "",
		"thumbnail": "",
		"filename": "",
		"type": type,
		"source": source,
		"tweet_id": tweet_id,
		"user_id": user_id,
	};

	

	// If the media is a video, embed it
	if (type === "video") {
		// If the source is YouTube, Twitch, Vimeo, or Streamable, embed it
		if (source === "youtube" || source === "twitch" || source === "vimeo" || source === "streamable") {
			media.embed = `<iframe class="embed-responsive-item" src="${url}" allowfullscreen></iframe>`;
		}
		// If the source is Youtube, get the thumbnail
		if (source === "youtube") {
			media.id 		= url.match(/v=(\w+)/)[1];
			media.thumbnail = `https://img.youtube.com/vi/${media.id}/maxresdefault.jpg`;
		} else if (source === "twitch") {
			media.thumbnail = substituteMediaUrl({ filename: media.id }).url;
		}
	} else if (type === "photo") {
		// If the source is i.imgur.com, embed it
		if (source === "imgur") {
			media.embed = `<img src="${url}" class="img-fluid">`;
		} else if (source === "twitter") {
			media.embed = `<img src="${url}" class="img-fluid">`;
		}
	} else if (type === "animated_gif") {
		// try to embed it as a video gif
		// first, get the filename without the extension
		let filename = url.match(/\/(([\w-])+\.\w+)$/)[1];
		media.embed = `
			<video class="embed-responsive-item" loop muted playsinline poster="${thumbnail}" onloadstart="this.volume=0.5">
				<source src="media/${filename}.webm" type="video/webm">
				<source src="media/${filename}.mp4" type="video/mp4">
			</video>`;
	}

	return media;
}

/**
 * Substitutes media URLs with local URLs
 * 
 * @param {object} params - The parameters, options are optional but at least one is required
 * @param {string} params.url - The URL to substitute
 * @param {string} params.filename - The filename of the media
 * 
 * @returns {string} - The substituted URL if it exists, otherwise the original URL
 */
function substituteMediaUrl(params = { url, filename }) {
	let url 		= params.url;
	let filename 	= params.filename;
	let wayback_url = `https://web.archive.org/web/${url}`;

	// Check if url is defined and if it's a string
	if (url === undefined || typeof url !== "string") {
		if (window.error_list === undefined) {
			window.error_list = [];
		}
		window.error_list.push(`Error: URL is undefined or not a string: ${url}`);
		return false;
	}
	
	let regex = {
		"format"				: /format=(\w+)/,
		"file"					: /\/(([\w-]+)\.(\w+))$/,
		"last_slash"			: /\/([^\/]+)$/,
		"last_slash_query"		: /\/([^\/]+)(?=\?)/,
		"file_query"			: /\/(([\w-]+)\.(\w+))(?=\?)/,
		"query"					: /\?(\w+)=/,
		"before_query"			: /(.+)(?=\?)/,
	}

	orig_url 	= url; // store the original URL for later

	// remove the query string from the URL for consistency
	if ( url.includes("?") ) {
		url = url.match(regex.before_query)[1];
	}

	// check if the already image exists in the media_replacements object, and if it does, return the local URL
	if ( media_replacements[url] !== undefined ) {
		return media_replacements[url];
	}

	// if the filename is undefined, get it from the URL
	if (filename === undefined) {
		/* Example URLs:
		 * profile image: 	https://pbs.twimg.com/profile_images/1634660415241347072/UHbaE_6f_normal.png
		 * 					https://unavatar.io/twitter/uplynxed
		 * profile banner: 	https://pbs.twimg.com/profile_banners/309366491/1678568388
		 * card thumbnail: 	https://pbs.twimg.com/card_img/1655287536250413066/gSu-NHFet?format=jpg&name=280x280
		 * card image:		https://pbs.twimg.com/card_img/1655800965935529984/Up7mk-C9?format=png&name=orig
		 * tweet image: 	https://pbs.twimg.com/media/ExQ1Z1mWQAAZ3Za?format=jpg&name=orig
		 * 					https://pbs.twimg.com/media/EN9fEmNX4AAdmBT.png
		 * 					https://pbs.twimg.com/media/EN9pnXWXUAA-D8a.png
		 * video thumb:		https://pbs.twimg.com/amplify_video_thumb/1217952085318295552/img/f6Jg369ENx-XgTuJ.jpg
		 * 					https://pbs.twimg.com/ext_tw_video_thumb/1652248920397938688/pu/img/OGptD9vbNvlmvUto.jpg
		 * tweet video:		https://video.twimg.com/amplify_video/1217952085318295552/vid/1280x720/Aa73lWP8HE9vClIq.mp4?tag=13
		 * 					https://video.twimg.com/amplify_video/1217952085318295552/vid/480x270/ZE8_No3HnTPsDhYG.mp4?tag=13
		 * 					https://video.twimg.com/ext_tw_video/1652248920397938688/pu/vid/320x400/b71EINGFPyWmKUWi.mp4?tag=12
		 * 					https://video.twimg.com/ext_tw_video/1440857764285222917/pu/vid/1280x720/4kW6o_s9nGr0PHES.mp4?tag=12
		 */

		if ( orig_url.includes("pbs.twimg.com/profile_images") ) {
			file 		= orig_url.match(regex.file);
			filename 	= file[2];
			filetype 	= file[3];
			wayback_url = `https://web.archive.org/web/https://pbs.twimg.com/profile_images/${filename}.${filetype}`;
		} else if ( orig_url.includes("pbs.twimg.com/profile_banners") ) { // grab the last part of the URL after the last slash
			filename 	= orig_url.match(regex.last_slash)[1];
			filetype 	= "jpg";
		} else if ( orig_url.includes("pbs.twimg.com/card_img") ) { // grab the last part of the URL after the last slash and before the ?
			filename 	= orig_url.match(regex.last_slash_query)[1];
			filetype 	= orig_url.match(regex.format)[1];
		} else if ( orig_url.includes("pbs.twimg.com/media") ) { 
			// if the URL contains a ?, grab the last part of the URL after the last slash and before the ?
			if ( orig_url.includes("?") ) {
				filename = orig_url.match(regex.last_slash_query)[1];
				filetype = orig_url.match(regex.format)[1];
			} else { // otherwise, grab the last part of the URL after the last slash
				file		= orig_url.match(regex.file);
				filename 	= file[2];
				filetype 	= file[3];
			}

			// grab the url for the wayback machine
			wayback_url = `https://web.archive.org/web/https://pbs.twimg.com/media/${filename}.${filetype}`;

			// grab the original URL for the highest quality version of the image by reforming the URL
			orig_url = `https://pbs.twimg.com/media/${filename}?format=${filetype}&name=orig`;
		} else if ( orig_url.includes("pbs.twimg.com/amplify_video_thumb") || orig_url.includes("pbs.twimg.com/ext_tw_video_thumb") ) {
			file 		= orig_url.match(regex.file);
			filename 	= file[2];
			filetype 	= file[3];
		} else if ( orig_url.includes("video.twimg.com/amplify_video") || orig_url.includes("video.twimg.com/ext_tw_video") ) {
			// if the URL contains a ?, grab the last part of the URL after the last slash and before the ?
			if ( orig_url.includes("?") ) {
				file		= orig_url.match(regex.file_query);
				filename 	= file[2];
				filetype 	= file[3];
			} else { // otherwise, grab the last part of the URL after the last slash
				file 		= orig_url.match(regex.file);
				filename 	= file[2];
				filetype 	= file[3];
			}
		}

		// if the filetype is still undefined, set it to "jpg" as a fallback
		if (filetype === undefined) {
			filetype = "jpg";
		}

		// if the filename is still undefined, set it to the URL as a fallback so it points to the original URL
		if (filename === undefined) {
			filepath = orig_url;
		} else {
			filepath 	= `media/${filename}.${filetype}`;
		}
	} else {
		filepath = `media/${filename}`;
	}


	// otherwise, add it to the media_replacements object and return the local URL
	let return_media = setMediaReplacements(
		url, 
		{
			"filename": filename,
			"type": filetype,
			"index_url": url,
			"orig_url": orig_url,
			"url": filepath,
			"wayback_url": wayback_url,
		}
	);

	return return_media;
}

/**
 * List all media requiring backing up
 * This only includes media posted by the main user
 * 
 * @todo complete rewrite
 * 
 * @returns {object} - The media to back up
 */
function listMediaToBackup() {
	let media_to_backup = [];

	let media_tweets = tweets_object['tweets_array'].filter(function(tweet) {
		return tweet.extended_entities !== undefined;
	});

	media_tweets.forEach(function(tweet) {
		tweet.extended_entities.media.forEach(function(media) {
			media_to_backup.push(media);
		});
	});

	// If the media is a video, get the video's variants and select the highest bitrate one
	media_to_backup.forEach(function(media) {
		if (media.type === "video") {
			let variants = media.video_info.variants;
			let highest_bitrate = 0;
			let highest_bitrate_variant = {};

			variants.forEach(function(variant) {
				if (variant.bitrate > highest_bitrate) {
					highest_bitrate = variant.bitrate;
					highest_bitrate_variant = variant;
				}
			});

			media.thumbnail_to_backup = media.media_url_https;
			media.url_to_backup = highest_bitrate_variant.url;
		} else if (media.type === "animated_gif") {
			media.thumbnail_to_backup = media.media_url_https;
			media.url_to_backup = media.video_info.variants[0].url;
		} else if (media.type === "photo") {
			let media_url_https = media.media_url_https;

			// Get the original image if it exists by reforming the URL
			if (media_url_https.includes("pbs.twimg.com/media")) {
				media_url_id = media_url_https.match(/\/media\/(\w+)/)[1];
				media_url_type = media_url_https.match(/\.(\w+)$/)[1];
				media_url_https = `https://pbs.twimg.com/media/${media_url_id}?format=${media_url_type}&name=orig`;

				media.url_id = media_url_id;
				media.url_to_backup = media_url_https;
				media.url_type = media_url_type;
			} else {
				media.url_to_backup = media_url_https;
			}
		} else if (media.type === "") {


		}
	});

	return media_to_backup;
}

/**
 * Download all media requiring backing up
 * 
 * @param {string} media - The media type to download
 */
function downloadMediaToBackup(media = "all") {
	let media_to_backup = listMediaToBackup();

	media_to_backup.forEach(function(media_object) {
		if (media_object.type === "video" || media_object.type === "all") {
			let media = {
				"url": media_object.url_to_backup,
				"thumbnail": media_object.media_url_https,
			}
			downloadMedia("video", media);
		}
		if (media_object.type === "photo" || media_object.type === "all") {
			let media = {
				"url": media_object.url_to_backup,
				"id": media_object.url_id,
				"type": media_object.url_type,
			}
			downloadMedia("photo", media);
		}
	});
}

/**
 * Download a media file
 * 
 * @param {string} type - The type of media to download
 * @param {object} media - The media to download
 * 
 * @returns {boolean} - Whether the download was successful
 */
function downloadMedia(type, media) {
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) { // If the request is successful
			if (type === "video") {
				let blob = new Blob([this.response], {type: "video/mp4"});
				let url = window.URL.createObjectURL(blob);
				let a = document.createElement("a");

			} else if (type === "photo") {
				let blob = new Blob([this.response], {type: `image/${media.type}`});
				let url = window.URL.createObjectURL(blob);
				let a = document.createElement("a");
				a.href = url;
				a.download = `${media.id}.${media.type}`;
				a.click();

				window.URL.revokeObjectURL(url);
			}

			return true;
		}

		return false;
	};

	return false;
}

/**
 * Format a picture element for a given URL
 * @uses substituteMediaUrl() to substitute the media URL
 * 
 * @param {string} url - The URL of the image to format
 * @param {string} alt - The alt text of the image
 * @param {object} args - The arguments
 * @param {string} args.classes - The classes to add to the image
 * @param {string} args.style - The styles to add to the image
 * @param {string} args.backup - URL to use as a backup if the image fails to load
 * 
 * @returns {string} - The formatted picture element
 */
function formatPicture( url, alt = "", args = { "classes": "", "classes_container": "", "style": ""} ) {

	let media = substituteMediaUrl({ url: url }); // substitute the media

	if (args.classes === undefined) args.classes 						= "";
	if (args.classes_container === undefined) args.classes_container 	= "";
	if (args.style === undefined) args.style 							= "";
	if (args.backup === undefined) args.backup 							= "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512' fill='%239995' style='scale:0.75'%3E%3C!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --%3E%3Cpath d='M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm96 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm69.2 46.9c-3-4.3-7.9-6.9-13.2-6.9s-10.2 2.6-13.2 6.9l-41.3 59.7-11.9-19.1c-2.9-4.7-8.1-7.5-13.6-7.5s-10.6 2.8-13.6 7.5l-40 64c-3.1 4.9-3.2 11.1-.4 16.2s8.2 8.2 14 8.2h48 32 40 72c6 0 11.4-3.3 14.2-8.6s2.4-11.6-1-16.5l-72-104z'/%3E%3C/svg%3E";
	
	let image = `
		<source srcset="${media.orig_url}" type="image/${media.type}">
		<source srcset="${media.url}" type="image/${media.type}">
		<img 	src="${args.backup}" class="${args.classes}" alt="${alt}" style="${args.style}" loading="lazy" 
				onerror="handlePictureError(this);" data-url="${media.index_url}">`;

	if (media.resolved_url !== undefined) {
		image = `
			<source srcset="${media.resolved_url}" type="image/${media.type}">
			<img 	src="${args.backup}" class="${args.classes}" alt="${alt}" style="${args.style}" loading="lazy"
					onerror="handlePictureError(this);" data-url="${media.index_url}">`;
	}

	image = `
		<picture class="embed-responsive-item ${args.classes_container}">
			${image}
		</picture>`;

	return image;
}

/**
 * Format a video element for a given URL
 * @uses substituteMediaUrl() to substitute the media URL
 * 
 * @param {string} url - The URL of the video to format
 * @param {string} type - The content type of video
 * @param {object} args - The arguments
 * @param {boolean} args.loop - Whether to loop the video
 * @param {string} args.poster - The URL of the video's poster image
 * @param {string} args.classes - The classes to add to the video
 * @param {string} args.style - The styles to add to the video
 * 
 * @returns {string} - The formatted video element
 */
function formatVideo( url, type = "video/mp4", args = { "loop": "", "poster": "", "classes": "", "style": ""} ) {
	let media = substituteMediaUrl({ url: url }); // substitute the media

	if (args.loop === undefined) {
		args.loop = "";
	} else if (args.loop === true) {
		args.loop = "loop";
	}

	if (args.poster === undefined) args.poster 		= "";
	if (args.classes === undefined) args.classes 	= "";
	if (args.style === undefined) args.style 		= "";

	let video = `
		<video class="embed-responsive-item ${args.classes}" playsinline controls ${args.loop} preload="none" poster="${args.poster}" style="${args.style}">
			<source src="${media.orig_url}" type="${type}">
			<source src="${media.url}" type="${type}">
			<source src="media/${media.filename}_002.${media.type}" type="${type}">
		</video>`;

	return video;
}

/**
 * Parse user mentions and format them as links
 * 
 * @TODO Add support for popover cards on hover, if user is in the users object
 * 
 * @param {string} text - The text to parse
 * @param {object} mentions - The mentions object
 * @param {object} args - The arguments
 * @param {string} args.reply_screen_name - The screen name of the user being replied to (if applicable)
 * @param {string} args.classes - Additional classes to add to the link
 * @param {string} args.style - Additional styles to add to the link
 * 
 * @returns {string} - The parsed text
 */
function parseUserMentions( text, mentions = [], args = { "reply_screen_name": undefined, "classes": "", "style": "" } ) {
	// Get the reply screen name from the args
	let reply_screen_name = args.reply_screen_name;

	// Get username aliases from the config
	let aliases = config.aliases;
	// Replace any aliases in the aliases[].former array in the tweet with the current username mention
	aliases.forEach(function(alias) {
		alias.former.forEach(function(former) {
			alias_regex = new RegExp(`(?<![ "]>|\w)@${former}`, "ig");
			text = text.replace(alias_regex, `<a href="https://twitter.com/${alias.current}" target="_blank" class="mention link link-underline link-underline-opacity-0 link-underline-opacity-100-hover" title="&commat;${former}">@${alias.current}</a>`);
		});
	});

	// Replace any mentions in the tweet with the actual mentions from the entities
	mentions.forEach(function(mention) {
		mention_regex = new RegExp(`(?<![ "]>|\w)@${mention.screen_name}`, "ig");
		text = text.replace(mention_regex, `<a href="https://twitter.com/${mention.screen_name}" target="_blank" class="mention link link-underline link-underline-opacity-0 link-underline-opacity-100-hover">@${mention.screen_name}</a>`);
	});

	// Replace any reply mentions in the tweet with the actual mention from the reply_screen_name
	if (reply_screen_name !== undefined) {
		mention_regex = new RegExp(`(?<![ "]>|\w)@${reply_screen_name}`, "ig");
		// check if the mention still matches the reply_screen_name
		if (text.includes(`@${reply_screen_name}`)) {
			text = text.replace(mention_regex, `<a href="https://twitter.com/${reply_screen_name}" target="_blank" class="mention link link-underline link-underline-opacity-0 link-underline-opacity-100-hover">@${reply_screen_name}</a>`);
		}
	}

	// Wrap any mentions not already wrapped in <a> tags in <a> tags with the class "mention-failed"
	let mark_unresolved = (mentions === undefined || mentions.length === 0) ? false : true;
	let unformatted_mention_regex 	= /(?<![ "]>|\w)@(\w+)/g;
	if (mark_unresolved) {
		text = text.replace(unformatted_mention_regex, `<a href="https://twitter.com/$1" target="_blank" class="mention mention-failed link link-danger link-underline-danger link-underline-opacity-0 link-underline-opacity-100-hover">@$1</a>`);
	} else {
		text = text.replace(unformatted_mention_regex, `<a href="https://twitter.com/$1" target="_blank" class="mention link link-underline link-underline-opacity-0 link-underline-opacity-100-hover">@$1</a>`);
	}

	return text;
}

/**
 * Register custom JSRender tags
 * 
 * @returns {void}
 */
function registerCustomTags() {
	// User tags
	$.views.tags({
		user : function( id ) {
			if ( tweets_object['users'][id] === undefined ) { // check if the user exists in the users object
				return false
			}
			return tweets_object['users'][id];
		},
		username : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "User Name";
			}
			return tweets_object['users'][id].name;
		},
		userhandle : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "username";
			}
			return `${tweets_object['users'][id].screen_name}`;
		},
		usertag : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "@username";
			}
			return `@${tweets_object['users'][id].screen_name}`;
		},
		useravatar : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
			}
			// check if the profile image exists in the media_replacements object and return that if it does
			if ( media_replacements[tweets_object['users'][id].profile_image_url_https] === undefined ) {
				substituteMediaUrl({ url: tweets_object['users'][id].profile_image_url_https });
			}
			return media_replacements[tweets_object['users'][id].profile_image_url_https].url;
		},
		useravatar_img : function( id ) {		// Return the user's avatar as a formatted Picture element
			let args = {
				classes:	this.ctxPrm("classes"),
				style:		this.ctxPrm("style"),
				backup:		`https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png`,
			}

			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return formatPicture("https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png", "", args);
			}

			args.backup = `https://unavatar.io/twitter/${tweets_object['users'][id].screen_name}?fallback=${args.backup}`;

			let url = tweets_object['users'][id].profile_image_url_https;

			return formatPicture(url, "", args);
		},
		userbanner : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
			}
			// check if the profile banner exists in the media_replacements object and return that if it does
			if ( media_replacements[tweets_object['users'][id].profile_banner_url] === undefined ) {
				substituteMediaUrl({ url: tweets_object['users'][id].profile_banner_url });
			}
			return media_replacements[tweets_object['users'][id].profile_banner_url].url;
		},
		user_url : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "https://twitter.com/";
			}
			return `https://twitter.com/${tweets_object['users'][id].screen_name}`;
		},
		user_popover : { // Return a popover with the user's profile, has a an opening and closing tag to be specified in the tag
			contentCtx: true, // the data context is the same as the parent
			render: function(id) {
				let args = {
					tag:		this.ctxPrm("tag_name") || "span",
					classes:	this.ctxPrm("classes") 	|| "",
					href:		this.ctxPrm("href") 	|| false,
					style:		this.ctxPrm("style") 	|| "",
					attr:		this.ctxPrm("attr") 	|| "",
					is_user:	this.ctxPrm("is_user") 	|| false,
				};

				if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
					return `
						<${args.tag} class="user-popover ${args.classes}" tabindex="0" style="${args.style}" ${args.attr}>
							${this.tagCtx.render()}
						</${args.tag}>
					`;
				}

				if (args.href) {
					args.attr += ` href="https://twitter.com/${tweets_object['users'][id].screen_name}"`;
				}

				let template = `
					<${args.tag} class="user-popover ${args.classes}" style="${args.style}" ${args.attr} tabindex="0">
						${this.tagCtx.render()}
					</${args.tag}>
				`;

				return template;
			},
			onAfterLink: function( tagCtx, linkCtx, ctx, ev, eventArgs ) {
				let args = {
					tag:		this.ctxPrm("tag_name") || "span",
					classes:	this.ctxPrm("classes") 	|| "",
					href:		this.ctxPrm("href") 	|| false,
					style:		this.ctxPrm("style") 	|| "",
					attr:		this.ctxPrm("attr") 	|| "",
					is_user:	this.ctxPrm("is_user") 	|| false,
				};

				let data = linkCtx.data;
				let user = (args.is_user) ? data : data.user;

				if (user === undefined || typeof user !== "object") {
					console.log ("user_popover: user is undefined or not an object", user);
					return;
				}

				let popover = `
					{{useravatar_img id_str ~classes="mb-2 rounded-circle bg-body" ~style="height:64px;width:64px;max-height:64px;max-width:64px;" /}}
					<h5 class="name text-body-emphasis">
						{{tweet_emoji name /}}
						<sub class="screen-name d-block pt-2 fw-normal text-body-secondary">
							@{{:screen_name}}
						</sub>
					</h5>
					<p class="description pt-3">
						{{bio_content description /}}
					</p>
					<div class="user-stats">
						<span class="followers fw-medium text-nowrap">
							<span class="count fw-bold text-body-emphasis">
								{{format_number followers_count /}}
							</span> 
							Followers
						</span>
						• 
						<span class="following fw-medium text-nowrap">
							<span class="count fw-bold text-body-emphasis">
								{{format_number friends_count /}}
							</span> 
							Following
						</span>
					</div>
					<style>
						.popover[data-popper-reference-hidden], .popover[data-popper-escaped] {
							display: none;
						}
					</style>
				`;

				popover = $.templates( popover );

				// Initialize this popover
				let pop = {};
				let elem = this.contents('.user-popover');

				// Create a new popover
				pop = new bootstrap.Popover($(elem).find('img'), {
					// container: $(elem).closest('.card'),
					content: popover.render( user, tagCtx ),
					html: true,
					trigger: "manual",
					sanitize: false,
					allowList: Object.assign( bootstrap.Tooltip.Default.allowList, {
						div: ["class"],
						h3: ["class"],
						span: ["class"],
						style: [],
					}),
					placement: "bottom",
					offset: ({ placement, reference, popper }) => { // https://popper.js.org/docs/v2/modifiers/offset/
						// Align the popper with the left side of the reference element
						let skid = (reference.width - popper.width) / -2;
						if (placement === "bottom") {
							return [
								(args.is_user) ? skid + 15 : skid, 
								(args.is_user) ? 10 : 15
							];
						} else if (placement === "top") {
							return [
								(args.is_user) ? skid + 15 : skid, 
								10
							];
						} else {
							return [];
						}
					},
					fallbackPlacements: ["top", "right", "left"],
					popperConfig: function( bsDefaults ) {
						let modifiers = [
							{
								name: "arrow",
								options: {
									element: ".popover-arrow",
									padding: 30
								},
							},
							{
								name: 'hide',
								enabled: true,
								data: {
									isReferenceHidden: true,
									isPopperEscaped: true,
								},
							},
						];

						// Merge the modifiers arrays and override any child objects with matching .name properties
						modifiers.forEach(function(modifier) {
							let name = modifier.name;
							let bsModifiers = bsDefaults.modifiers;
							let bsModifier = bsModifiers.find( ( name ) => name === modifier.name );

							if (bsModifier !== undefined) {
								let index = bsModifiers.indexOf(bsModifier);
								bsModifiers[index] = modifier;
							} else {
								bsModifiers.push(modifier);
							}

							modifiers = bsModifiers;
						});

						return modifiers;
					}
				});

				// On hover, focus or click, add the popover
				$(elem).on("mouseenter focus click", function(event) {
					// Show the popover
					if (pop.tip === undefined || pop.tip === null) {
						pop.show();
					}

					// On click outside popover or target, hide this popover. This makes sure the popover is hidden when the user clicks outside of it
					let hide_on_click = function(event) {
						if ( !$(event.target).closest('.popover').length && !$(event.target).closest('.user-popover').length ) {
							pop.hide(); // Hide the popover
							$(document).off("click", hide_on_click); // Remove the event listener
						}
					};
					$(document).on("click", hide_on_click);

					// When another .user-popover is triggered, hide this popover. This makes sure only one popover is shown at a time
					let hide_on_other = function(event) {
						if (event.currentTarget != elem[0]) {
							pop.hide(); // Hide the popover
							$(document).off("mouseenter focus click", '.user-popover', hide_on_other); // Remove the event listener
						}
					};
					$(document).on("mouseenter focus click", '.user-popover', hide_on_other);
				});
			},
			onUnbind: function( tagCtx, linkCtx, ctx, ev, eventArgs ) {
				let elem = this.contents('.user-popover');
				$(elem).off("mouseenter focus");
				// $(pop).off("click");
			},
		},
		userstats : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "[?] Followers &middot; [?] Following";
			}
			return `${tweets_object['users'][id].followers_count} Followers &middot; ${tweets_object['users'][id].friends_count} Following`;
		},
		userbio : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "User Bio";
			}
			return tweets_object['users'][id].description;
		},
		userlocation : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "User Location";
			}
			return tweets_object['users'][id].location;
		},
		userwebsite : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "https://twitter.com/";
			}
			return tweets_object['users'][id].url;
		},
		userjoined : function( id ) {
			if (tweets_object['users'][id] === undefined) { // check if the user exists in the users object
				return "00:00 AM - 00/00/0000";
			}
			return tweets_object['users'][id].created_at;
		},
	});

	// Tweet tags
	$.views.tags({
		format_date : function( date ) { // Format the date to be more readable
			let args = {
				"format":		this.ctxPrm("format"),
			}

			let format = (args.format === undefined) ? "short" : args.format;

			let date_object = new Date(date);
			let date_options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
			let date_string = "";

			switch (format) {
				case "long":
					date_options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h24', timeZone: 'UTC'  };
					date_string = date_object.toLocaleTimeString("en-US", date_options);
					break;
				case "medium":
					date_options = { year: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h24', timeZone: 'UTC'  };
					date_string = date_object.toLocaleTimeString("en-US", date_options);
					break;
				case "tiny":
					date_options = { year: '2-digit', month: '2-digit', day: '2-digit' };
					date_string = date_object.toLocaleDateString("en-US", date_options);
					break;
				case "short":
				default:
					date_options = { year: 'numeric', month: 'long', day: 'numeric' };
					date_string = date_object.toLocaleDateString("en-US", date_options);
					break;
			}

			return date_string;
		},
		bio_content : function(text) { // Format the bio content to include links, hashtags, and mentions
			// Get the bio's entities
			let links 						= main_user.entities.description.urls;
			let hashtags 					= main_user.entities.description.hashtags;

			// Replace newlines with <br> tags
			text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');

			// Replace any links in the bio with the actual links from the entities
			if ( links !== undefined ) {
				links.forEach(function(link) {
					text = text.replace(link.url, `<a href="${link.expanded_url}" target="_blank" class="link link-underline link-underline-opacity-0 link-underline-opacity-100-hover">${link.display_url}</a>`);
				});
			}

			// Replace any hashtags in the bio with the actual hashtags from the entities
			if ( hashtags !== undefined ) {
				hashtags.forEach(function(hashtag) {
					text = text.replace(`#${hashtag.text}`, `<a href="https://twitter.com/hashtag/${hashtag.text}" target="_blank" class="link link-underline link-underline-opacity-0 link-underline-opacity-100-hover">#${hashtag.text}</a>`);
				});
			}

			// Replace any mentions in the bio with links to the mentioned users' profiles
			text = parseUserMentions(text);

			return text;
		},
		tweet_content : function(id, text) { // Format the tweet content to include links, hashtags, and mentions
			// Get the tweet's entities
			let links 						= this.tagCtx.view.data.entities.urls;
			let mentions 					= this.tagCtx.view.data.entities.user_mentions;
			let reply_screen_name 			= this.tagCtx.view.data.in_reply_to_screen_name;

			// Replace newlines with <br> tags
			text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');

			// Replace any hashtags in the tweet with hashtag links, do this first so we don't break any links
			text = text.replace(/(?<!\w)#(\w+)/g, `<a href="https://twitter.com/hashtag/$1" target="_blank" class="link link-underline link-underline-opacity-0 link-underline-opacity-100-hover">#$1</a>`);

			// Replace any links in the tweet with the actual links from the entities
			links.forEach(function(link) {
				text = text.replace(link.url, `<a href="${link.expanded_url}" target="_blank" class="link link-underline link-underline-opacity-0 link-underline-opacity-100-hover">${link.display_url}</a>`);
			});

			// Replace any mentions in the tweet with the actual mentions from the entities
			text = parseUserMentions(text, mentions, { "reply_screen_name": reply_screen_name });

			// Remove any URLs from the tweet text that match media URLs
			if (this.tagCtx.view.data.entities.media !== undefined) {
				this.tagCtx.view.data.entities.media.forEach(function(media) {
					text = text.replace(media.url, "");
				});
			}

			// Remove any unformatted URLs at the end of a tweet that start with https://t.co/
			let unformatted_url_regex = /https:\/\/t\.co\/\w+$/;
			if (unformatted_url_regex.test(text)) {
				text = text.replace(unformatted_url_regex, "");
			}

			// Replace any emojis with Twemoji from Twitter
			text = parseEmojis(
				text,
				{ 
				    attr: { "style": "height:1.2em;width:1.2em;vertical-align:-0.2em;margin:0 0.1em;" }
				}
			);

			// If the text is not empty or only contains whitespace, wrap it in a <p> tag
			if ( text !== "" && !/^\s*$/.test(text) ) {
				text = `<p class="tweet-text mt-3 mb-4">${text}</p>`;
			} else {
				text = "";
			}

			return text;
		},
		tweet_emoji : function( text ) { // Replace any emojis with Twemoji from Twitter
			text = parseEmojis(
				text
			);

			return text;
		},
		tweet_image : function( url, alt = "" ) { // Embed an image in a tweet
			let args = {
				crop:				this.ctxPrm("crop"),
				classes:			this.ctxPrm("classes"),
				classes_container:	this.ctxPrm("classes_container"),
				style:				this.ctxPrm("style"),
			}

			let crop_style = "";
			if (args.crop === true) crop_style 									= `max-height: 40vh;object-fit: cover;`;
			if (args.classes === undefined) {args.classes 						= "";}
			if (args.classes_container === undefined) {args.classes_container 	= "";}
			if (args.style === undefined) {
				args.style 		= crop_style;
			} else {
				args.style 		= args.style + " " + crop_style;
			}
			
			return formatPicture(url, alt, args);
		},
		tweet_video : function( variants, id, id_str ) { // Get the highest bitrate video variant and return the URL
			let args = {
				poster:		this.ctxPrm("poster"),
				loop:		this.ctxPrm("loop"),
				classes:	this.ctxPrm("classes"),
				style:		this.ctxPrm("style"),
			}

			if (args.poster === undefined) args.poster 		= "";
			if (args.classes === undefined) args.classes 	= "w-100";
			if (args.loop === undefined) args.loop 			= false;
			if (args.style === undefined) args.style 		= "";

			let highest_bitrate = -1;
			let highest_bitrate_variant = {};

			variants.forEach( function( variant ) {
				// check if content_type is video/mp4 or video/webm
				if (variant.content_type == "video/mp4" || variant.content_type == "video/webm") { 
					if (variant.bitrate > highest_bitrate) {
						highest_bitrate = variant.bitrate;
						highest_bitrate_variant = variant;
					}
				}
			});

			let video = formatVideo(highest_bitrate_variant.url, highest_bitrate_variant.content_type, args);

			return video;
		},
		tweet_poll_counter : function( id ) { // Count the total number of votes in a poll and store it in the tweet object
			let count_total = 0;

			// Put all the choice{?}_count values into an array
			let choice_counts = Object.keys(tweets_object['tweets'][id].card.binding_values).filter(function(key) {
				return key.includes("choice") && key.includes("_count");
			}).map(function(key) {
				return tweets_object['tweets'][id].card.binding_values[key].string_value;
			});

			// Add up all the choice counts
			choice_counts.forEach(function(count) {
				count_total += parseInt(count);
			});

			// console.log( count_total );
			// Add the count to the tweet object
			this.tagCtx.view.data.card.binding_values.count_total = count_total;
		},
		tweet_poll_percentage : function( id, count ) { // Calculate the percentage of votes in a poll and store it in the tweet object
			// console.log(id, count);
			
			// Make sure the count is an integer
			count = parseInt(count);

			// Calculate the percentage
			let percentage = Math.round((count / this.tagCtx.view.data.card.binding_values.count_total) * 100);

			return percentage;
		}
	});

	// Misc tags
	$.views.tags({
		base_url : function( path = "" ) {
			url = window.location.protocol + '//' + window.location.host

			// if path is empty or not a string, return the current URL
			if (path === "" || typeof path !== "string") {
				return url;
			}

			return url + path;
		},
		orig_url : function( path = "" ) {
			url = window.location.protocol + '//' + window.location.host + window.location.pathname

			// if path is empty or not a string, return the current URL
			if (path === "" || typeof path !== "string") {
				return url;
			}

			return url + path;
		},
		full_url : function( path = "" ) {
			url = window.location.href

			// if path is empty or not a string, return the current URL
			if (path === "" || typeof path !== "string") {
				return url;
			}

			return url + path;
		},
		media_url : function( url ) {
			return substituteMediaUrl({ url: url }).url;
		},
		format_number : function( number ) {
			return number.toLocaleString();
		}
	});
}

/**
 * Discard ads from a tweets array
 * 
 * @param {Array} tweets - The tweets array
 * 
 * @returns {Array} - The tweets array without ads
 */
function discardAds( tweets ) {
	let filtered_tweets = tweets.filter(function(tweet) {
		let scopes = tweet.scopes;
		if (scopes === undefined) {
			return true;
		}
		tweets_object['ads_removed'] = tweets_object['ads_removed'] || [];
		tweets_object['ads_removed'].push(tweet);
		return false;
	});

	// Now we delete the ads from the original tweets object
	tweets_object['ads_removed'].forEach(function(ad) {
		delete tweets_object['tweets'][ad.id_str];
	});

	return filtered_tweets;
}

/**
 * Search the tweets object with a given query
 * 
 * @param {string} query - The query to search for
 * 
 * @returns {Array} - The search results
 */
function searchTweets( query, initial = false ) {
	let query_terms = query.trim();
	let results = {};

	// Split the query into separate terms, except for quoted terms
	query_terms = query_terms.match(/"[^"]+"|\S+/g);
	query_terms = query_terms.map(function(term) {
		term = term.replace(/"/g, ""); // Remove the quotes from the terms
		term = term.trim(); // Trim any whitespace from the terms
		term = term.toLowerCase(); // Convert the terms to lowercase
		return term;
	});

	// Create an array of the tweets to search
	let search_tweets = Object.values(tweets_object['tweets']);

	// // Discard any ads from the search_tweets array
	// search_tweets = discardAds(search_tweets);

	// For each term in the query, search the tweets array
	query_terms.forEach(function(term) {
		// Search the tweets_array for the query
		search_tweets.forEach(function(tweet, index) {
			// Check if the tweet text contains the query
			if (tweet.full_text.toLowerCase().includes(term)) {
				results[tweet.id_str] = tweet;
				delete search_tweets[index]; // Remove the tweet from the search_tweets array
			}

			// Check if the quoted tweet text contains the query
			if (tweet.is_quote_status && tweet.quoted_tweet !== undefined && tweet.quoted_tweet.full_text.toLowerCase().includes(term)) {
				results[tweet.id_str] = tweet;
				delete search_tweets[index]; // Remove the tweet from the search_tweets array
			}

			// If user is undefined, define it
			if (tweet.user === undefined) {
				tweet['user'] = tweets_object['users'][tweet.user_id_str];

				if (tweet['user'] === undefined) {
					return false;
				}
			}

			// Check if the tweet's user's name contains the query
			if (tweet.user.name.toLowerCase().includes(term)) {
				results[tweet.id_str] = tweet;
				delete search_tweets[index]; // Remove the tweet from the search_tweets array
			}

			// Check if the tweet's user's screen name contains the query
			if (tweet.user.screen_name.toLowerCase().includes(term)) {
				results[tweet.id_str] = tweet;
				delete search_tweets[index]; // Remove the tweet from the search_tweets array
			}
		});
	});

	let results_array = Object.values(results);

	// Add the search results to the tweets_object in a new "search_results" array property
	$.observable(tweets_object).setProperty("search_results", results_array);

	// Switch to the search_results loop
	if ( initial ) {
		displayTweets({"tweets": tweets_object, "loop": "search_results"});
	} else {
		switchTweetLoop("search_results", {"force": true});
	}

	// Set the hash to the search query, if it's not already set
	if (window.location.hash !== `search=${query}`) {
		window.location.hash = `search=${query}`;
	}

	return results_array;
}

/**
 * Handle the search form submission
 * 
 * @param {object} event - The event object
 * 
 * @returns {Array | boolean} - The search results or false if the search query failed
 */
function handleSearch(event) {
	event.preventDefault();

	let search_query = document.querySelector("input#search").value;

	if (search_query === "") {
		return false;
	}

	let search_results = searchTweets(search_query);

	if (search_results.length === 0) {
		return false;
	}

	return search_results;
}

/**
 * Resolve User Object from related data (e.g. username, former username, etc.)
 * 
 * @param {object} data - The related data
 * @param {string} data.screen_name - The username of the user (either current or former)
 * @param {string} data.username - alias for data.screen_name
 * @param {string} data.name - The screen name of the user
 * 
 * @returns {object} - The user object
 */
function resolveUserObject( data = {} ) {
	let user_data = {
		"username"	: 	(data.screen_name === undefined) 	? (data.username === undefined) 	? "" : data.username : data.screen_name,
		"name"		: 	(data.name === undefined) 		? "" : data.name,
	};

	if ( user_data.username === "" && user_data.name === "" ) {
		return false;
	}

	if ( user_data.username !== "" ) {
		// Check if the username is or has an alias defined in the config
		let has_alias = (
			config.aliases.find(alias => alias.current === user_data.username) 		!== undefined
		);
		let is_alias = (
			config.aliases.find(alias => alias.former.includes(user_data.username)) !== undefined
		);
		
		if ( is_alias ) {
			user_data.former_username = user_data.username;
			let alias = config.aliases.find(alias => alias.former.includes(user_data.username));
			user_data.username = alias.current;
		}

		// Find the user object containing the username
		let user = Object.values(tweets_object['users']).find(
			user => user.screen_name.toLowerCase() === user_data.username.toLowerCase()
		);

		if ( user === undefined ) {
			return false;
		}

		return user;
		
	} else if ( user_data.name !== "" ) {
		// Find the user object containing the name
		let user = Object.values(tweets_object['users']).find(
			user => user.name.toLowerCase() === user_data.name.toLowerCase()
		);

		if ( user === undefined ) {
			return false;
		}

		return user;
	}
}


/**
 * Sets the main user
 * 
 * @param {object} user - The user to set as the main user
 * 
 * @returns {object} - The main user object
 */
function setMainUser(user = tweets_object['users'][config.id]) {
	main_user = user;

	// Replace the profile image URL with the larger version
	main_user.profile_image_url_https = main_user.profile_image_url_https.replace("_normal", "_400x400");

	// Check if the first instances of the meta tags are filled out, if not, fill them out
	let meta_tags = document.querySelectorAll("meta[property^='og:']");
	meta_tags.forEach(function(tag) {
		if (tag.getAttribute("property") === "og:title" && tag.getAttribute("content") === "Archived Tweets") {
			tag.setAttribute("content", `${main_user.name} (@${main_user.screen_name})`);
		} else if (tag.getAttribute("property") === "og:description" && tag.getAttribute("content") === "A page to display archived tweets from a tweets.json file.") {
			tag.setAttribute("content", `Twitter Archive of ${main_user.name} (@${main_user.screen_name})`);
		} else if (tag.getAttribute("property") === "og:image" && tag.getAttribute("content") === "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png") {
			tag.setAttribute("content", main_user.profile_image_url_https);
		}
	});

	// Check if the page first instance of the page title is filled out, if not, fill it out
	if (document.querySelectorAll("title")[0].innerHTML === "Archived Tweets") {
		document.querySelectorAll("title")[0].innerHTML = `${main_user.name} (@${main_user.screen_name}) / Twitter Archive`;
	}

	// Display the user's bio using JSRender
	let user_banner = $.templates["user-banner"];
	let user_head 	= $.templates["user-head"];
	let user_bio 	= $.templates["user-bio"];
	
	let user_banner_output 	= user_banner.render(main_user);
	let user_head_output 	= user_head.render(main_user);
	let user_bio_output 	= user_bio.render(main_user);

	document.querySelector(".user-banner").innerHTML	= user_banner_output;
	document.querySelector(".user-head").innerHTML 		= user_head_output;
	document.querySelector(".user-bio").innerHTML 		= user_bio_output;
	

	return main_user;
}

/**
 * Sets the page title and description
 * 
 * @param {object} args - The arguments
 * @param {string} args.title - The title to set
 * @param {string} args.description - The description to set
 * @param {string} args.image - The image to set
 * 
 * @returns {void}
 */
function setPageInfo(args = {title: undefined, description: undefined, image: undefined}) {
	let title 			= (args.title === undefined) ? undefined : args.title;
	let description 	= (args.description === undefined) ? undefined : args.description;
	let image 			= (args.image === undefined) ? undefined : args.image;

	// If the title, description, and image are all undefined, return
	if (title === undefined && description === undefined && image === undefined) {
		return;
	}

	// If the title is not undefined, set it
	if (title !== undefined) {
		document.title = `${title} / Twitter Archive`;
		document.querySelector("meta[property='og:title']").setAttribute("content", title);
	}

	// If the description is not undefined, set it
	if (description !== undefined) {
		document.querySelector("meta[property='og:description']").setAttribute("content", description);
	}

	// If the image is not undefined, set it
	if (image !== undefined) {
		document.querySelector("meta[property='og:image']").setAttribute("content", image);
	}
}

/**
 * Set Content Title
 * @TODO Rewrite this to use templates
 * 
 * @param {string} title - The title to set
 * 
 * @returns {void}
 */
function setContentTitle(title) {
	document.querySelector("h3").innerHTML = title;
}

	
/**
 * Sets the theme
 * 
 * @param {string} theme - The theme to set
 * 
 * @returns {void}
 */
function setTheme(theme) {
	document.documentElement.setAttribute("data-bs-theme", theme);
}

/**
 * Add or remove a tweet's id in the favorites array
 * Store the favorites array in localStorage
 * 
 * @param {string} id - The ID of the tweet to favorite
 * @param {boolean} favorited - Whether the tweet is favorited
 * 
 * @returns {Array} - The favorites array
 */
function favorite_tweet( id, favorited ) {
	if (favorited) {
		tweets_object['favorites'].push( tweets_object['tweets'][id] );
		// Set the favorite property to the tweet object using jsObservable so the page updates
		$.observable(tweets_object['tweets'][id]).setProperty("favorited", true);
	} else if ( tweets_object['favorites'].includes( tweets_object['tweets'][id] ) ) {
		let index = tweets_object['favorites'].indexOf( tweets_object['tweets'][id] );
		$.observable(tweets_object['favorites']).remove( index );
		// Remove the favorite property from the tweet object
		$.observable(tweets_object['tweets'][id]).removeProperty("favorited");
	}

	// Store the favorites array in localStorage
	try {
		// Only store the id_str of the tweet in the favorites array
		let favorites_ids = tweets_object['favorites'].map(function(tweet) {
			// Ignore the tweet if it's undefined or null, or if it doesn't have an id_str property
			if ( tweet === undefined || tweet === null || tweet.id_str === undefined ) {
				return;
			}

			return tweet.id_str;
		});

		localStorage.setItem( "favorites", JSON.stringify( favorites_ids ) );
	} catch (e) {
		console.error( "Error storing favorites in localStorage: ", e );
	}

	return tweets_object[ 'favorites' ];
}

/**
 * Load the favorites array from localStorage
 * 
 * @returns {Array} - The favorites array
 */
function loadFavorites() {
	try {
		let favorites_ids 		= JSON.parse( localStorage.getItem( "favorites" ) );
		let update_favorites 	= false;

		// If the favorites array is empty, return
		if (favorites_ids === null || favorites_ids.length === 0) {
			return tweets_object[ 'favorites' ];
		}

		// Get the tweets from the tweets object and add them to the favorites array
		favorites_ids.forEach(function(id) {
			// Check if the value is a valid tweet id string, if not, remove it from the array and return
			if (tweets_object['tweets'][id] === undefined || tweets_object['tweets'][id] === null) {
				favorites_ids.splice( favorites_ids.indexOf( id ), 1 );
				update_favorites = true;
				return;
			}

			tweets_object['favorites'].push( tweets_object['tweets'][id] );

			// Add the favorite property to the tweet object
			tweets_object['tweets'][id]['favorited'] = true;
		});

		// Remove the favorite property from any tweets not in the favorites array
		Object.keys(tweets_object['tweets']).forEach(function(id) {
			if (tweets_object['tweets'][id]['favorited'] === undefined) {
				delete tweets_object['tweets'][id]['favorited'];
			}
		});

		// Update the favorites array using jsObservable so the page updates if necessary
		$.observable(tweets_object['favorites']).refresh( tweets_object['favorites'] );

		// Store the favorites array in localStorage if it was updated/changed
		if (update_favorites) {
			try {
				localStorage.setItem( "favorites", JSON.stringify( favorites_ids ) );
			} catch (e) {
				console.error( "Error storing favorites in localStorage: ", e );
			}
		}
	} catch (e) {
		console.error( "Error loading favorites from localStorage: ", e );
	}

	return tweets_object[ 'favorites' ];
}

/**
 * Download a the favorites array as a JSON file
 * 
 * @returns {boolean} - Whether the download was successful
 */
function exportFavorites() {
	// Check if the favorites array exists
	if (tweets_object['favorites'] === undefined) {
		return false;
	}

	// Check if the favorites array is empty
	if (tweets_object['favorites'].length === 0) {
		return false;
	}
	
	// Create a JSON file from the favorites array
	try {
		let blob = new Blob([JSON.stringify(tweets_object['favorites'])], {type: "application/json"});
		let url = window.URL.createObjectURL(blob);
		let a = document.createElement("a");
		a.href = url;
		a.download = "favorites.json";
		a.click();

		// Revoke the object URL to free up memory
		window.URL.revokeObjectURL(url);
	} catch (e) {
		console.error("Error exporting favorites: ", e);
		return false;
	}

	return true;
}

/**
 * Import a favorites JSON file
 * 
 * @returns {boolean} - Whether the import was successful
 */
function importFavorites() {
	let confirm_overwrite = confirm("Importing favorites will overwrite your current favorites. Are you sure you want to continue?");
	if (!confirm_overwrite) {
		return false;
	}

	try {
		let input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = function(event) {
			let file = event.target.files[0];
			let reader = new FileReader();
			reader.onload = function(event) {
				let favorites = JSON.parse( event.target.result );

				// Get only the id_str of the tweets in the favorites array and store it in localStorage
				favorites = favorites.map(function(tweet) {
					return tweet.id_str;
				});

				try {
					localStorage.setItem( "favorites", JSON.stringify( favorites ) );

					// Use loadFavorites() to update the favorites array from localStorage
					loadFavorites();
				} catch (e) {
					console.error("Error storing favorites in localStorage: ", e);
					return false;
				}
			};
			reader.readAsText(file);
		};
		input.click();

		return true;
	} catch (e) {
		console.error("Error importing favorites: ", e);
		return false;
	}
}


/**
 * Set media URLs in the media_replacements object and save it to localStorage
 * 
 * @param {string} index_url 			- The index URL of the media replacement object
 * @param {object} media_replacement 	- The media replacement object
 * @param {function} args.callback 		- The callback function
 * @param {boolean} args.return_full 	- Whether to return the full media replacements object
 * 
 * @returns {object} - The media replacement object
 */
function setMediaReplacements(index_url, media_replacement, args = { callback: function(){}, return_full: false }) {
	let callback 			= args.callback 			|| function(){};
	let return_full 		= args.return_full 			|| false;

	// If index_url or media_replacement is undefined, return
	if (index_url === undefined || media_replacement === undefined) {
		return false;
	}

	media_replacements[index_url] = media_replacement;

	try {
		localStorage.setItem("media_replacements", JSON.stringify(media_replacements));
	} catch (e) {
		console.error("Error storing media replacements in localStorage: ", e);
	}

	if (callback !== undefined) {
		callback(media_replacements);
	}

	if (return_full) {
		return media_replacements;
	}

	return media_replacement;
}


/**
 * Load media URLs from localStorage and merge them with the media_replacements object
 * 
 * @returns {object} - The media replacements object
 */
function loadMediaReplacements() {
	try {
		let media_replacements_stored = JSON.parse( localStorage.getItem("media_replacements") );

		if (media_replacements_stored === null) {
			return media_replacements;
		}

		// Merge the stored media replacements with the media_replacements object
		media_replacements = Object.assign(media_replacements, media_replacements_stored);
	} catch (e) {
		console.error("Error loading media replacements from localStorage: ", e);
	}

	return media_replacements;
}


/**
 * Purge media replacements from the media_replacements object and localStorage
 * 
 * @param {object} args - The arguments
 * @param {string} args.purge - [index url | 'all'] - The index URL to purge or 'all' to purge all media replacements
 * @param {function} args.callback - The callback function
 * 
 * @returns {object} - The media replacements object from before the purge
 */
function purgeMediaReplacements(args = { index_url: "all", callback: function(){} }) {
	let purge 		= args.purge 		|| "all";
	let callback 	= args.callback 	|| function(){};

	let media_replacements_before = Object.assign({}, media_replacements);

	if (purge === "all") {
		media_replacements = {};
	} else {
		delete media_replacements[purge];
	}

	try {
		localStorage.setItem("media_replacements", JSON.stringify(media_replacements));
	} catch (e) {
		console.error("Error storing media replacements in localStorage: ", e);
	}

	callback(media_replacements_before);

	return media_replacements_before;
}


/**
 * Function to handle the header and banner on scroll events
 * 
 * @param {Event} e - The scroll event
 * 
 * @returns {void}
 */
function handleScroll( e ) {
	let header = document.querySelector(".user-head");
	let banner = document.querySelector(".user-banner");
	let navbar = document.querySelector(".navbar");

	// Do nothing if the scroll position is past the viewport height
	if ( e.target.scrollingElement.scrollTop > window.innerHeight ) {
		header.querySelector("img").style.margin = "30px 0 -34px 0";
		header.querySelector("img").classList.remove("border");
		header.querySelector("img").style.height = "64px";
		// header.querySelector("h1").style.marginLeft = "84px";
		return;
	}

	let banner_actual_height 	= banner.offsetHeight;
	let banner_calc_height 		= (window.innerWidth / 1500) * 500;
	let banner_height 			= Math.min(banner_calc_height, banner_actual_height);
	let navbar_height 			= navbar.offsetHeight;

	if ( e.target.scrollingElement.scrollTop > banner_height - navbar_height ) {
		header.querySelector("img").style.margin = "30px 0 -34px 0";
		header.querySelector("img").classList.remove("border");
		header.querySelector("img").style.height = "64px";
		// header.querySelector("h1").style.marginLeft = "84px";
	} else {
		header.querySelector("img").style.margin = "clamp(0px, 3vw, 0.6em) 0 max(-140px, -14vw) 0";
		header.querySelector("img").classList.add("border");
		header.querySelector("img").style.height = "min(170px, 14vw)";
		// header.querySelector("h1").style.marginLeft = "min(190px, calc(22vw + 15px))";
	}

	// do parallax effect on banner if the banner is taller than 500px
	if (banner_calc_height > banner_actual_height) {
		if ( e.target.scrollingElement.scrollTop < 500 ) {
			let offset_dis = config.banner_pos_y * 0.75;
			let scroll_dis = 100 - offset_dis;

			// add easing to accelerate the parallax effect as the user scrolls, maxing out at 100.
			let offset_pos = Math.min(100, (Math.pow(e.target.scrollingElement.scrollTop, 2) / 250000) + (scroll_dis * (e.target.scrollingElement.scrollTop / 500)) + offset_dis);
			banner.getElementsByTagName("img")[0].style.objectPosition = `50% ${offset_pos}%`;
		} 
	} else {
		banner.getElementsByTagName("img")[0].style.objectPosition = `50% ${config.banner_pos_y}%`;
	}

	if (e.target.scrollingElement.scrollTop > banner_height - 20) {
		banner.classList.add("position-sticky");
		banner.classList.remove("top-0");
		banner.style.top = `-${banner_height - 20}px`;
		navbar.style.top = `20px`;
	} else {
		banner.classList.remove("position-sticky");
		banner.classList.add("top-0");
		banner.style.top = "";
		navbar.style.top = "";
	}
}

/**
 * Handle video playback on scrolling away from the video
 * 
 * @returns {void}
 */
function handleVideoPastView() {
	// Get any videos that are currently playing
	let playing_videos = document.querySelectorAll("video[playing]");
	
	// Check if the videos are in view or within 1.5x the viewport height of the viewport above or below the current scroll position
	playing_videos.forEach(function(video) {
		let video_rect = video.getBoundingClientRect();
		let video_top = video_rect.top;
		let video_bottom = video_rect.bottom;

		let viewport_bound = window.innerHeight * 2;

		if (video_top > viewport_bound || video_bottom < 0) {
			video.pause();
		}
	});
}

/**
 * Attach the handleScroll function to the window's scroll event with a debounce
 * 
 * @returns {void}
 */
function attachScrollHandler() {
	window.addEventListener("scroll", throttle(handleScroll, 5, {leading: true, trailing: true}));
	window.addEventListener("scroll", throttle(handleVideoPastView, 1000, {leading: false, trailing: true}));
	window.addEventListener("scroll", throttle(displayMoreTweets, 1000, {leading: true, trailing: true}));
}

/**
 * Fix the sidebar height padding based on the height of the header and footer
 * //TODO: Refactor this at some point, it was only a quick fix.
 * 
 * @param {Event} e - The bs.breakpoint event
 * 
 * @returns {void}
 */
function handleSidebarHeight(e) {
	console.log( 'handleSidebarHeight', e.breakpoint );
	let sidebar = document.querySelector(".sidebar");

	if ( ["xSmall", "small", "medium"].includes(e.breakpoint) ) {
		sidebar.style.setProperty("--v_padding", "0px");
		return;
	}

	let header 	= document.querySelector(".user-head");
	let footer 	= document.querySelector("footer");

	let header_height = header.offsetHeight;
	let footer_height = footer.offsetHeight;

	let vertical_padding = header_height + footer_height + 20;

	sidebar.style.setProperty("--v_padding", `${vertical_padding}px`);
}

/**
 * Attach the handleSidebarHeight function to the bs.breakpoint events
 * 
 * @returns {void}
 */
function attachBreakpointHandlers() {
	requestIdleCallback(function() {
		$(window).on("init.bs.breakpoint", handleSidebarHeight);
		$(window).on("new.bs.breakpoint", handleSidebarHeight);
		bsBreakpoints.init();
	});
}

/**
 * Handle video play
 * 
 * @returns {void}
 */
function handleVideoPlay( video ) {
	video.setAttribute("playing", "");
}

/**
 * Handle video pause
 * 
 * @returns {void}
 */
function handleVideoPause( video ) {
	video.removeAttribute("playing");
}

/**
 * Attach the handleVideoPlay function to all videos
 * 
 * @returns {void}
 */
function attachVideoPlayHandler() {
	let videos = document.querySelectorAll("video");

	videos.forEach(function(video) {
		video.addEventListener("play", function() {
			// console.log( this, this.paused );
			handleVideoPlay( this );
		});
		video.addEventListener("pause", function() {
			// console.log( this, this.paused );
			handleVideoPause( this );
		});
	});
}

/**
 * Handle picture tag sources when a picture fails to load (e.g. 404)
 * 
 * @returns {void}
 */
function handlePictureError( picture ) {
	if (picture.naturalWidth <= 1) {
		let srcs = picture.parentNode.querySelectorAll('source'); 

		if ( srcs.length === 0 ) { // If no more sources remain, log an error 
			console.error("No sources found for picture element", picture);

			// // Replace the picture element with a Media 404 message
			// // TODO: figure out a way to do this only for tweet media.
			// let media_404 = `
			// 	<div class="card media-404 m-3">
			// 		<div class="card-body">
			// 			<p class="card-text text-muted">
			// 				<i class="fa-solid fa-circle-exclamation fa-flip-vertical"></i>
			// 				This media failed to load, sorry.
			// 			</p>
			// 			<p class="card-text text-muted ps-4">
			// 				You can try viewing this tweet on Twitter or on the Wayback Machine using the links in the tweet's header.
			// 			</p>
			// 		</div>
			// 	</div>`;

			return;
		}

		console.debug(
			"%cRemoving failed source", 
			"color: #ff0; font-weight: bold;",
			media_replacements[picture.dataset.url]
		);

		let next_src = srcs[1]?.srcset || picture.src;
		let media_replacement = media_replacements[picture.dataset.url];
		media_replacement.resolved_url = next_src;

		console.log( picture.dataset.url, media_replacement);

		setMediaReplacements(picture.dataset.url, media_replacement);
		
		// Remove the failed source
		srcs[0].remove();
	}
}

/**
 * Handle navigation change events (what to do when the hash changes, or is set on page load)
 * 
 * @returns {void}
 */
function handleNavHashChange( e = null ) {
	// Get the hash from the URL
	let hash = window.location.hash;
	let back_button = document.querySelector("button#back");

	console.log(hash);

	// If the hash is empty, continue as if the hash is "#tweets"
	if ( hash === "" ) {
		hash = "#tweets";
	}

	/**
	 * Function to navigate to a tweet using the tweet's ID property, or to a single tweet view page if the tweet is not on the page
	 * 
	 * @param {string} hash - The hash to navigate to
	 * 
	 * @returns {void}
	 */
	function navToTweet( hash, initial = false ) {
		// Get the tweet ID from the hash (formatted as "#username/status/tweet_id")
		let tweet_id 		= hash.split("/")[2];
		let linked_tweet 	= tweets_object['tweets'][tweet_id];
		let conversation 	= [ linked_tweet ];
		let loop 			= "tweet_single";

		// Check if the linked_tweet exists
		if ( linked_tweet === undefined || linked_tweet === null ) {
			// // Embed the tweet
			// embedTweet( tweet_id, loop );  // TODO: Implement this function
			// return;

			// Until the embedTweet function is implemented, just set it to an empty array
			$.observable(tweets_object).setProperty( 'tweet_single', [] );

			// Render the tweet
			if ( initial ) {
				displayTweets({"tweets": tweets_object, "loop": 'tweet_single', "offset": 0, "limit": 0/*, "tweet_offset": tweet_offset*/});
			} else {
				switchTweetLoop('tweet_single', {"force": true, "offset": 0, "limit": 0/*, "tweet_offset": tweet_offset*/});
			}

			return;
		}

		// Check if the conversation_id_str property exists
		if ( linked_tweet.conversation_id_str !== undefined && linked_tweet.conversation_id_str !== null ) {
			if ( linked_tweet.conversation_id_str === tweet_id ) { // Check if the linked tweet is the first tweet in the conversation
				if ( linked_tweet.replies !== undefined && linked_tweet.replies !== null ) { // Check if the linked tweet has a "replies" property
					// Get the conversation
					conversation = linked_tweet.replies;
					// Add the linked tweet to the conversation if it's not already in the conversation
					if ( !conversation.includes( linked_tweet ) ) {
						conversation.unshift( linked_tweet );
					}
				} 
			} else if ( tweets_object['tweets'][linked_tweet.conversation_id_str] !== undefined ) { // Check if the conversation exists in the tweets object
				let original_tweet = tweets_object['tweets'][linked_tweet.conversation_id_str];
				if ( original_tweet.replies !== undefined && original_tweet.replies !== null ) { // Check if the conversation has a "replies" property
					// Get the conversation
					conversation = original_tweet.replies;
				}

				// Remove the original and linked tweet from the conversation
				conversation = conversation.filter( function(tweet) {
					return tweet.id_str !== tweet_id && tweet.id_str !== original_tweet.id_str;
				});

				conversation = [ original_tweet, linked_tweet ].concat( conversation );
			}

			// Check if the conversation is empty
			if ( conversation.length > 0 ) {
				// If the conversation is empty, set the loop to "tweet_single"
				loop = "tweet_thread";
			}
		}

		// Put the conversation in the tweets_object
		$.observable(tweets_object).setProperty( loop, conversation);

		// Get the relevant users for the tweet(s)
		let users_relevant = {};
		let users_order = 0;
		tweets_object[loop].forEach(function(linked_tweet) {
			if ( users_relevant[linked_tweet.user_id_str] === undefined ) {	// If the user is already in the users_relevant object
				users_relevant[linked_tweet.user_id_str] = tweets_object['users'][linked_tweet.user_id_str];
				users_relevant[linked_tweet.user_id_str]['order'] = users_order;
				users_order++;
			}

			// If the tweet is a quote tweet, add the quoted tweet's user to the users_relevant object
			if (linked_tweet.is_quote_status && linked_tweet.quoted_tweet !== undefined) {
				if ( users_relevant[linked_tweet.quoted_tweet.user_id_str] === undefined ) {	// If the user is already in the users_relevant object
					users_relevant[linked_tweet.quoted_tweet.user_id_str] = tweets_object['users'][linked_tweet.quoted_tweet.user_id_str];
					users_relevant[linked_tweet.quoted_tweet.user_id_str]['order'] = users_order;
					users_order++;
				}
			}

			// If the tweet mentions any users, add them to the users_relevant object
			if (linked_tweet.entities.user_mentions !== undefined) {
				linked_tweet.entities.user_mentions.forEach(function(user_mention) {
					if ( users_relevant[user_mention.id_str] !== undefined ) return;	// If the user is already in the users_relevant object, return
					if ( tweets_object['users'][user_mention.id_str] === undefined ) return;	// If the user is not in the users object, return
					users_relevant[user_mention.id_str] = tweets_object['users'][user_mention.id_str];
					users_relevant[user_mention.id_str]['order'] = users_order;
					users_order++;
				});
			}
		});

		// Change the relevant users object to an array and sort them by the users_order property.
		users_relevant = Object.values(users_relevant).sort(function(a, b) {
			return a.order - b.order;
		});

		// Replace the users_relevant object on the tweets_object.current_loop object
		$.observable(tweets_object['current_loop']).setProperty("users_relevant", users_relevant);

		// Set the content title
		tweets_object['current_loop'].title = "Archived Thread";

		// Render the tweet
		if ( initial ) {
			displayTweets({"tweets": tweets_object, "loop": loop, "offset": 0, "limit": 5/*, "tweet_offset": tweet_offset*/});
		} else {
			switchTweetLoop(loop, {"force": true, "offset": 0, "limit": 5/*, "tweet_offset": tweet_offset*/});
		}

		// Change the sidebar toggle icon
		document.querySelector("#sidebar-filter-toggle").style.display = "none";
		document.querySelector("#sidebar-thread-toggle").style.display = "inline";

		// If there is a page to go back to, show the back button
		if (window.history.length > 1) {
			back_button.classList.remove("d-none");
		} else {
			back_button.classList.add("d-none");
		}

		scrollToHash();
	}

	// If the function is not called from the hashchange event, it's on a page load, so we need to check if the hash is a tweet ID or a search query
	if (e === null) {
		// If the hash is a tweet ID, display only that tweet
		if ( hash.includes("status") ) {
			// Set the base URL as the first history state
			window.history.replaceState(null, "", window.location.href.split("#")[0]);
			// Now add the current hash to the history after the base URL
			window.history.pushState({}, "", hash);

			navToTweet( hash, true );
			return;
		}

		// If the hash starts with "#search=", search for the query
		if ( hash.startsWith("#search=") ) {
			let query = hash.substring(8);
			let search_results = searchTweets(query, true);
	
			// If there are no search results, remove the hash and return
			if (search_results.length === 0) {
				window.location.hash = "";
				return;
			}
	
			// If there is a page to go back to, show the back button
			if (window.history.length > 1) {
				back_button.classList.remove("d-none");
			} else {
				back_button.classList.add("d-none");
			}
	
			return;
		}

		// If the hash is empty, continue as if the hash is "#tweets"
		if ( hash === "#" ) {
			hash = "#tweets";
		}
	} else {
		// If the tweet is not on the page, use navToTweet to display it
		if ( hash.includes("status") ) {
			let tweet_path = hash.substring(1);
			let tweet = document.getElementById(tweet_path);
	
			if (tweet === null) {
				navToTweet( hash );
				return;
			}
		}
	}
			
	// If hash matches one of the navigation items in the navHash object, set the active navigation item
	if ( Object.keys(navHash).includes(hash) ) {
		back_button.classList.add("d-none");

		//If the current function is not called from the hashchange event, it's on a page load, so we need to pass the 'true' to the navHash function so it can do an initial displayTweets call.
		let initial = (e === null);
		navHash[hash](initial);

		// Change the sidebar toggle icon
		document.querySelector("#sidebar-thread-toggle").style.display = "none";
		document.querySelector("#sidebar-filter-toggle").style.display = "inline";
	}

	// If the hash matches a tweet's ID property, scroll to the tweet
	if ( hash.includes("status") ) {
		// scrollToHash();
		navToTweet( hash );		// Testing with more paginated navigation
	}

	// If there are no other matches for the hashes, return
	return;
}


/**
 * Attach the handleNavigationChange function to the window's hashchange event
 * 
 * @returns {void}
 */
function attachNavHashHandler() {
	window.addEventListener("hashchange", handleNavHashChange);
}

/**
 * Handle sort order changes
 * 
 * @param {object} e - The event object for the select element change event
 * 
 * @returns {void}
 */
function handleSortChange( e ) {
	let sort = e.target.value;

	// Check if the sort order is different from the current sort order
	if (sort === config.sort) {
		return;
	}

	// Set the sort order in the current_loop object
	tweets_object['current_loop'].sort = sort;

	// Order the tweets by date if the sort order is "newest"
	let current_loop = tweets_object['current_loop'].name;
	switch (sort) {
		case "newest":
			tweets_object[current_loop] = tweets_object[current_loop].sort(function(a, b) {
				return new Date(b.created_at) - new Date(a.created_at);
			});
			break;
		case "oldest":
			tweets_object[current_loop] = tweets_object[current_loop].sort(function(a, b) {
				return new Date(a.created_at) - new Date(b.created_at);
			});
			break;
		case "random":
			tweets_object[current_loop] = tweets_object[current_loop].sort(function(a, b) {
				return 0.5 - Math.random();
			});
			break;
	}

	// Display the tweets
	switchTweetLoop( tweets_object['current_loop'].name, { "force": true } );
}

	

/**
 * Get the # value of a URL and scroll to it on the page if it exists
 * 
 * @returns {void}
 */
function scrollToHash() {
	if (window.location.hash === "") {
		return;
	}

	// Wait for the content to load
	requestIdleCallback(function() {
		let hash = window.location.hash.substring(1);
		let tweet = document.getElementById(hash);
		let offset = 30;

		if (tweet === null) {
			return;
		}

		// Remove the highlight from any other tweets first
		document.querySelectorAll(".border-3.border-warning").forEach(function(tweet) {
			tweet.classList.remove("border-3", "border-warning");
		});

		// Add a class to the tweet to highlight it
		tweet.getElementsByTagName('div')[0].classList.add("border-3", "border-warning");

		scrollToTweet(tweet, offset);
		requestIdleCallback(handleScroll);
	});
}

/**
 * Scroll to a given tweet
 * 
 * @param {object} tweet - The tweet to scroll to
 */
function scrollToTweet(tweet, offset = 0) {
	let banner_height = document.querySelector(".user-banner").offsetHeight;
	let tweet_offset = tweet.offsetTop + banner_height - offset;

	window.scrollTo({
		top: tweet_offset,
		behavior: "instant",
	});
}

/****
 * utility functions
 */

/**
 * _.js throttle function
 * @source https://underscorejs.org/docs/modules/throttle.html
 */
function throttle(func, wait, options) {
	var timeout, context, args, result;
	var previous = 0;
	if (!options) options = {};

	var later = function() {
		previous = options.leading === false ? 0 : new Date().getTime();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};

	var throttled = function() {
		var _now = new Date().getTime();
		if (!previous && options.leading === false) previous = _now;
		var remaining = wait - (_now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = _now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};

	throttled.cancel = function() {
		clearTimeout(timeout);
		previous = 0;
		timeout = context = args = null;
	};

	return throttled;
}

/**
 * _.js Debounce function
 * @source https://underscorejs.org/docs/modules/debounce.html
 */
function debounce(func, wait, immediate) {
	var timeout, previous, args, result, context;

	var later = function() {
		var passed = new Date().getTime() - previous;
		if (wait > passed) {
			timeout = setTimeout(later, wait - passed);
		} else {
			timeout = null;
			if (!immediate) result = func.apply(context, args);
			if (!timeout) args = context = null;
		}
	};

	var debounced = restArguments(function(_args) {
		context = this;
		args = _args;
		previous = new Date().getTime();
		if (!timeout) {
			timeout = setTimeout(later, wait);
			if (immediate) result = func.apply(context, args);
		}
		return result;
	});

	debounced.cancel = function() {
		clearTimeout(timeout);
		timeout = args = context = null;
	};

	return debounced;
}

/**
 * _.js restArguments function
 * @source https://underscorejs.org/docs/modules/restArguments.html
 */
function restArguments(func, startIndex) {
	startIndex = startIndex == null ? func.length - 1 : +startIndex;
	return function() {
		var length = Math.max(arguments.length - startIndex, 0),
			rest = Array(length),
			index = 0;
		for (; index < length; index++) {
			rest[index] = arguments[index + startIndex];
		}
		switch (startIndex) {
			case 0: return func.call(this, rest);
			case 1: return func.call(this, arguments[0], rest);
			case 2: return func.call(this, arguments[0], arguments[1], rest);
		}
		var args = Array(startIndex + 1);
		for (index = 0; index < startIndex; index++) {
			args[index] = arguments[index];
		}
		args[startIndex] = rest;
		return func.apply(this, args);
	};
}

/**
 * Parse emojis
 * @desc A function to simplify Twemoji.parse() usage and fix a CDN issue
 * 
 * @param {HTML | text} content - The content to parse emojis in.
 * @param {object} params - Optional additional parameters if needed.
 * @param {object} params.prop - Additional properties to pass on to the Twemoji.parse() function.
 * @param {object} params.attr - Additional attributes to pass on to the Twemoji.parse() function.
 * 
 * @return {HTML} parsed_content - The original content with emojis parsed to HTML images of the twemojis.
 */
function parseEmojis(content, params = {'prop': {}, 'attr': {}}) {
    let parsed_content = content;
    params = ( typeof params == 'object' ) ? params : {'prop': {}, 'attr': {}};
    let properties = ( typeof params.prop == 'object' ) ? params.prop : {};
    let attributes = ( typeof params.attr == 'object' ) ? params.attr : {};
    
    let default_properties = {
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    }
    properties = Object.assign(properties, default_properties);
    
    let default_attributes = {
        'loading': 'lazy',
        'style': 'height:1.1em;width:1.1em;vertical-align:-0.2em;margin:0 0.1em;',
    }
    attributes = Object.assign(default_attributes, attributes);
    
    if( typeof properties.attributes == 'function' ) {
        attributes = Object.assign(properties.attributes(), attributes);
    }
    
    properties.attributes = function() {
        return attributes;
    }
    
    parsed_content = twemoji.parse(content, properties);

    return parsed_content;
}

// Run the init() function when the page loads
window.onload = init;