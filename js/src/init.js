var Humphrey = {};

// Set config variables
Humphrey.APPID = '782262582204-j2jaiu9p6tojqgepuke9g8oi8q8bcngl.apps.googleusercontent.com';
Humphrey.ROLEARN = 'arn:aws:iam::915587082874:role/GoogleAuth';
AWS.config.region = 'us-east-1';

Humphrey.BUCKET = 'static-test-1';
Humphrey.S3;

Humphrey.SITE = {};
Humphrey.VIEW = {};
Humphrey.DOM = {};
Humphrey.UTILS = {};

Humphrey.setLoginButtonAttrs = function() {
	document.getElementById('login').setAttribute('data-clientid', Humphrey.APPID);
}

Humphrey.loadGoogleAuth = function(){
	var po = document.createElement('script'); po.async = true;
	po.src = 'https://apis.google.com/js/client:plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
}

Humphrey.setLoginButtonAttrs();
Humphrey.loadGoogleAuth();