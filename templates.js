
$.templates("user-banner", `
	{{tweet_image profile_banner_url "Banner" ~classes="img-fluid w-100" ~style="min-height:20px;max-height: 500px;transition:max-height 0.5s ease-out;object-fit: cover;object-position: 50% 80%;" /}}
`);

$.templates("user-head", `
	{{tweet_image profile_image_url_https name + " " + screen_name ~classes="d-none d-sm-block rounded-circle translate-middle-y border border-5 border-dark-subtle bg-body-secondary" ~classes_container="d-none d-sm-inline embed-responsive-item me-3" ~style="height:min(170px, 14vw);aspect-ratio:1/1;transition:height 0.15s ease-in-out;margin-bottom:max(-140px, -14vw);margin-top:clamp(0px, 3vw, 0.6em);" /}}
	<h1 class="col-3 position-relative fs-2 mb-0 pb-1 overflow-hidden" style="text-overflow: ellipsis;flex: 1;">
		{{:name}}
		<span class="d-block fs-5 text-muted overflow-hidden" style="text-overflow:ellipsis;">
			@{{:screen_name}}
		</span>
	</h1>
`);

$.templates("user-bio", `
	<!-- Bio Template -->
	<div class="row">
		<div class="col-sm-12 col-lg-8">
			<p class="bio-text">
				{{bio_content description /}}
			</p>
			<div class="bio-details row row-cols-auto text-muted">
				<div>
					<p class="mb-2 mb-md-3" title="Location">
						<i class="fas fa-map-marker-alt me-1"></i> {{tweet_emoji location /}}
					</p>
				</div>
				<div>
					<p class="mb-2 mb-md-3" title="Website">
						<i class="fas fa-link me-1"></i> <a href="{{:entities.url.urls[0].expanded_url}}" target="_blank" class="text-decoration-none">{{:entities.url.urls[0].display_url}}</a>
					</p>
				</div>
				<div>
					<p class="mb-2 mb-md-3" title="The date the account was created">
						<i class="fa fa-calendar me-1" aria-hidden="true"></i> Joined {{format_date created_at ~format="short" /}}
					</p>
				</div>
			</div>
			<div class="bio-stats row row-cols-auto text-muted">
				<div>
					<p class="mb-2 mb-md-3" title="The number of followers of this account (as of the time of archiving)">
						<span class="fw-bold">
							{{format_number friends_count /}}
						</span> <span class="text-muted">Following</span>
					</p>
				</div>
				<div>
					<p class="mb-2 mb-md-3" title="The number of accounts this account is following (as of the time of archiving)">
						<span class="fw-bold">
							{{format_number followers_count /}}
						</span> <span class="text-muted">Followers</span>
					</p>
				</div>
			</div>
		</div>
	</div>
`);

