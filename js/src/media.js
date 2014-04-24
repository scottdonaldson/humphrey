Humphrey.checkIfFileExists = function(file, callback) {
	Humphrey.S3.getObject({
		Key: 'media/' + file.name
	}, function(err, data) {

		var newFile = file;

		// file exists
		if (data) {
			alert('File already exists. Are you sure you want to overwrite it?');
		}
		// console.log(file);
		callback(newFile);
	});
};

Humphrey.addMedia = function(file) {

	// file must have a type
	if (!!file.type) {
		Humphrey.checkIfFileExists(file, Humphrey.uploadMedia);
	}
};

Humphrey.uploadMedia = function(file) {
	Humphrey.S3.putObject({
		Key: 'media/' + file.name,
		ContentType: file.type,
		Body: file,
		ACL: 'public-read'
	}, noop);
}