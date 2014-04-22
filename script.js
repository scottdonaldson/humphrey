(function() {

	// Set config variables
	var appId = '782262582204-j2jaiu9p6tojqgepuke9g8oi8q8bcngl.apps.googleusercontent.com',
		roleArn = 'arn:aws:iam::915587082874:role/GoogleAuth';
	AWS.config.region = 'us-east-1';

	var bucketName = 'static-test-1',
		bucket = null;

	var themes = document.getElementById('themes'),
		themeHeader = document.getElementById('theme-header'),
		themeFooter = document.getElementById('theme-footer'),
		updateThemeButton = document.getElementById('update-theme'),
		posts = document.getElementById('posts'),
		title = document.getElementById('title'),
		textarea = document.getElementById('data'),
		button = document.getElementById('upload-button'),
		results = document.getElementById('results');

	function addGoogleMetas() {
		var googleMetas = {
			'google-signin-clientid': '782262582204-j2jaiu9p6tojqgepuke9g8oi8q8bcngl.apps.googleusercontent.com',
			'google-signin-scope': 'https://www.googleapis.com/auth/plus.login',
			'google-signin-requestvisibleactions': 'http://schemas.google.com/AddActivity',
			'google-signin-cookiepolicy': 'single_host_origin',
			'google-signin-callback': 'loginToGoogle'
		};
		for (var name in googleMetas) {
			var meta = document.createElement('meta');
			meta.setAttribute('name', name);
			meta.setAttribute('content', googleMetas[name]);
			document.head.appendChild(meta);
		}
	}

	// Google tries to log in twice? So make sure it only happens ONCE!
	var ONCE = false;

	window.loginToGoogle = function(response) {

		if ( !ONCE ) {

			if ( !response.error ) {

				AWS.config.credentials = new AWS.WebIdentityCredentials({
					RoleArn: roleArn, 
					WebIdentityToken: response.id_token
				});

				bucket = new AWS.S3({params: {Bucket: bucketName}});

				initialize();

			} else {
				console.log('There was a problem logging you in.');
			}

			if ( response.status.signed_in === true ) {
				console.log('hiding button');	
				setTimeout(function(){
					document.getElementById('login').style.display = 'none';
				}, 1000);
				
			}
		}

		ONCE = true;
	}

	function initialize() {

		getSiteConfig();

		loadThemes();
		createPostList();

		button.addEventListener('click', updatePost);
		updateThemeButton.addEventListener('click', updateTheme);
	}

	var CONFIG = false,
		ACTIVE_KEY = false;

	function getSiteConfig() {

		bucket.getObject({
			Bucket: bucketName,
			Key: 'admin/site.json'
		}, function(err, data) {

			CONFIG = JSON.parse(data.Body.toString());
			console.log(CONFIG);

		});
	}

	function loadThemes() {

		bucket.listObjects({ Prefix: 'admin/themes/' }, function(err, data) {

			for (var i = 0; i < data.Contents.length; i++) {
				
				var item = data.Contents[i];

				// Only get folders within the admin/themes/ folder
				if ( item.Size === 0 && item.Key !== 'admin/themes/' ) {
					
					bucket.getObject({
						Bucket: bucketName,
						Key: item.Key + 'style.css'
					}, function(err, data) {

						var contents = data.Body.toString(),
							afterThemeName = contents.slice(contents.indexOf('Theme Name: ') + 'Theme Name: '.length),
							themeName = afterThemeName.slice(0, afterThemeName.indexOf('\n'));
						
						var option = new Option(themeName, item.Key.replace(/^admin\/themes\/|\/style.css/g, ''));
						themes.appendChild(option);
					});
				}
			}
		});

		setActiveTheme();
	}

	function setActiveTheme() {
		if (CONFIG) {
			themes.value = CONFIG.activeTheme;

			var activeThemeHeader,
				activeThemeFooter;

			bucket.getObject({
				Bucket: bucketName,
				Key: 'admin/themes/' + CONFIG.activeTheme + '/header.html'
			}, function(err, data) {
				CONFIG.activeThemeHeader = data.Body.toString();
				themeHeader.innerHTML = CONFIG.activeThemeHeader;
			});

			bucket.getObject({
				Bucket: bucketName,
				Key: 'admin/themes/' + CONFIG.activeTheme + '/footer.html'
			}, function(err, data) {
				CONFIG.activeThemeFooter = data.Body.toString();
				themeFooter.innerHTML = CONFIG.activeThemeFooter;
			});
		} else {
			setTimeout(setActiveTheme, 10);
		}
	}

	function switchTheme() {
		var theme = themes.value;
	}

	function stageTheme() {
		console.log('updating CONFIG active theme header/footer');
		CONFIG.activeThemeHeader = themeHeader.value;
		CONFIG.activeThemeFooter = themeFooter.value;

		console.log(CONFIG.activeThemeHeader);
	}
	themeHeader.addEventListener('change', stageTheme);
	themeFooter.addEventListener('change', stageTheme);

	function updateTheme() {

		console.log('updating ' + CONFIG.activeTheme);

		var header = CONFIG.activeThemeHeader,
			footer = CONFIG.activeThemeFooter;

		// Update theme
		var params = {
			Body: header,
			ContentType: 'text/html',
			Key: 'admin/themes/' + CONFIG.activeTheme + '/header.html'
		};

		// Update header
		bucket.putObject(params, function(){});

		// Update params for footer and update footer
		params.Body = footer;
		params.Key = 'admin/themes/' + CONFIG.activeTheme + '/footer.html';
		bucket.putObject(params, function(){});

		// Update all posts
		bucket.listObjects({ Prefix: 'posts/' }, function(err, data) {

			for (var i = 0; i < data.Contents.length; i++) {
				
				var item = data.Contents[i];

				// Ignore posts/ directory (Size 0)
				if ( item.Size > 0 ) {

					bucket.getObject({
						Bucket: bucketName,
						Key: item.Key
					}, function(err, data) {
						if (err) console.log(err);
						if (data) {
							var file = JSON.parse(data.Body.toString()),
								title = file.title,
								content = file.content,
								slug = item.Key.replace(/^posts\/|.json$/g, '');

							// Set title
							header = header.replace(/{{ title }}/, title);

							params = {
								Body: header + content + footer,
								ContentType: 'text/html',
								Key: 'site/' + slug + '/index.html'
							};
							bucket.putObject(params, function(){});
						}
					});
				}
			}
		});
	}

	function slugify(string) {
		return string.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().replace(/--+/g, '-')
	}

	function createPostList() {

		bucket.listObjects({ Prefix: 'posts/' }, function(err, data) {

			if (!data.Contents) data.Contents = [];

			data.Contents.forEach(function(item){

				var key = item.Key;

				// Ignore posts/ directory (Size 0)
				if ( item.Size > 0 ) {
					bucket.getObject({
						Bucket: bucketName,
						Key: key
					}, function(err, data) {
						if (err) console.log(err);
						if (data) {
							var file = JSON.parse(data.Body.toString()),
								slug = key.replace(/^posts\/|.json$/g, ''),
								option = new Option(file.title, slug);

							posts.appendChild(option);
						}
					});
				}
			});


			posts.addEventListener('change', updateView);

		});
	}

	function updateView() {

		// this refers to the <select> element.
		var key = this.value;
		ACTIVE_KEY = key;
		console.log(ACTIVE_KEY);

		bucket.getObject({
			Bucket: bucketName,
			Key: 'posts/' + key + '.json'
		}, function(err, data) {
			if ( err ) console.log(err);
			if ( data ) {
				var file = JSON.parse(data.Body.toString()),
					date = new Date(file.updated),
					formattedDate,
					ampm;

				title.value = file.title;
				textarea.innerHTML = file.content;

				ampm = date.getHours() - 12 < 0 ? 'AM' : 'PM';

				formattedDate = date.getHours() % 12 + ':' + date.getMinutes() + ' ' + ampm + ', ' + (date.getMonth() + 1) + '/' + date.getDate() + ', ' + date.getFullYear()

				results.innerHTML = 'Last updated: ' + formattedDate;
			}
		});
	}

	function updatePost() {
		results.innerHTML = '';

		var content = textarea.value;

		// If there is no ACTIVE_KEY, assume we are creating a new post
		ACTIVE_KEY = !ACTIVE_KEY ? slugify(title.value) : ACTIVE_KEY;

		// Update data
		var params = { 
			Key: 'posts/' + ACTIVE_KEY + '.json',
			Body: JSON.stringify({ 
				content: content,
				title: title.value,
				updated: new Date()
			})
		};

		bucket.putObject(params, function (err, data) {
			results.innerHTML += err ? ' DATA ERROR!' : ' DATA SAVED.';
		});

		// Update live post
		var header = CONFIG.activeThemeHeader,
			footer = CONFIG.activeThemeFooter;

		// Set title
		header = header.replace(/{{ title }}/, title.value);

		params = {
			Body: header + content + footer,
			ContentType: 'text/html',
			Key: 'site/' + ACTIVE_KEY + '/index.html'
		};

		bucket.putObject(params, function (err, data) {
			results.innerHTML += err ? ' POST ERROR!' : ' POST SAVED.';
		});
	}

	addGoogleMetas();

})();