$.templates("tweet-list", `
	<!-- Tweet List Template -->
	{^{if ~root["current_tweets"]?.length > 0}}
		<div class="col-lg-4 sidebar order-last">
			<div class="offcanvas-lg border-0 offcanvas-end h-100" tabindex="-1" id="offcanvasFilters" aria-labelledby="offcanvasFiltersLabel">
				<div class="offcanvas-header bg-body-tertiary border-bottom shadow" style="height:84px;/*margin-bottom:calc(-8.5em + 1em);*/">
					<button type="button" class="btn-close h-100 px-4" data-bs-dismiss="offcanvas" data-bs-target="#offcanvasFilters" aria-label="Close"></button>
				</div>
				<div class="offcanvas-body h-100 pt-3 pt-sm-4 pt-md-5 pt-lg-0 pb-2 pb-lg-0 d-flex d-lg-block flex-column">
					<div class="sticky-lg-top w-100 d-grid flex-fill flex-column" style="top:8.5em;height:calc(100vh - 200px);grid-auto-rows:auto 1fr;">
						{^{if ~list_views.includes(~root["current_loop"].name)}}
							<div class="card mb-3 sticky-top w-100" style="min-height:-webkit-fill-available;">
								<div class="card-header">
									<h5 id="offcanvasFiltersLabel">
										Filters
									</h5>
								</div>
								<div class="card-body" style="max-height:calc(75vh - 180px);overflow-y:auto;">
									<div class="mb-3">
										<label for="sort-order" class="form-label">Sort Order</label>
										<select class="form-select" id="sort-order" data-link="{:~sort_order:}" disabled>
											<option value="newest">Newest First</option>
											<option value="oldest">Oldest First</option>
										</select>
									</div>
									{^{if ~root["current_loop"].name != "favorites"}}
										<div class="mb-3">
											<label for="filter-favorites" class="form-label" title="Filter tweets that you have favorited">
												Favorites
											</label>
											<select class="form-select" id="filter-favorites" data-link="{:~favorites:}" title="Tweets that you have favorited">
												<option value="all" title="Show all tweets, including favorites">
													All Tweets
												</option>
												<option value="favorites" title="Only show tweets that you have favorited">
													Only Favorites
												</option>
											</select>
										</div>
									{{/if}}
									{^{if ~root["current_loop"].name != "user_media"}}
										<div class="mb-3">
											<label for="filter-media" class="form-label" title="Filter tweets that contain media (images, videos, etc.)">
												Media
											</label>
											<select class="form-select" id="filter-media" data-link="{:~media:}" title="Tweets that contain media (images, videos, etc.)">
												<option value="all" title="Show all tweets, including media">
													All Tweets
												</option>
												<option value="media" title="Only show tweets that contain media">
													Only Media
												</option>
												<option value="no_media" title="Hide tweets that contain media">
													No Media
												</option>
											</select>
										</div>
									{{/if}}
									<div class="mb-3">
										<label for="filter-replies" class="form-label" title="Filter tweets that are replies to other tweets">
											Replies
										</label>
										<select class="form-select" id="filter-replies" data-link="{:~replies:}" title="Tweets that are replies to other tweets">
											<option value="all" title="Show all tweets, including replies">
												All Tweets
											</option>
											<option value="replies" title="Only show tweets that are replies to other tweets">
												Only Replies
											</option>
											<option value="no_replies" title="Hide tweets that are replies to other tweets">
												No Replies
											</option>
										</select>
									</div>
									<div class="mb-3">
										<label for="filter-retweets" class="form-label" title="Filter retweets">
											Retweets
										</label>
										<select class="form-select" id="filter-retweets" data-link="{:~retweets:}">
											<option value="all" title="Show all tweets, including retweets">
												All Tweets
											</option>
											<option value="retweets" title="Only show retweets">
												Only Retweets
											</option>
											<option value="no_retweets" title="Hide retweets">
												No Retweets
											</option>
										</select>
									</div>
									{{if ~root["current_loop"].date_cutoff_toggle_option != false}}
										<div class="mb-3">
											<div class="form-check form-switch">
												<input class="form-check-input" type="checkbox" role="switch" id="date-cutoff" data-link="{:~date_cutoff_toggle:}" title="Filter tweets that were posted before {{format_date ~root["current_loop"].date_cutoff ~format="short" /}}">
												<label class="form-check-label" for="date-cutoff">
													{^{if ~date_cutoff_toggle}}
														Excluding past 
													{{else}}
														Including past
													{{/if}}
													<span class="d-none d-xl-inline">
														{{format_date ~root["current_loop"].date_cutoff ~format="short" /}}
													</span>
													<span class="d-inline d-xl-none">
														{{format_date ~root["current_loop"].date_cutoff ~format="tiny" /}}
													</span>
												</label>
											</div>
										</div>
									{{/if}}
								</div>
								{^{if ~root["current_loop"].name == "favorites"}}
									<div class="card-body border-top border-bottom bg-body-tertiary py-2">
										<h5>More</h5>
									</div>
									<div class="card-body">
										<div class="mb-3">
											<label for="export-favorites" class="form-label">Export Favorites</label>
											<button class="btn btn-primary w-100" id="export-favorites" onclick="exportFavorites();">
												<i class="fa-solid fa-download"></i>
												Export Favorites
											</button>
										</div>
										<div class="mb-3">
											<label for="import-favorites" class="form-label">Import Favorites</label>
											<button class="btn btn-primary w-100" id="import-favorites" onclick="importFavorites();">
												<i class="fa-solid fa-upload"></i>
												Import Favorites
											</button>
										</div>
									</div>
								{{/if}}
							</div>
						{{else}}
							{{if ~root["current_loop"].date_cutoff_toggle_option != false && ~root["current_tweets"][0].created_at <= ~root["current_loop"].date_cutoff}}
								<div class="card mb-3 w-100" style="height:fit-content;">
									<div class="card-header">
										<h5>Filters</h5>
									</div>
									<div class="card-body">
										<div class="mb-3">
											<div class="form-check form-switch">
												<input class="form-check-input" type="checkbox" role="switch" id="date-cutoff" data-link="{:~date_cutoff_toggle:}" title="Filter tweets that were posted before {{format_date ~root["current_loop"].date_cutoff ~format="short" /}}">
												<label class="form-check-label" for="date-cutoff">
													{^{if ~date_cutoff_toggle}}
														Excluding past 
													{{else}}
														Including past
													{{/if}}
													<span class="d-none d-xl-inline">
														{{format_date ~root["current_loop"].date_cutoff ~format="short" /}}
													</span>
													<span class="d-inline d-xl-none">
														{{format_date ~root["current_loop"].date_cutoff ~format="tiny" /}}
													</span>
												</label>
											</div>
										</div>
									</div>
								</div>
							{{/if}}
							<div class="card mb-3 w-100" style="min-height:-webkit-fill-available;">
								<div class="card-header">
									<h5 id="offcanvasFiltersLabel">
										Relevant Users
									</h5>
								</div>
								<div class="card-body" style="max-height:calc(75vh - 180px);overflow-y:auto;">
									{{if ~root['current_loop'].users_relevant}}
										{^{for ~root['current_loop'].users_relevant}}
												
											{^{user_popover id_str ~tag_name="div" ~classes="mb-3" ~is_user=true}}
												<a href="{{:url_path}}" target="_blank" class="text-decoration-none">
													{{useravatar_img id_str ~classes="me-3 rounded-circle bg-body float-start" ~style="height:48px;width:48px;max-height:48px;max-width:48px;" /}}
												</a>
												<h6 class="fs-5 mb-0 overflow-hidden fw-medium" style="text-overflow:ellipsis;white-space:nowrap;">
													{{tweet_emoji name /}}
													<sub class="screen-name d-block lh-1 pb-2 fst-italic fw-normal text-muted">
														@{{:screen_name}}
													</sub>
												</h6>
											{{/user_popover}}
										{{/for}}
									{{/if}}
								</div>
							</div>
						{{/if}}
						<div class="card mb-3 w-100" style="height:fit-content;">
							<div class="card-header">
								<h5 id="offcanvasFiltersLabel">
									Options
								</h5>
							</div>
							<div class="card-body">
								<div class="mb-3">
									<h6>
										Theme
									</h6>
									<!-- 3 way toggle switch for light, auto, and dark themes -->
									<div class="form-group d-flex">
										<label class="form-check-label me-2" for="theme_toggle_light">
											<i class="fa-solid fa-sun"></i>
										</label>
										{^{if ~config.theme=='auto'}}
											<input class="form-check-input rounded-start-pill border-end-0 bg-primary border-primary" type="radio" name="theme_toggle" id="theme_toggle_light" value="light" title="Light Theme" data-link="{:~config.theme:}">
											<input class="form-check-input rounded-0 border-start-0 border-end-0 bg-primary border-primary" type="radio" name="theme_toggle" id="theme_toggle_auto" value="auto" title="Auto Theme" data-link="{:~config.theme:}">
											<input class="form-check-input rounded-end-pill border-start-0 bg-primary border-primary" type="radio" name="theme_toggle" id="theme_toggle_dark" value="dark" title="Dark Theme" data-link="{:~config.theme:}">
										{{else}}
											<input 	class="form-check-input rounded-start-pill border-end-0 bg-dark-subtle border" type="radio" name="theme_toggle" id="theme_toggle_light" value="light" title="Light Theme" data-link="{:~config.theme:}">
											<input class="form-check-input rounded-0 border-start-0 border-end-0 bg-dark-subtle border" type="radio" name="theme_toggle" id="theme_toggle_auto" value="auto" title="Auto Theme" data-link="{:~config.theme:}">
											<input class="form-check-input rounded-end-pill border-start-0 bg-dark-subtle border" type="radio" name="theme_toggle" id="theme_toggle_dark" value="dark" title="Dark Theme" data-link="{:~config.theme:}">
										{{/if}}
										<label class="form-check-label ms-2" for="theme_toggle_dark">
											<i class="fa-solid fa-moon"></i>
										</label>
										<span class="ms-3">
											{^{:~config.theme}}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-sm-12 col-lg-8 tweets-list px-0 px-sm-3">
			<!-- This is where the tweets will be rendered -->
			{^{for ~root["current_tweets"] ~replies ~retweets}}
				{^{if id_str}}
					{^{if ~retweets == "all" || (~retweets == "retweets" && retweeting_user != undefined) || (~retweets == "no_retweets" && retweeting_user == undefined) || ~root["current_loop"].name == "tweet_thread" || ~root["current_loop"].name == "tweet_single"}}
					{^{if ~replies == "all" || (~replies == "replies" && in_reply_to_status_id_str != null) || (~replies == "no_replies" && in_reply_to_status_id_str == null) || ~root["current_loop"].name == "tweet_thread" || ~root["current_loop"].name == "tweet_single"}}
					{^{if ~media == "all" || (~media == "media" && extended_entities) || (~media == "no_media" && !extended_entities) || ~root["current_loop"].name == "tweet_thread" || ~root["current_loop"].name == "tweet_single"}}
					{^{if ~favorites == "all" || (~favorites == "favorites" && favorited == true)}}
					{^{if ~date_cutoff_toggle == false  || (~date_cutoff_toggle == true && created_at < ~root["current_loop"].date_cutoff)}}
						{^{if user #data ^tmpl="tweet"}}
							{^{else #data ^tmpl="404" ~message="Could not load this tweet"}}
						{{/if}}
					{{/if}}
					{{/if}}
					{{/if}}
					{{/if}}
					{{/if}}
				{{/if}}
			{{/for}}
			{^{if ~root["current_tweets"].length == 0 tmpl="404" }}
				{^{else tmpl="tweet-list-end" }}
			{{/if}}
		</div>
	{{else}}
		<div class="col-sm-12 col-lg-8 tweets-list">
			{{include tmpl="404" /}}
		</div>
	{{/if}}
`);

