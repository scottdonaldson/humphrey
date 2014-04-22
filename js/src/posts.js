Humphrey.DOM.posts = document.getElementById('posts');
Humphrey.DOM.title = document.getElementById('title');
Humphrey.DOM.textarea = document.getElementById('data');
Humphrey.DOM.button = document.getElementById('upload-button');

(function(d){

	var ACTIVE_KEY = false;

	Humphrey.loadPosts = function() {

		Humphrey.S3.listObjects({ Prefix: 'posts/' }, function(err, data) {

			if (!data.Contents) data.Contents = [];

			data.Contents.forEach(function(item){

				var key = item.Key;

				// Ignore posts/ directory (Size 0)
				if ( item.Size > 0 ) {
					Humphrey.S3.getObject({
						Bucket: Humphrey.BUCKET,
						Key: key
					}, function(err, data) {
						if (err) console.log(err);
						if (data) {
							var file = JSON.parse(data.Body.toString()),
								slug = key.replace(/^posts\/|.json$/g, ''),
								option = new Option(file.title, slug);

							d.posts.appendChild(option);
						}
					});
				}
			});

			d.posts.addEventListener('change', Humphrey.updateView);
			d.button.addEventListener('click', Humphrey.updatePost);
		});
	}

	Humphrey.updateView = function() {

		// this refers to the <select> element.
		Humphrey.SITE.activePost = this.value;

		Humphrey.S3.getObject({
			Bucket: Humphrey.BUCKET,
			Key: 'posts/' + Humphrey.SITE.activePost + '.json'
		}, function(err, data) {
			if ( err ) console.log(err);
			if ( data ) {
				var file = JSON.parse(data.Body.toString()),
					date = new Date(file.updated);

				title.value = file.title;
				d.textarea.innerHTML = file.content;

				Humphrey.UTILS.notify('Last updated: ' + Humphrey.UTILS.formatDate(date));
			}
		});
	}

	Humphrey.updatePost = function() {
		Humphrey.UTILS.notify('');

		var content = d.textarea.value;

		// If there is no ACTIVE_KEY, assume we are creating a new post
		Humphrey.SITE.activePost = 
			!Humphrey.SITE.activePost ? 
				Humphrey.UTILS.slugify(title.value) : 
				Humphrey.SITE.activePost;

		// Update data
		var params = { 
			Key: 'posts/' + Humphrey.SITE.activePost + '.json',
			Body: JSON.stringify({ 
				content: content,
				title: title.value,
				updated: new Date()
			})
		};

		Humphrey.S3.putObject(params, function (err, data) {
			Humphrey.UTILS.notify(err ? 'DATA ERROR!' : 'DATA SAVED.', true);
		});

		// Update live post
		var header = Humphrey.SITE.activeThemeHeader,
			footer = Humphrey.SITE.activeThemeFooter;

		var filterData = { 
			title: title.value,
			date: Humphrey.UTILS.formatDate(new Date())
		};

		// Set title
		header = Humphrey.filterContent(header, filterData);
		content = Humphrey.filterContent(content, filterData);
		footer = Humphrey.filterContent(footer, filterData);

		params = {
			Body: header + content + footer,
			ContentType: 'text/html',
			Key: 'site/' + Humphrey.SITE.activePost + '/index.html'
		};

		Humphrey.S3.putObject(params, function (err, data) {
			Humphrey.UTILS.notify(err ? 'POST ERROR!' : 'POST SAVED.', true);
		});
	}

})(Humphrey.DOM);