Humphrey.DOM.notifications = document.getElementById('notifications');

window.noop = function(){};

Humphrey.UTILS.slugify = function(string) {
	return string.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().replace(/--+/g, '-');
};

Humphrey.UTILS.notify = function(message, add) {
	if ( add === true) {
		Humphrey.DOM.notifications.innerHTML += ' ' + message;
	} else {
		Humphrey.DOM.notifications.innerHTML = message;
	}
};

Humphrey.UTILS.formatDate = function(date) {
	
	var formattedDate,
		minutes = date.getMinutes().toString().length === 1 ? '0' + date.getMinutes().toString() : date.getMinutes(),
		ampm;

	ampm = date.getHours() - 12 < 0 ? 'AM' : 'PM';

	formattedDate = date.getHours() % 12 + ':' + minutes + ' ' + ampm + ', ' + (date.getMonth() + 1) + '/' + date.getDate() + ', ' + date.getFullYear();

	return formattedDate;
};

Humphrey.UTILS.stripWhiteSpace = function(string) {
	string = string.replace(/(^\s+|\s+$)/g,' ');
	return string;
};