// $.templates("media-gallery-list", `
// 	<!-- Media Gallery View Template -->
// 	{{for ~root["current_tweets"] reverse=true}}
// 		{{if !retweeted_status_result}}
// 			{{include tmpl="media-item" /}}
// 		{{/if}}
// 	{{/for}}
// `);

$.templates("404", `
	<div class="col-12 mb-3">
		<div class="card">
			<div class="card-body">
				<p class="card-text text-muted">
					<i class="fa-solid fa-circle-exclamation fa-flip-vertical"></i>
					{{if message}}
						{{:message}} <!-- {{:~root["current_loop"].name}} - {{:id_str}} -->
					{{else}}
						No tweets found.
					{{/if}}
				</p>
			</div>
		</div>
	</div>
`);

// $.templates("tweet-list-more", `
// 	<div class="col-12 mb-3">
// 		<button class="btn btn-primary w-100" id="load-more" onclick="load_more();">
// 			<i class="fa-solid fa-circle-arrow-down"></i>
// 			Load More
// 		</button>
// 	</div>
// `);

$.templates("tweet-list-end", `
	<div class="col-12 mb-3">
		<div class="card tweet-list-loading">
			<div class="card-body">
				<p class="card-text text-muted">
					<i class="fa-solid fa-spinner fa-spin"></i>
					Loading more tweets...
				</p>
			</div>
		</div>
		<div class="card tweet-list-end d-none">
			<div class="card-body">
				<p class="card-text text-muted">
					<i class="fa-solid fa-circle-exclamation fa-flip-vertical"></i>
					No more tweets to load.
				</p>
			</div>
		</div>
		<div class="card tweet-list-empty d-none">
			<div class="card-body">
				<p class="card-text text-muted">
					<i class="fa-solid fa-circle-exclamation fa-flip-vertical"></i>
					No tweets found! Try changing the filters or go back to the <a href="#" class="text-decoration-none">main</a> page.
				</p>
			</div>
		</div>
	</div>
`);

