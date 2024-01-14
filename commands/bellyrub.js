const { SlashCommandBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fs_readdir_async = promisify(fs.readdir)
const { millisToTimeString, applyAbsenceEffects, millisToDHMS, FB } = require('../utils.js')
const { clientId } = require('../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bellyrub')
		.setDescription('Rub a user\'s belly')
		.addUserOption(option => option
			.setRequired(true)
			.setName('user')
			.setDescription('The target user')
		),
	async execute(interaction) {
		await interaction.deferReply()
		var targetUser = interaction.options.getUser('user')
		if (targetUser == interaction.user) {
			await interaction.editReply('`You rub your own belly. It\'s not very effective!`')
			return
		} else if (!targetUser) {
			await interaction.editReply('`You need to select a user in order to rub their belly!`')
			return
		}
		var targetNick = targetUser.username
		if (interaction.guild) {
			targetNick = (await interaction.guild.members.fetch(targetUser)).displayName ?? targetNick
		}
		fileNameIdList = []
		//Makes list of users to check
		var files = await fs_readdir_async('userStats/')
		files.forEach(file => {
			var filenameId = file.split('.').slice(0, -1).join('.')
			fileNameIdList.push(filenameId)
		})
		const userFilePath = require('path').resolve('userStats', targetUser.id + '.json')
		if (fileNameIdList.includes(targetUser.id)) { 
			const userFileContent = applyAbsenceEffects(JSON.parse((fs.readFileSync(userFilePath, 'utf-8').trim())))
			
			var calorieOffset = userFileContent['calorieOffset'] || 0
			var daysSinceJoin = Math.round((Date.now() - userFileContent['dateMade']) / FB.dayLength + 1) || 1
			var totalPounds = (FB.baseWeight + (userFileContent['totalCalories'] + calorieOffset - (daysSinceJoin * FB.caloriesPerDay)) / FB.caloriesPerPound) || FB.baseWeight
			
			if (Date.now() >= userFileContent['foodDigestEnd']) {
				//If you've already digested your food
				if (targetUser.id == clientId) {
					await interaction.editReply ('`I don\'t need any bellyrubs right now! I\'ve digested my food.`')
				} else {
					await interaction.editReply ('`' + targetUser.username + ' doesn\'t need any bellyrubs right now! They\'ve digested their food.`')
				}
				
			} else {
				
				if (Date.now() - userFileContent['lastBellyRub'] > FB.bellyRubDelay * FB.minuteLength) {
					var foodDigestLengthInitial = userFileContent['foodDigestEnd'] - Date.now()
					var timeReduction = Math.round((userFileContent['foodDigestEnd'] - Date.now()) * FB.bellyRubPower)
						
					userFileContent['foodDigestEnd'] -= timeReduction
					userFileContent['lastBellyRub'] = Date.now()
					fs.writeFileSync(userFilePath, JSON.stringify(userFileContent, null, '\t'))
					
					//Tells the user how much time has been taken off
					if (targetUser.id == clientId) {
						await interaction.editReply ('`You\'ve rubbed my belly! It reduced my digestion time! (' + millisToTimeString(foodDigestLengthInitial) + ' → ' + millisToTimeString(foodDigestLengthInitial - timeReduction) + ')`')
					} else {
						await interaction.editReply ('`You\'ve rubbed` __`' + targetNick + '`__`\'s belly! It reduced their digestion time! (' + millisToTimeString(foodDigestLengthInitial) + ' → ' + millisToTimeString(foodDigestLengthInitial - timeReduction) + ')`')
					}
					console.log(
						FB.black + new Date().toLocaleTimeString(),
						targetUser.id,
						FB.blue + millisToDHMS(foodDigestLengthInitial) + FB.reset + '=>' + FB.blue + millisToDHMS(foodDigestLengthInitial - timeReduction) + FB.reset + '\t' + targetUser.username,
					)
				} else {
					if (targetUser.id == clientId) {
						await interaction.editReply ('`My belly is on cooldown. Please wait` **`' + millisToTimeString(FB.bellyRubDelay * FB.minuteLength - (Date.now() - userFileContent['lastBellyRub'])) + '.`**')
					} else {
						await interaction.editReply ('__`' + targetNick + '`__ `\'s belly is on cooldown. Please wait` **`' + millisToTimeString(FB.bellyRubDelay * FB.minuteLength - (Date.now() - userFileContent['lastBellyRub'])) + '.`**')
					}
				}
			}
		} else {
			//If you're not in the database, tell the user
			if (targetUser.bot) {
				await interaction.editReply ('__`' + targetNick + '`__ `isn\'t in my database. You can get them started with this command:` **`/feed`** __**`' + targetNick + '`**__ **`random`**')
			} else {
				await interaction.editReply ('`User` __`' + targetNick + '`__ `isn\'t in my database. They can start by typing this command:` **`/eat random`**')
			}
		}
	},
}
