Humphrey.DOM.notifications = document.getElementById('notifications');

Humphrey.UTILS.slugify = function(string) {
	return string.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().replace(/--+/g, '-')
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
		ampm;

	ampm = date.getHours() - 12 < 0 ? 'AM' : 'PM';

	formattedDate = date.getHours() % 12 + ':' + date.getMinutes() + ' ' + ampm + ', ' + (date.getMonth() + 1) + '/' + date.getDate() + ', ' + date.getFullYear();

	return formattedDate;
}