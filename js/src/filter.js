Humphrey.filterContent = function(content, data) {

	// match all content to be replaced

	var matches = content.match(/\{\{[a-z |.]*\}\}/g);
	
	if (!matches) return content;

	matches.forEach(function(match) {
		var original = match;
		match = match.replace('{{', '').replace('}}', '');
		match = Humphrey.UTILS.stripWhiteSpace(match);

		for ( var item in data ) {
			if ( match === item ) {
				content = content.replace(original, data[item]);
			}
		}

	});

	return content;
}

Humphrey.filterContent('Lorem ipsum dolor sit {{ amet }}, consectetur adipisicing elit. Id, officiis, aliquid, in accusantium similique rerum {{repellendus sunt suscipit}} quae assumenda blanditiis laudantium temporibus alias reiciendis laborum voluptas magnam eligendi ipsa.')