$.templates("tweet", `
	<!-- Tweet Template -->
		{{if retweeting_user != undefined}}
			<div class="col-12 mb-3 pt-4" data-id="{{:id_str}}" id="{{:user.screen_name}}/status/{{:id_str}}" style="scroll-margin-top: 120px">
		{{else}}
			<div class="col-12 mb-3" data-id="{{:id_str}}" id="{{:user.screen_name}}/status/{{:id_str}}" style="scroll-margin-top: 120px">
		{{/if}}
			<div class="card tweet" id="tweet-{{:id_str}}">

				{^{include #data tmpl="tweet-header" /}}

				<div class="card-body py-0 px-2 px-sm-3">
					<div class="card-text tweet-content">
						{{tweet_content id_str full_text /}}
					</div>
				</div>

				{{if card?.name}}
					{{if card.name.indexOf("poll") != -1}}
						{{include tmpl="tweet-poll" /}}
					{{/if}}
				{{/if}}

				{{if entities.urls[0] || extended_entities}}
					{{include tmpl="tweet-media" /}}
				{{/if}}

				{{if quoted_tweet && quoted_tweet.user}}
					<div class="card-body tweet-quoted px-1 px-sm-3">
						<div class="card tweet" id="tweet-{{:quoted_tweet.id_str}}">
							{{include tmpl="tweet-header" quoted_tweet /}}
							<div class="card-body tweet-content py-0 px-2 px-sm-3">
								{{tweet_content quoted_status_id_str quoted_tweet.full_text /}}
							</div>
							{{if quoted_tweet.entities.urls[0] || quoted_tweet.extended_entities}}
								{{include tmpl="tweet-media" quoted_tweet ~classes="rounded-bottom" /}}
							{{/if}}
						</div>
					</div>
				{{else is_quote_status == true}} {{!-- Quoted Tweet is deleted or missing so we show a placeholder --}}
					<div class="card-body tweet-quoted px-1 px-sm-3">
						<div class="card tweet" id="tweet-{{:quoted_status_id_str}}">
							<div class="card-body tweet-content px-2 px-sm-3">
								<p class="text-muted m-0">
									<i class="fas fa-exclamation-triangle me-2"></i>
									Quoted Tweet is missing or deleted.
								</p>
							</div>
						</div>
					</div>
				{{/if}}

				<div class="card-footer tweet-stats row row-cols-auto mx-0 px-1">
					<span class="tweet-stat" style="line-height: 1.8em;">
						<i class="fa-solid fa-comment fa-flip-horizontal"></i> 
						{{format_number reply_count /}}
					</span>
					<span class="tweet-stat" style="line-height: 1.8em;">
						<i class="fa-solid fa-retweet"></i>
						{{format_number retweet_count /}} 
						{{if quote_count != 0}}
							<span class="text-muted ms-1">
								(<i class="fa-solid fa-quote-left"></i>
								{{format_number quote_count /}})
							</span>
						{{/if}}
					</span>
					<span class="tweet-stat" style="line-height: 1.8em;">
						<i class="fa-solid fa-heart"></i> 
						{{format_number favorite_count /}}
					</span>
					{{if bookmark_count && bookmark_count > 0}}
						<span class="tweet-stat" style="line-height: 1.8em;">
							<i class="fa-solid fa-bookmark"></i> 
							{{format_number bookmark_count /}}
						</span>
					{{/if}}
					

					{{if ~root["favorites"]}}
						<div class="favorite_tweet d-flex flex-grow-1 justify-content-end ps-0">
							{^{if favorited}}
								<button class="btn btn-icon d-flex" onclick="favorite_tweet('{{:id_str}}', false);" title="Unfavorite this tweet">
									<i class="fa-solid fa-star"></i>
								</button>
							{{else}}
								<button class="btn btn-icon d-flex" onclick="favorite_tweet('{{:id_str}}', true);" title="Favorite this tweet">
									<i class="far fa-star"></i>
								</button>
							{{/if}}
						</div>
					{{/if}}
				</div>
			</div>
		</div>
`);

