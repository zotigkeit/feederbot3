const { foodList, colors } = require('./foods.js')
const fs = require('node:fs')
const path = require('node:path')
const { EmbedBuilder } = require('discord.js')
const { strToCanonFood, millisToTimeString, applyAbsenceEffects, millisToDHMS, FB } = require('./utils.js')
const { clientId } = require('./config.json')
const { promisify } = require('node:util')
const fs_exists_async = promisify(fs.exists)
	
module.exports = {
	feed: async (interaction) =>
	{
		var targetUser = interaction.options.getUser('user') ?? interaction.user
		var sentFood = interaction.options.getString('food').toLowerCase().split(' ').join('_')
		// if the argument is in the foodlist, declare it as "sentEntry.food"
		var sentEntry = strToCanonFood(sentFood)
		
		var invokerNick = interaction.user.username
		if (interaction.member) {
			invokerNick = interaction.member.displayName
		}
		
		var targetNick = targetUser.username
		if (interaction.guild) {
			targetNick = (await interaction.guild.members.fetch(targetUser)).displayName ?? targetNick
		}
		
		// lodge user errors
		var errorText
		
		var sentFoodName = sentFood.replace(/_/g, ' ')
		if (sentEntry.name) sentFoodName = sentEntry.name.replace(/_/g, ' ') ?? sentFoodName
		if (sentEntry.food) sentFoodName = sentEntry.food.goodName ?? sentFoodName
		//Error messages for after these have been determined, makes random function work
		if (!sentEntry.food || (sentEntry.food.botOnly && !targetUser.bot) || sentEntry.food.hidden) {
			//If your first argument isn't a food, but it's "random"
			if (FB.altNamesForRandom.includes(sentFood.toLowerCase())) {
				do {
					sentFood = Object.keys(foodList)[Math.floor(Math.random()*Object.keys(foodList).length)]
					sentEntry = strToCanonFood(sentFood)
				} while (sentEntry.food.botOnly || sentEntry.food.hidden || sentEntry.food.weird || foodList[sentFood].aliasTarget)
				sentFoodName = sentEntry.food.goodName ?? sentEntry.name.replace(/_/g, ' ') ?? sentFood.replace(/_/g, ' ')
			} else {
				if (!sentEntry.food) {
					console.log (FB.cyan + 'user requested new food:', sentFood + FB.reset)
					fs.appendFileSync('requested-foods.txt', '\n' + sentFood)
				}
				return '`Sorry, I don\'t have \"' + interaction.options.getString('food') + '\" in my database.`'
			}
		}
		
		var invokerSupersizeFactor = 1
		var happyHourMulti = Date.now() % FB.happyHourInterval < FB.happyHourLength ? FB.happyHourCalorieFactor : 1
		var cosmeticDigestTime = ''
		
		var isSelfFeed = (interaction.user.id == targetUser.id)
		const userFilePath = require('path').resolve('userStats', targetUser.id + '.json')
		const invokerFilePath = require('path').resolve('userStats', interaction.user.id + '.json')
		var targetInDatabase = await fs_exists_async(userFilePath)
		if (!isSelfFeed) var invokerInDatabase = await fs_exists_async(invokerFilePath)
		if (targetInDatabase) { //If you're both in the database
			//Parses JSON with the user's file content
			var userFileContent = applyAbsenceEffects(JSON.parse((fs.readFileSync(userFilePath, 'utf-8').trim())))
			
			if (isSelfFeed) {
				invokerSupersizeFactor = userFileContent['supersizeFactor'] || 1
			} else {
				try {
					var invokerFileContent = applyAbsenceEffects(JSON.parse((fs.readFileSync(invokerFilePath, 'utf-8').trim())))
					invokerSupersizeFactor = invokerFileContent['supersizeFactor'] || 1
				} catch (e) {
					invokerSupersizeFactor = 1
				}
			}
			
			var calorieOffset = userFileContent['calorieOffset'] || 0
			var daysSinceJoin = Math.round((Date.now() - userFileContent['dateMade']) / FB.dayLength + 1) || 1
			var totalPounds = (FB.baseWeight + (userFileContent['totalCalories'] + calorieOffset - (daysSinceJoin * FB.caloriesPerDay)) / FB.caloriesPerPound) || FB.baseWeight
			
			var recentFoods = userFileContent['recentFoods'] || [{}]
			var recentFoodsLong = userFileContent['recentFoodsLong'] || [{}]
			var fatigueMulti = 1.0
			
			for (var i = 0; i < recentFoods.length; i++) { 
				if (Date.now() >= (recentFoods[i]['expiry'] || 0)) {
					recentFoods.splice(i, 1) // removes old foods from 'recently eaten' list
				} else if (recentFoods[i]['name'] == sentEntry.name) {
					fatigueMulti *= FB.timeFatigueFactor // increases fatigue debuff for every instance of the selected food from the past day.
				}
			}
			for (var i = 0; i < recentFoodsLong.length; i++) { 
				if (Date.now() >= (recentFoodsLong[i]['expiry'] || 0)) {
					recentFoodsLong.splice(i, 1) // removes old foods from 'recently eaten' list
				} else if (recentFoodsLong[i]['name'] == sentEntry.name) {
					fatigueMulti *= FB.longTimeFatigueFactor // increases fatigue debuff for every instance of the selected food from the past Week.
				}
			}
			
			if (userFileContent['lastEatenFood'] == sentEntry.name) {
				fatigueMulti *= FB.repeatFatigueFactor // increases fatigue debuff if same food is eaten twice in a row.
			}
			
			if (Date.now() >= (userFileContent['foodDigestEnd'] || 0) || !foodList[userFileContent['lastEatenFood']]) { //If your timeout time is done
				var digest = Math.max((sentEntry.food.digestTime ?? 1.0e99) * FB.minuteLength * invokerSupersizeFactor * happyHourMulti * Math.pow(1 - FB.voracityFactor, 8 * Math.pow(Math.min(Math.max(totalPounds / 100 - 1, 0), 10000) * 0.99 + Math.max(totalPounds / 100 - 1, 0) * 0.01, 0.25)) * fatigueMulti, 5000)
				userFileContent['totalCalories'] += sentEntry.food.calories * invokerSupersizeFactor * happyHourMulti //Adds to calorie counter
				userFileContent['latestMealTime'] = Date.now() //resets last meal to now
				userFileContent['foodDigestEnd'] = Date.now() + digest //determine end of digestion time
				cosmeticDigestTime = 'Ready for more in ' + millisToTimeString(digest) + '.'
				userFileContent['lastEatenFood'] = sentEntry.name //replaces latest eaten food
				userFileContent['calorieOffset'] = calorieOffset
				recentFoods.push({
					'name': sentEntry.name,
					'expiry': Date.now() + FB.dayLength
				})
				userFileContent['recentFoods'] = recentFoods
				recentFoodsLong.push({
					'name': sentEntry.name,
					'expiry': Date.now() + FB.dayLength * 7
				})
				userFileContent['recentFoodsLong'] = recentFoodsLong
				
				if (!userFileContent['foodsEaten'].includes(sentEntry.name)) {
					userFileContent['foodsEaten'].push(sentEntry.name)
				}
				
				if (isSelfFeed) {	// Rewrites JSON
					userFileContent['supersizeFactor'] = 1
					fs.writeFileSync(userFilePath, JSON.stringify(userFileContent, null, '\t'))
				} else {
					fs.writeFileSync(userFilePath, JSON.stringify(userFileContent, null, '\t'))
					if (invokerFileContent) {
						invokerFileContent['supersizeFactor'] = 1
						fs.writeFileSync(invokerFilePath, JSON.stringify(invokerFileContent, null, '\t'))
					}
				}
				
				console.log(
					(sentEntry.food.botOnly ? FB.green : FB.black) + new Date().toLocaleTimeString(),
					targetUser.id,
					FB.yellow + millisToDHMS(digest) + '\t' + sentEntry.food.calories + FB.reset +
					'*' + FB.yellow + Math.floor(invokerSupersizeFactor*1000*happyHourMulti)/1000 + FB.reset +
					'=' + FB.yellow + Math.floor(sentEntry.food.calories * invokerSupersizeFactor * happyHourMulti) + FB.reset + '=>' +
					FB.yellow + Math.floor(totalPounds + (sentEntry.food.calories * invokerSupersizeFactor * happyHourMulti) / FB.caloriesPerPound) + FB.reset + '#',
					(targetUser.bot ? FB.cyan : '') + targetUser.username + FB.reset,
					(sentEntry.food.botOnly ? FB.green : '') + 'ate',
					sentFoodName.toUpperCase(),
					FB.reset,
				)
				
			} else { //If your timeout time is NOT done
				var millisRemaining = userFileContent['foodDigestEnd'] - Date.now()
				errorText = '`Hey! This can\'t be eaten until the food\'s been digested! About` **`' + millisToTimeString(millisRemaining) + '`** `left.`'
			}
			
			
		} else { //If you're not in the database
			if ((interaction.user == targetUser) || targetUser.bot) {
				//Creates content to be stored in the JSON
				const newUserFileContent = JSON.stringify({
					discordID: targetUser.id,
					discordName: targetUser.username,
					discordAvatar: targetUser.avatarURL,
					totalCalories: sentEntry.food.calories * invokerSupersizeFactor * happyHourMulti,
					foodsEaten: [sentEntry.name],
					recentFoods: [ {
						'name': sentEntry.name,
						'expiry': Date.now() + FB.dayLength
					} ],
					latestMealTime: Date.now(),
					lastEatenFood: sentEntry.name,
					/*foodDigestEnd: Date.now() + sentEntry.food.digestTime * FB.minuteLength ?? 0*/
					foodDigestEnd: Date.now(), // join bonus: first food has no cooldown
					lastBellyRub: 0,
					dateMade: Date.now(),
					calorieOffset: 0,
					latestSupersizeUpdate: 0,
					supersizeFactor: 1,
					supersizeCooldownEnd: 0,
				}, null, '\t')
								
				cosmeticDigestTime = 'Welcome to FeederBot!'
				//Write the new file
				fs.writeFile(userFilePath, newUserFileContent, (err) => {
					if (err) throw err
					console.log('New user added to the database!')

					const {
						discordID,
						discordName,
					} = require(userFilePath)

					console.log('ID: ' + discordID + ' Name: ' + discordName)
				})
			} else { // only the user can initially add themself to the database
				errorText = ('`User` __`' + targetNick + '`__ `isn\'t in my database. They can start by typing this command:` **`/eat random`**')
			}
		}	
		//sendEmbed(); //Sends embed
		if (errorText) {
			return errorText
		}
		
		var embedTitle, embedDesc, embedAuthor, calorieString
	
		//Varies title and desc if you feed yourself or someone else
		if (interaction.user.id == targetUser.id) { 
			embedTitle = 'You had ' + sentEntry.food.prefix + ' ' + sentFoodName + (sentEntry.food.suffix ? ' ' + sentEntry.food.suffix : '') + '!'
			embedDesc = targetNick + ' just had ' + sentEntry.food.prefix + ' ' + sentFoodName + (sentEntry.food.suffix ? ' ' + sentEntry.food.suffix : '') + '!'
		} else if (clientId == targetUser.id) { // if the bot is being fed
			embedTitle = 'H-hey! I\'m not supposed to be the one being fed!'
			embedDesc = 'I ate ' + sentEntry.food.prefix + ' ' + sentFoodName + (sentEntry.food.suffix ? ' ' + sentEntry.food.suffix : '') + '!'
		} else {
			embedTitle = 'You were given ' + sentEntry.food.prefix + ' ' + sentFoodName + (sentEntry.food.suffix ? ' ' + sentEntry.food.suffix : '') + '!'
			embedDesc = targetNick + ' was given ' + sentEntry.food.prefix + ' ' + sentFoodName + (sentEntry.food.suffix ? ' ' + sentEntry.food.suffix : '') + ' by ' + invokerNick
		}
		if (happyHourMulti > 1) {
			embedDesc += '\nIt\'s Happy Hour! ×' + happyHourMulti + ' calories!'
		}
		embedDesc += '\n' + cosmeticDigestTime
		const feedEmbed = new EmbedBuilder()
			.setColor(sentEntry.food.color ?? '#000000')
			.setTitle(embedTitle)
			.setDescription(embedDesc)
			.setFooter({ text: 'Food sent by ' + invokerNick, iconURL: interaction.user.displayAvatarURL() })
		plusCaloriesString = '+ ' + Math.floor(sentEntry.food.calories * invokerSupersizeFactor * happyHourMulti).toLocaleString() + ' calories!'
		if (invokerSupersizeFactor > 1) {
			if (happyHourMulti > 1) {
				plusCaloriesString += ' (' + Math.floor(sentEntry.food.calories) + '×' + Math.floor(invokerSupersizeFactor*10)/10 + '×' + happyHourMulti + ')'
			} else {
				plusCaloriesString += ' (' + Math.floor(sentEntry.food.calories) + '×' + Math.floor(invokerSupersizeFactor*10)/10 + ')'
			}
		} else {
			if (happyHourMulti > 1) {
				plusCaloriesString += ' (' + Math.floor(sentEntry.food.calories) + '×' + happyHourMulti + ')'
			}
		}
		feedEmbed.setAuthor({ name: plusCaloriesString, iconURL: targetUser.displayAvatarURL()})
		return { embeds: [feedEmbed] }
	}
}

