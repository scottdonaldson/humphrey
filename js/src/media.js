Humphrey.DOM.newMedia = document.getElementById('add-media');
Humphrey.DOM.addMediaButton = document.getElementById('add-media-button');
Humphrey.DOM.library = document.getElementById('media-library');

(function(d){

Humphrey.loadMedia = function(year, month) {

	var date = new Date();
	if (!year) year = date.getFullYear().toString();
	if (!month) month = (date.getMonth() + 1).toString();
	if ( month - 10 < 0 ) { month = '0' + month; }

	Humphrey.S3.listObjects({
		Bucket: Humphrey.BUCKET,
		Prefix: 'media/' + year + '/' + month
	}, function(err, data) {
		if (err) console.log(err);
		if (data) {
			if (!data.Contents) data.Contents = [];

			data.Contents.forEach(function(item){
				if (item.Size > 0) {
					var img = new Image();
					img.src = Humphrey.URL + '/' + item.Key;
					d.library.appendChild(img);
				}
			});

			if (month === '12') {
				Humphrey.getObject({
					Key: 'media/' + (year - 1)
				}, function(err, data) {
					if (err) console.log(err);
					if (data) {

					}
				});
			} else {
				Humphrey.loadMedia({

				});
			}
		} else {
			Humphrey.loadMedia({

			});
		}
	});
};

Humphrey.checkIfFileExists = function(file, callback) {
	Humphrey.S3.getObject({
		Key: 'media/' + file.name
	}, function(err, data) {

		// file exists
		if (data) {
			alert('File already exists. Are you sure you want to overwrite it?');
		}
		// console.log(file);
		callback(file);
	});
};

Humphrey.addMedia = function(file) {

	// file must have a type
	if (!!file.type) {
		Humphrey.checkIfFileExists(file, Humphrey.uploadMedia);
	}
};

Humphrey.uploadMedia = function(file) {
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth() + 1;
	if ( month - 10 < 0 ) month = '0' + month.toString();

	Humphrey.S3.putObject({
		Key: 'media/' + year + '/' + month + '/' + file.name,
		ContentType: file.type,
		Body: file,
		ACL: 'public-read'
	}, noop);
};

})(Humphrey.DOM);