$.templates("tweet-header", `
	<!-- Tweet Header Template -->
	<div class="card-header tweet-header bg-body-tertiary rounded-top">
		<div class="tweet-profile-picture">
		</div>
		{^{user_popover user.id_str ~tag_name="div" ~classes="tweet-profile-name" ~style="width:fit-content;"}}
			<a href="{{:user.url_path}}" target="_blank" class="text-decoration-none text-dark float-start ">
				{{useravatar_img user_id_str ~classes="me-3 rounded-circle bg-body" ~style="height:48px;width:48px;max-height:48px;max-width:48px;" /}}
			</a>
			<h4 class="d-inline fs-6 fw-bold">
				{{tweet_emoji user.name /}}
			</h4>
			<small class="text-muted fst-italic">
				@{{:user.screen_name}}
			</small>
		{{/user_popover}}
		<div class="tweet-profile-timestamp fs-6">
			<small class="text-muted">
				<a href="#{{:user.screen_name}}/status/{{:id_str}}" class="text-decoration-none" target="_blank" title="Link to this tweet in this archive (new tab)">
					<i class="fa-solid fa-link small me-1"></i>
				</a>
				• 
				<a href="https://twitter.com/{{:user.screen_name}}/status/{{:id_str}}" target="_blank" class="text-decoration-none" title="View on Twitter">
					<i class="fa-brands fa-twitter small mx-1"></i>
				</a>
				<a href="https://web.archive.org/web/https://twitter.com/{{:user.screen_name}}/status/{{:id_str}}" target="_blank" class="text-decoration-none" title="View on the Archive.org Wayback Machine">
					<i class="fa-solid fa-cube small me-1"></i>
				</a>
				• 
				<a href="#{{:user.screen_name}}/status/{{:id_str}}" class="text-decoration-none" title="Link to this tweet in this archive">
					<span class="tweet-timestamp small ms-1">{{format_date created_at ~format="long" /}}</span>
				</a>
			</small>
			
			<div class="tweet-context-links float-end">
				{{if in_reply_to_status_id_str != null}}
					{{if in_reply_to_user_id_str == ~main_user.id_str}}
						<a href="{{orig_url /}}#{{:in_reply_to_screen_name}}/status/{{:in_reply_to_status_id_str}}" class="d-inline-block py-1 px-2 mx-1 small rounded-pill bg-light-subtle text-decoration-none" title="Replying to {{:in_reply_to_screen_name}}">
							<i class="fas fa-reply" style="text-indent:-0.125em;"></i>
							<span class="d-none d-md-inline ms-1">
								{{:in_reply_to_screen_name}}
							</span>
						</a>
					{{else}}
						<a href="https://twitter.com/{{:in_reply_to_screen_name}}/status/{{:in_reply_to_status_id_str}}" target="_blank" class="d-inline-block py-1 px-2 mx-1 small rounded-pill bg-light-subtle text-decoration-none" title="Replying to {{:in_reply_to_screen_name}}">
							<i class="fas fa-reply" style="text-indent:-0.125em;"></i>
							<span class="d-none d-md-inline ms-1">
								{{:in_reply_to_screen_name}}
							</span>
						</a>
					{{/if}}
				{{/if}}

				{{if is_quote_status == true && quoted_tweet}}
					{{if quoted_status_permalink}}
						{{if quoted_tweet.user}}
							<a href="{{:quoted_tweet.url_path}}" target="_blank" class="d-inline-block py-1 px-2 mx-1 small rounded-pill bg-light-subtle text-decoration-none" title="Quoting tweet by {{:quoted_tweet.user.screen_name}}">
								<i class="fa-solid fa-quote-right"></i>
								<span class="d-none d-md-inline ms-1">
									{{:quoted_tweet.user.screen_name}}
								</span>
							</a>
						{{else}}
							<a href="{{:quoted_status_permalink.expanded}}" target="_blank" class="d-inline-block py-1 px-2 mx-1 small rounded-pill bg-light-subtle text-decoration-none" title="Quoting tweet: {{:quoted_status_permalink.display}}">
								<i class="fa-solid fa-quote-right"></i>
							</a>
						{{/if}}
					{{else}}
						<a href="https://twitter.com/placeholder/status/{{:quoted_status_id_str}}" target="_blank" class="d-inline-block py-1 px-2 mx-1 small rounded-pill bg-light-subtle text-decoration-none">
							<i class="fas fa-retweet me-1"></i>
							Quoted Tweet
						</a>
					{{/if}}
				{{/if}}
			</div>
		</div>
		{{if retweeting_user != undefined}}
			<div class="tweet-retweet-credit position-absolute bottom-100 ps-3 py-2">
				<small class="text-muted">
					<i class="fa-solid fa-retweet me-2"></i>
					Retweeted by <a href="{{:retweeting_user.url_path}}" target="_blank" class="text-decoration-none">
						{{tweet_emoji retweeting_user.name /}}
					</a>
				</small>
			</div>
		{{/if}}
	</div>
`);

