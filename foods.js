/*
	~~~ FOOD PROPERTIES ~~~


	FUNCTIONAL PROPERTIES

		aliasTarget (string)
			If specified, redirects to a different food.  For catching alternate
			spellings or dialectical names (e.g. "yogurt" vs "yoghurt").
		
		calories (number, REQUIRED)
			The amount of calories provided by the food.
		
		digestTime (number, REQUIRED)
			The base duration of cooldown (in minutes) to apply to the user.
			This abstractly represents the mass and digestability of the food.


	AESTHETIC PROPERTIES
		
		color (string, REQUIRED)
			The main color of the food, as a hex triplet (#RRGGBB).
			Determines the accent color of the bot message.

		prefix (string, REQUIRED)
			A word or phrase to describe a portion of the food.  For example:
			"an" apple; "some" berries; "a glass of" water
			
		goodName (string)
			The proper name of the food.  For fixing capitalization.
			If not specified, the object's keyname will be shown in lowercase.
			Should NOT alter spelling.  Use aliasTarget for alternate spellings.


	EXTRA PROPERTIES
		
		description (string)
			Flavor text describing the food.  Accepts Discord message formatting.
			Appears when info is requested via /foodcheck
		
		elements (array of strings)
			An array of strings broadly categorizing the food.
			Appears when info is requested via /foodcheck
			Recommended maximum of 2 per food.
		
		wikipedia (string)
			The English Wikipedia article for the food.  For the /wiki command.
			This property is appended to "http://en.wikipedia.org/wiki/" to form
			the URL.
			If not specified, the /wiki command will perform a Wikipedia search
			of the food's name.

		botOnly (bool)
			If true, the food may only be fed to bot users.
			All other commands will behave as if the food does not exist.
			Will NOT appear in /foodcheck
		
		hidden (bool)
			If true, the food may never be selected.
			Provides /foodcheck data for exclusive dev foods such as "debug cake".
			
		weird (bool)
			If true, the food may never appear by random selection.

 */

const colors = {
	red: '#e51616',
	orange: '#e57e16',
	gold: '#e5b116',
	yellow: '#ffd300',
	lime: '#7ee516',
	green: '#16e516',
	mint: '#16e57e',
	cyan: '#16e5e5',
	azure: '#167ee5',
	blue: '#1616e5',
	purple: '#7e16e5',
	pink: '#e516e5',
	magenta: '#e5167e',
	white: '#e5e5e5',
	silver: '#b2b2b2',
	gray: '#7f7f7f',
	black: '#191919',
	brown: '#bf3e13',
	cream: '#ffdab2',
	olive: '#7e6900',
}

module.exports = {
	colors: colors,

	foodList: {
	
		// Example: some basic food definitions
		
		apple_juice: {
			calories: 226,
			prefix: 'some',
			color: colors.gold,
			digestTime: 3,
			elements: ['fruit', 'water'],
			wikipedia: 'Apple juice',
		},
		
		apple_pie: {
			calories: 2370,
			prefix: 'an',
			color: colors.gold,
			digestTime: 51,
			elements: ['sweet', 'fruit'],
			wikipedia: 'Apple pie',
		},
		
		bacon_grease: {
			calories: 1872,
			prefix: 'a cup of',
			color: colors.olive,
			digestTime: 180,
			elements: ['oil'],
			description: 'Was it worth it?',
			wikipedia: 'Grease trap#Brown grease'
		},
		
		// Example: a food with an alternative name.
		
		banana_yoghurt: { aliasTarget: 'banana_yogurt' },
		
		banana_yogurt: {
			calories: 130,
			prefix: 'some',
			color: colors.cream,
			digestTime: 3,
			elements: ['dairy', 'berry'],
			wikipedia: 'Yogurt',
		},
		
		// Example: a food with many alternative names
		
		blackcurrants: {
			calories: 120,
			prefix: 'some',
			color: colors.purple,
			digestTime: 3,
			elements: ['berry'],
			wikipedia: 'Blackcurrant',
		},
		
		blackcurrant: { aliasTarget: 'blackcurrants' },
		black_currants: { aliasTarget: 'blackcurrants' },
		black_currant: { aliasTarget: 'blackcurrants' },
		cassis: { aliasTarget: 'blackcurrants' },
		
		// a food name with unusual capitalization

		blt: {
			calories: 350,
			prefix: 'a',
			color: colors.gold,
			goodName: 'BLT',
			digestTime: 8,
			wikipedia: 'BLT',
		},
		
		// a food with punctuation in its name
		
		'1%_milk': {
			calories: 206,
			prefix: 'a glass of',
			color: colors.white,
			digestTime: 3,
			elements: ['dairy'],
			wikipedia: 'Milk',
		},
		
		// secret bot-exclusive foods

		diesel: { aliasTarget: 'diesel_fuel' },
		
		diesel_fuel: {
			botOnly: true,
			calories: 32196,
			prefix: 'a gallon of',
			color: colors.black,
			digestTime: 75,
		},

		// hidden foods, entirely unselectable

		apology_cake: {
			hidden: true,
			calories: 1000000,
			prefix: 'an',
			color: colors.white,
			elements: ['sweet', 'ETHEREAL'],
			description: 'Sorry your save data got corrupted.',
		},
		
		debug_cake: {
			hidden: true,
			calories: 1000000,
			prefix: 'a',
			color: colors.white,
			elements: ['sweet', 'ETHEREAL'],
			description: 'For honorary bug testers.',
			wikipedia: 'Bug bounty program',
		},
		
		// weird foods, excluded from random selection
		
		paper: {
			weird: true,
			calories: 0.49,
			digestTime: 2,
			prefix: 'a piece of',
			elements: ['paper'],
			color: colors.white,
			wikipedia: 'Paper',
		},

		weed: {
			weird: true,
			calories: 0.49,
			digestTime: 2,
			prefix: 'a',
			color: colors.green,
			description: 'I\'m calling the police.',
			wikipedia: 'Weed',
		},
	}
}