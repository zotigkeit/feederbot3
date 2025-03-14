const fs = require('node:fs')
const path = require('node:path')
const { applyAbsenceEffects, millisToTimeString, formatBigNumber,
FB } = require('./utils.js')

//await interaction.editReply({ embeds: [new EmbedBuilder().setDescription('Pong!')] })
var fileNameIdList = []
var files = fs.readdirSync('userStats/')
files.forEach(file => {
	var filenameId = file.split('.').slice(0, -1).join('.')
	fileNameIdList.push(filenameId)
})

console.log('userId\tdiscordName\tdateMade\ttotalCalories\ttotalPounds\tlevelNum\tprestige')

fileNameIdList.forEach(function(userId) {
	//Defined the file path of the user's json
	var userFilePath = require('path').resolve('userStats', userId + '.json')
		
	//Parses user's JSON for eaten calories
	const userFileContent = applyAbsenceEffects(JSON.parse((fs.readFileSync(userFilePath, 'utf-8').trim())))
	//if (userFileContent['totalCalories'] < 1000000) return
	
	var daysSinceJoin = Math.ceil(Date.now() - userFileContent['dateMade']) / FB.dayLength
	var calorieOffset = userFileContent['calorieOffset'] || 0
	var totalPounds = FB.baseWeight + (userFileContent['totalCalories'] + calorieOffset - (daysSinceJoin * FB.caloriesPerDay)) / FB.caloriesPerPound
	totalPounds = Math.max(totalPounds, FB.minPounds)
	
	//Determines your level num
	if (totalPounds > FB.baseWeight) {
		var levelNum = Math.floor((Math.sqrt(0.8 * (totalPounds - FB.baseWeight) + 1) - 1) / 2)
	} else {
		var levelNum = 0
	}
	
console.log('"' + userId + '"\t' + userFileContent['discordName'] + '\t' + new Date(userFileContent['dateMade']).toISOString() + '\t' + userFileContent['totalCalories'] + '\t' + totalPounds + '\t' + levelNum + '\t' + userFileContent['prestige'] || 0)
})
console.log('audited ' + fileNameIdList.length + ' users')