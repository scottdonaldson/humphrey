// Google tries to log in twice? So make sure it only happens ONCE!
window.loginToGoogle = function(response) {

	if ( !response.error && response.status.signed_in ) {

		Humphrey.hideLoginButton();

		AWS.config.credentials = new AWS.WebIdentityCredentials({
			RoleArn: Humphrey.ROLEARN, 
			WebIdentityToken: response.id_token
		});

		Humphrey.S3 = new AWS.S3({params: {Bucket: Humphrey.BUCKET}});

		Humphrey.initialize();

	}
}

Humphrey.hideLoginButton = function(){
	document.getElementById('login-container').style.display = 'none';
}

// called on successful login
Humphrey.initialize = function() {

	Humphrey.getSiteConfig(function(){
		Humphrey.loadThemes();
		Humphrey.loadPosts();
	});
}

Humphrey.getSiteConfig = function(callback) {

	Humphrey.S3.getObject({
		Bucket: Humphrey.BUCKET,
		Key: 'admin/site.json'
	}, function(err, data) {

		Humphrey.SITE = JSON.parse(data.Body.toString());

		callback();
	});
}