$.templates("tweet-poll", `
	<!-- Tweet poll Templates -->
	{{if card.name}}
		<div class="card-body">
			{{tweet_poll_counter id_str /}}
			{{if card.name.indexOf('poll2') != -1 || card.name.indexOf('poll3') != -1 || card.name.indexOf('poll4') != -1}}
				{{include tmpl="tweet-poll-choice" ~choice=card.binding_values.choice1_label.string_value ~count=card.binding_values.choice1_count.string_value /}}
				{{include tmpl="tweet-poll-choice" ~choice=card.binding_values.choice2_label.string_value ~count=card.binding_values.choice2_count.string_value /}}
			{{/if}}
			{{if card.name.indexOf('poll3') != -1 || card.name.indexOf('poll4') != -1}}
				{{include tmpl="tweet-poll-choice" ~choice=card.binding_values.choice3_label.string_value ~count=card.binding_values.choice3_count.string_value /}}
			{{/if}}
			{{if card.name.indexOf('poll4') != -1}}
				{{include tmpl="tweet-poll-choice" ~choice=card.binding_values.choice4_label.string_value ~count=card.binding_values.choice4_count.string_value /}}
			{{/if}}
		</div>
	{{/if}}
`);

$.templates("tweet-poll-choice", `
	<!-- Tweet Poll Choice Template -->
	<div class="d-flex mb-3">
		<div class="progress" role="progressbar" aria-label="{{:~choice}} - {{:~count}} votes" aria-valuenow="{{tweet_poll_percentage id_str ~count /}}" aria-valuemin="0" aria-valuemax="100" style="width:calc(100% - 18ch);height:30px">
			<div class="progress-bar overflow-visible ps-3 text-start fs-6" style="width: {{tweet_poll_percentage id_str ~count /}}%">
				{{:~choice}}
			</div>
		</div>
		<div class="flex-grow-1 text-end">
			{{:~count}} votes
		</div>
	</div>
`);

