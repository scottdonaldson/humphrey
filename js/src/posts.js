Humphrey.DOM.posts = document.getElementById('posts');
Humphrey.DOM.addNewButton = document.getElementById('post-add-new');

Humphrey.DOM.postEditor = document.getElementById('post-editor');
Humphrey.DOM.title = document.getElementById('title');
Humphrey.DOM.textarea = document.getElementById('data');
Humphrey.DOM.file = document.getElementById('file');
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
	};

	Humphrey.showEditor = function() {
		d.postEditor.style.display = 'block';
	};

	Humphrey.clearValues = function() {
		d.posts.value = '';
		d.title.value = '';
		d.textarea.innerHTML = '';
		d.file.value = '';
	};

	Humphrey.updateView = function() {

		Humphrey.showEditor();

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

				d.title.value = file.title;
				d.textarea.innerHTML = file.content;

				Humphrey.UTILS.notify('Last updated: ' + Humphrey.UTILS.formatDate(date));
			}
		});
	};

	Humphrey.updatePostJSON = function() {

		var title = d.title.value,
			slug = Humphrey.UTILS.slugify(title),
			content = d.textarea.value,
			media = d.file.files.length > 0 ? d.file.files[0].name : false;

		// Update data
		var params = { 
			Key: 'posts/' + slug + '.json',
			ContentType: 'application/json',
			Body: JSON.stringify({ 
				content: content,
				title: title,
				media: media,
				updated: new Date()
			})
		};

		Humphrey.S3.putObject(params, function (err, data) {
			Humphrey.UTILS.notify(err ? 'DATA ERROR!' : 'DATA SAVED.', true);
		});
	};

	Humphrey.renderPost = function(data) {

	};

	Humphrey.updatePost = function() {
		Humphrey.UTILS.notify('');

		var content = d.textarea.value;

		// If there is no ACTIVE_KEY, assume we are creating a new post
		var slug = 
			!Humphrey.SITE.activePost ? 
				Humphrey.UTILS.slugify(d.title.value) : 
				Humphrey.SITE.activePost;

		var file = d.file.files ? d.file.files[0] : false;

		if (file) Humphrey.addMedia(file);

		Humphrey.updatePostJSON();

		// Update live post
		var header = Humphrey.SITE.activeThemeHeader,
			footer = Humphrey.SITE.activeThemeFooter;

		var filterData = { 
			title: title.value,
			date: Humphrey.UTILS.formatDate(new Date())
		};

		// Set title
		header = Humphrey.filterContent(Humphrey.SITE.activeTheme.files['header.html'], filterData);
		content = Humphrey.filterContent(content, filterData);
		footer = Humphrey.filterContent(Humphrey.SITE.activeTheme.files['header.html'], filterData);

		params = {
			Body: header + content + footer,
			ContentType: 'text/html',
			Key: 'site/' + slug + '/index.html'
		};

		Humphrey.S3.putObject(params, function (err, data) {
			Humphrey.UTILS.notify(err ? 'POST ERROR!' : 'POST SAVED.', true);
		});
	};

	d.addNewButton.addEventListener('click', function(){
		Humphrey.clearValues();
		Humphrey.showEditor();
	});

})(Humphrey.DOM);