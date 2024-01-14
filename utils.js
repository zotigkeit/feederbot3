const { foodList, colors } = require('./foods.js')

const FB = {
	dayLength: 24*60*60*1000, // hours*minutes*seconds*milliseconds
	hourLength: 60*60*1000, //minutes*seconds*milliseconds
	minuteLength: 60*1000, //Minute length, seconds*milliseconds

	caloriesPerDay: 2000, //number of calories expended per day
	caloriesPerPound: 3500, //number of calories to equal one pound

	baseWeight: 100, //the base amount added to every weight calculation
	minPounds: 85, //Establishes minimum pounds you are able to be

	timeFatigueFactor: 1.10, //1.1 //the fatigue multiplier for eating multiple of the same food within 24 hours (stacks multiplicatively)
	longTimeFatigueFactor: 1.10, // " within 1 week
	repeatFatigueFactor: 1.40, //1.2 //the fatigue multiplier for eating two of the same food in a row (does not stack)

	hibernationFactor: 0.80, //the calories/day multiplier for going a day without eating (stacks asymptotically)
	voracityFactor: 0.10, //the proportion of wait time prevented by size (per 100 lbs) 

	bellyRubPower: 0.15, //the proportion of wait time removed by belly-rubbing
	bellyRubDelay: 2.0, //the number of minutes of wait time between belly rubs
	
	happyHourInterval: 24*60*60*1000*5 + 60*60*1000*19, // the interval across which Happy Hour recurs.
	happyHourLength: 60*60*1000, // how long Happy Hour lasts
	happyHourCalorieFactor: 2.0, // calorie multi for Happy Hour
	
	supersizeCooldownInterval: 16*60*60*1000, //16*60*60*1000 // base cooldown for /supersize command
	
	// color codes for command-line output
	black: '\x1b[30;1m',
	red: '\x1b[31;1m',
	green: '\x1b[32;1m',
	yellow: '\x1b[33;1m',
	blue: '\x1b[34;1m',
	magenta: '\x1b[35;1m',
	cyan: '\x1b[36;1m',
	white: '\x1b[37;1m',
	reset: '\x1b[0m',
	
	altNamesForRandom: ['random', 'randon', 'rando', 'ramdom', 'raandom', 'ramdp,', 'ranodm', 'eandom'],
}

module.exports = {
	millisToTimeString: function(millis) {
		if (millis > FB.dayLength * 4) {
			return Math.ceil(millis / FB.dayLength).toLocaleString('en') + ' days'
		} else if (millis > FB.hourLength * 4) {
			return Math.ceil(millis / FB.hourLength) + ' hours'
		} else if (millis > FB.minuteLength * 4) {
			return Math.ceil(millis / FB.minuteLength) + ' minutes'
		} else if (millis > 1000) {
			return Math.ceil(millis / 1000) + ' seconds'
		} else {
			return Math.ceil(millis / 100) / 10 + ' second'
		}
	},
	millisToDHMS: function(millis) {
		return (millis >= FB.dayLength ? Math.floor(millis / FB.dayLength) + ':' : '  ') + (millis >= FB.hourLength ? String(Math.floor(millis % FB.dayLength / FB.hourLength)).padStart(2, '0') + ':' : '   ') + (millis >= FB.minuteLength ? String(Math.floor(millis % FB.hourLength / FB.minuteLength)).padStart(2, '0') + ':' : '   ') + (millis >= 1000 ? String(Math.floor(millis % FB.minuteLength / 1000)).padStart(2, '0') : '  ') + '.' + String(Math.floor(millis % 1000)).padStart(3, '0')
	},
	applyAbsenceEffects: function(userFileContent) {
		var calorieOffset = userFileContent['calorieOffset'] || 0
		var daysSinceJoin = Math.round((Date.now() - userFileContent['dateMade']) / FB.dayLength + 1) || 1
		var daysWithoutEating = Math.max(0, (Date.now() - (userFileContent['latestMealTime'] || Date.now())) / FB.dayLength)
		
		var totalPounds = (FB.baseWeight + (userFileContent['totalCalories'] + calorieOffset - (daysSinceJoin * FB.caloriesPerDay)) / FB.caloriesPerPound) || FB.baseWeight
		
		if (totalPounds < FB.minPounds) { // apply minimum weight check
			userFileContent['calorieOffset'] = calorieOffset + (FB.minPounds - totalPounds) * FB.caloriesPerPound; // increase user's calorie offset to raise their weight to the minimum
		}
		
		// lessens calorie burn for days gone without eating
		userFileContent['calorieOffset'] = calorieOffset + FB.caloriesPerDay * (daysWithoutEating - Math.pow(FB.hibernationFactor, daysWithoutEating) / Math.log(FB.hibernationFactor) + 1 / Math.log(FB.hibernationFactor))
					
		// update supersize power if over threshold	
		var supersizeFactor = userFileContent['supersizeFactor'] || 1
		var daysSinceSupersize = Math.min((Date.now() - userFileContent['latestSupersizeUpdate'] || 0) / FB.dayLength, 30)
		if (daysSinceSupersize >= 2) {
			userFileContent['supersizeFactor'] = userFileContent['supersizeFactor'] || 1
			userFileContent['supersizeFactor'] /= Math.pow(2, Math.floor(daysSinceSupersize - 1)) // halve for each day
			userFileContent['supersizeFactor'] = Math.max(userFileContent['supersizeFactor'], 1)
			userFileContent['latestSupersizeUpdate'] += daysSinceSupersize * FB.dayLength // no longer penalize for already-passed days
		}
		return userFileContent
	},
	strToCanonFood: function(str) {
		str = str.toLowerCase().split(' ').join('_')
		depth = 0
		if (!foodList[str])
		{
			return { food: null, name: null }
		}
		while (foodList[str].aliasTarget)
		{
			if (depth > 10)
			{
				console.log('\x1b[35;40;1m%s\x1b[0m', 'exceed recurse limit on resolve: ' + str)
				return { food: null, name: null }
			}
			str = foodList[str].aliasTarget
			depth = depth + 1
		}
		return { food: foodList[str], name: str }
	},
	FB: FB,
}