$.templates("tweet-media", `
	<!-- Tweet Media Templates -->
	{{if extended_entities?.media}}
		<div class="card-body p-0 fs-6 d-flex flex-nowrap bg-dark-subtle {{:~classes}}" style="min-height:16em;max-height:60vh">
			{{for extended_entities.media ~id=id_str ~media_entities=extended_entities.media}}

				<!-- Tweet Media Photo -->
				{{if type == "photo"}}
					<div class="photo position-relative flex-fill" style="width: -webkit-fill-available;">
						{{tweet_image media_url_https alt_text ~classes=~classes + " img-fluid w-100 h-100"  ~crop=true /}}
						
						<!-- modal open with full image -->
						<div class="modal fade" id="imageModal-{{:~id}}-{{:media_key}}" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-xl" style="max-width:calc(100% - var(--bs-modal-margin) * 2);max-height:calc(100vh - 100px);">
								<div class="modal-content w-auto mx-auto">
									<div class="modal-body p-0">
										{{tweet_image media_url_https alt_text ~classes="rounded-top img-fluid w-100" ~style="max-height:calc(100vh - 175px);" /}}
									</div>
									<div class="modal-footer">
										<a href="{{:media_url_https}}" class="me-4 p-2" target="_blank">
											<i class="fa-brands fa-twitter me-1"></i>
										</a>
										<a href="{{media_url media_url_https /}}" download="{{media_url media_url_https /}}" class="btn btn-primary me-1">
											<i class="fa-solid fa-download"></i>
										</a>
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
									</div>
								</div>
							</div>
						</div>
						<!-- end modal -->

						<a href="#" data-bs-toggle="modal" data-bs-target="#imageModal-{{:~id}}-{{:media_key}}" class="stretched-link"></a>
						<!-- <a href="#" data-bs-toggle="modal" data-bs-target="#imageModal-{{:~id}}" onclick="bootstrap.Carousel.getInstance(document.getElementById('imageModal-{{:~id}}')).to({{*: (window.ext_ent >= 0) ? window.ext_ent +=1 :  window.ext_ent = 0 }});" class="stretched-link"></a> -->
					</div>
				{{/if}}

				<!-- Tweet Media Animated GIF -->
				{{if type == "animated_gif"}}
					{{tweet_video video_info.variants ~id #data.id_str ~poster=media_url_https ~classes=~classes + " w-100" ~loop=true /}}
				{{/if}}
				
				<!-- Tweet Media Video -->
				{{if type == "video"}}
					{{tweet_video video_info.variants ~id #data.id_str ~poster=media_url_https ~classes=~classes + " w-100" /}}
				{{/if}}
			{{/for}}
			{{if extended_entities.media[0].type == "photo"}}
				{{include tmpl="tweet-media-modal" ~id=id_str ~media_entities=~media_entities /}}
			{{/if}}
		</div>
	{{else}}
		{{if entities}}
			<div class="card-body p-0 fs-6 position-relative">
				{{if entities.media}}
					{{for entities.media}}
						<img class="img-fluid" src="{{:media_url_https}}" alt="{{:display_url}}" loading="lazy" />
					{{/for}}
				{{else}}
					{{if entities.urls}}
						{{if card ~id=id_str}}
								<div class="card m-3 mt-0 mx-1 mx-sm-3">
									<div class="row g-0 flex-nowrap">
										{{if card.binding_values.thumbnail_image}}
											<div class="border-end" style="width:fit-content;min-height:8em;min-width:110px;max-height:12em;max-width:min(16em, 25%);">
												{{tweet_image card.binding_values.thumbnail_image.image_value.url display_url ~classes="img-fluid rounded-start h-100 object-fit-cover" /}}
											</div>
											<div class="position-relative flex-fill overflow-hidden ">
												<div class="card-body position-absolute lh-1">
										{{else}}
											{{if card.binding_values.player_image_large}}
												<div class="position-relative border-end" style="width:fit-content;min-height:8em;min-width:110px;max-height:12em;max-width:min(16em, 25%);">
													{{tweet_image card.binding_values.player_image_large.image_value.url display_url ~classes="img-fluid rounded-start h-100 object-fit-cover" /}}
													<i class="fa-circle-play fa-regular fs-1 position-absolute start-50 text-white top-50 translate-middle"></i>
												</div>
												<div class="position-relative flex-fill overflow-hidden ">
													<div class="card-body position-absolute lh-1">
											{{else}}
												<div class="col-12">
													<div class="card-body lh-1 pb-4">
											{{/if}}
										{{/if}}
												<h5 class="card-title">
													{{if card.binding_values.title}}
														{{:card.binding_values.title.string_value}}
													{{else}}
														{{:display_url}}
													{{/if}}
												</h5>
												<p class="card-text">
													{{if card.binding_values.description}}
														<small>
															{{:card.binding_values.description.string_value}}
														</small>
													{{/if}}
												</p>
											</div>

											{{if card.binding_values.vanity_url}}
												<p class="card-text position-absolute z-1 bottom-0 mb-0 px-3 py-1 w-100 bg-body-secondary">
													<small class="text-muted">{{:card.binding_values.vanity_url.string_value}}</small>
												</p>
											{{/if}}
										</div>
									</div>
									<a href="{{:entities.urls[entities.urls.length - 1].expanded_url}}" target="_blank" class="stretched-link"></a>
								</div>
						{{else}}
							{{for entities.urls ~id=id_str}}
								{{if display_url.indexOf("i.imgur.com") != -1}}
									<div class="card m-3 mt-0">
										<img class="card-img-top rounded-top" src="{{:expanded_url}}" alt="{{:display_url}}" loading="lazy" />
										<div class="card-body py-1 bg-body-secondary">
											<span class="card-title small">{{:display_url}}</span>
										</div>
										<a href="{{:expanded_url}}" target="_blank" class="stretched-link"></a>
									</div>
								{{else}}
									<!-- <a href="{{:expanded_url}}" target="_blank">{{:display_url}}</a> -->
								{{/if}}
							{{/for}}
						{{/if}}
					{{/if}}
				{{/if}}
			</div>
		{{/if}}
	{{/if}}
`);

