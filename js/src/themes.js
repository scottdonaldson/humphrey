Humphrey.DOM.siteName = $('#site-name');
Humphrey.DOM.themes = $('#themes');
Humphrey.DOM.updateSiteButton = $('#update-site');

// d is shortcut to Humphrey.DOM
(function(d){

	Humphrey.setSiteConfig = function() {

		Humphrey.setSiteName();
		Humphrey.setActiveTheme();
		Humphrey.loadActiveTheme();

	};

	Humphrey.setSiteName = function() {

		var siteName = !!Humphrey.SITE.siteName ? Humphrey.SITE.siteName : '';
		d.siteName.val( siteName );

		// set event listener to update site name
		d.updateSiteButton.on('click', Humphrey.updateSiteName);

	};

	Humphrey.updateSiteName = function() {

		// update config
		Humphrey.SITE.siteName = d.siteName.val();

		var data = JSON.stringify(Humphrey.SITE);

		Humphrey.S3.putObject({
			Key: 'admin/site.json',
			ContentType: 'application/json',
			Body: data
		}, noop);

	};

	Humphrey.loadThemes = function() {

		Humphrey.S3.listObjects({ Prefix: 'admin/themes/' }, function(err, data) {

			if (!data.Contents) data.Contents = [];

			data.Contents.forEach(function(item) {

				// Only get folders within the admin/themes/ folder
				if ( item.Size === 0 && item.Key !== 'admin/themes/' ) {
					
					Humphrey.S3.getObject({
						Bucket: Humphrey.BUCKET,
						Key: item.Key + 'style.css'
					}, function(err, data) {

						var contents = data.Body.toString(),
							afterThemeName = contents.slice(contents.indexOf('Theme Name: ') + 'Theme Name: '.length),
							themeName = afterThemeName.slice(0, afterThemeName.indexOf('\n'));
						
						var option = $('<option value="' + item.Key.replace('admin/themes/', '').replace('/', '') + '">' + themeName + '</option>');
						d.themes.append( option );
					});
				}
			});

			Humphrey.setActiveTheme();
			d.updateSiteButton.on('click', Humphrey.switchTheme);
		});
	};

	Humphrey.setActiveTheme = function() {

		d.themes.value = Humphrey.SITE.activeTheme.name;

	};

	Humphrey.loadThemeFile = function(file, i, files, callback) {

		Humphrey.S3.getObject({
			Key: file.Key
		}, function(err, data) {
			if (err) console.log(err);
			if (data) {

				var key = file.Key.split('/');
				key = key[key.length - 1];

				if (!Humphrey.SITE.activeTheme.files) Humphrey.SITE.activeTheme.files = {};
				Humphrey.SITE.activeTheme.files[key] = data.Body.toString();

				i++;

				if (files[i]) {
					Humphrey.loadThemeFile( files[i], i, files, callback );
				} else {
					callback();
				}
			}
		});
	};

	Humphrey.loadActiveTheme = function(callback) {

		Humphrey.S3.listObjects({
			Bucket: Humphrey.BUCKET,
			Prefix: 'admin/themes/' + Humphrey.SITE.activeTheme.name + '/'
		}, function(err, data) {
			if (err) console.log(err);
			if (data) {

				if (!data.Contents) data.Contents = [];

				if (data.Contents[1]) {

					Humphrey.loadThemeFile(data.Contents[1], 1, data.Contents, noop);
				}

				if (callback) callback(Humphrey.activeThemeFiles);
			}
		});

	};

	Humphrey.switchTheme = function() {
		var theme = d.themes.value;

		// update config
		Humphrey.SITE.activeTheme.name = d.themes.value;

		var data = JSON.stringify(Humphrey.SITE);
		console.log('switching theme. new site data:', data);

		Humphrey.S3.putObject({
			Key: 'admin/site.json',
			ContentType: 'application/json',
			Body: data
		}, noop);
	};

})(Humphrey.DOM);