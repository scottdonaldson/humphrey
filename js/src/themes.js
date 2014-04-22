Humphrey.DOM.themes = document.getElementById('themes');
Humphrey.DOM.themeHeader = document.getElementById('theme-header');
Humphrey.DOM.themeFooter = document.getElementById('theme-footer');
Humphrey.DOM.updateThemeButton = document.getElementById('update-theme');

// d is shortcut to Humphrey.DOM
(function(d){

	Humphrey.loadThemes = function() {

		Humphrey.S3.listObjects({ Prefix: 'admin/themes/' }, function(err, data) {

			for (var i = 0; i < data.Contents.length; i++) {
				
				var item = data.Contents[i];

				// Only get folders within the admin/themes/ folder
				if ( item.Size === 0 && item.Key !== 'admin/themes/' ) {
					
					Humphrey.S3.getObject({
						Bucket: Humphrey.BUCKET,
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

			Humphrey.setActiveTheme();
			d.updateThemeButton.addEventListener('click', Humphrey.updateTheme);
		});
	};

	Humphrey.setActiveTheme = function() {

		d.themes.value = Humphrey.SITE.activeTheme;

		var activeThemeHeader,
			activeThemeFooter;

		Humphrey.S3.getObject({
			Bucket: Humphrey.BUCKET,
			Key: 'admin/themes/' + Humphrey.SITE.activeTheme + '/header.html'
		}, function(err, data) {
			Humphrey.SITE.activeThemeHeader = data.Body.toString();
			d.themeHeader.innerHTML = Humphrey.SITE.activeThemeHeader;
		});

		Humphrey.S3.getObject({
			Bucket: Humphrey.BUCKET,
			Key: 'admin/themes/' + Humphrey.SITE.activeTheme + '/footer.html'
		}, function(err, data) {
			Humphrey.SITE.activeThemeFooter = data.Body.toString();
			d.themeFooter.innerHTML = Humphrey.SITE.activeThemeFooter;
		});
	};

	Humphrey.switchTheme = function() {
		var theme = d.themes.value;
	};

	Humphrey.stageTheme = function() {
		console.log('updating SITE active theme header/footer');
		Humphrey.SITE.activeThemeHeader = d.themeHeader.value;
		Humphrey.SITE.activeThemeFooter = d.themeFooter.value;

		console.log(Humphrey.SITE.activeThemeHeader);
	};

	Humphrey.updateTheme = function() {

		var header = Humphrey.SITE.activeThemeHeader,
			footer = Humphrey.SITE.activeThemeFooter;

		// Update theme
		var params = {
			Body: header,
			ContentType: 'text/html',
			Key: 'admin/themes/' + Humphrey.SITE.activeTheme + '/header.html'
		};

		// Update header
		Humphrey.S3.putObject(params, function(){});

		// Update params for footer and update footer
		params.Body = footer;
		params.Key = 'admin/themes/' + Humphrey.SITE.activeTheme + '/footer.html';
		Humphrey.S3.putObject(params, function(){});

		Humphrey.UTILS.notify('Updating theme: ' + Humphrey.SITE.activeTheme + '.');

		// Update all posts
		Humphrey.S3.listObjects({ Prefix: 'posts/' }, function(err, data) {

			for (var i = 0; i < data.Contents.length; i++) {
				
				var item = data.Contents[i];

				// Ignore posts/ directory (Size 0)
				if ( item.Size > 0 ) {

					Humphrey.S3.getObject({
						Bucket: Humphrey.BUCKET,
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

							Humphrey.UTILS.notify('Updating post: ' + title + '.', true);

							params = {
								Body: header + content + footer,
								ContentType: 'text/html',
								Key: 'site/' + slug + '/index.html'
							};
							Humphrey.S3.putObject(params, function(){});
						}
					});
				}
			}
		});
	};

	d.themeHeader.addEventListener('change', Humphrey.stageTheme);
	d.themeFooter.addEventListener('change', Humphrey.stageTheme);

})(Humphrey.DOM);