$.templates("tweet-media-modal", `
	<!-- modal open with full image -->
	<div class="modal fade" id="imageModal-{{:~id}}" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered modal-xl" style="max-width:calc(100%-var(--bs-modal-margin)*2);max-height:calc(100vh-100px);">
			<div class="modal-content w-auto mx-auto">
				<div class="modal-body p-0">
					
					<div id="imageModal-slider-{{:~id}}" class="carousel slide">
						<div class="carousel-inner">
							{{for #data.extended_entities.media ~id=~id ~index=#data.getIndex}}
								<div class="carousel-item active" id="imageModal-slide-{{:~id}}-{{:media_key}}">
									{{tweet_image media_url_https alt_text ~classes="rounded-top img-fluid w-100" ~style="max-height: calc(100vh - 175px);" /}}
								</div>
							{{/for}}
						</div>
					</div>
					<button class="carousel-control-prev" type="button" data-bs-target="#imageModal-slider-{{:~id}}" data-bs-slide="prev">
						<span class="carousel-control-prev-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Previous</span>
					</button>
					<button class="carousel-control-next" type="button" data-bs-target="#imageModal-slider-{{:~id}}" data-bs-slide="next">
						<span class="carousel-control-next-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Next</span>
					</button>
				</div>
				<div class="modal-footer">
					<a href="{{:media_url_https}}" class="me-4 p-2" target="_blank">
						<i class="fa-brands fa-twitter me-1"></i>
					</a>
					<a href="{{media_url media_url_https /}}" download="{{media_url media_url_https /}}" class="btn btn-primary me-1">
						<i class="fa-solid fa-download"></i>
					</a>
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
	<!-- end modal -->
`);

$.templates("media-item", `
	<!-- Media Gallery Item Template -->

`);