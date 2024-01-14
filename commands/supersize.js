const { SlashCommandBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fs_readdir_async = promisify(fs.readdir)
const { applyAbsenceEffects, millisToTimeString, millisToDHMS, FB } = require('../utils.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('supersize')
		.setDescription('Increase the size of your next food order'),
	async execute(interaction) {
		await interaction.deferReply()
		var invokerNick = interaction.user.username
		if (interaction.member) {
			invokerNick = interaction.member.displayName
		}	
		
		fileNameIdList = []
		//Makes list of users to check
		var files = await fs_readdir_async('userStats/')
		files.forEach(file => {
			var filenameId = file.split('.').slice(0, -1).join('.')
			fileNameIdList.push(filenameId)
		})
		const userFilePath = require('path').resolve('userStats', interaction.user.id + '.json')
		if (fileNameIdList.includes(interaction.user.id)) { 
			var userFileContent = JSON.parse((fs.readFileSync(userFilePath, 'utf-8').trim()))
			var preAbsenceSupersizeFactor = userFileContent['supersizeFactor'] || 1
			userFileContent = applyAbsenceEffects(userFileContent)
			
			var previousSupersizeFactor = userFileContent['supersizeFactor'] || 1
			var supersizeFactor = userFileContent['supersizeFactor'] || 1
			var supersizeCooldownEnd = userFileContent['supersizeCooldownEnd'] || 0
			var totalCalories = userFileContent['totalCalories'] || 0
			
			var supersizeCooldownRemaining = supersizeCooldownEnd - Date.now()
			if (supersizeCooldownRemaining > 0) {
				await interaction.editReply ('`/supersize is on cooldown.` **`(' + millisToTimeString(supersizeCooldownRemaining) + ' left)`**')
			} else {
				var cooldownLength = FB.supersizeCooldownInterval * (35000000/(Math.max(totalCalories, 0) + 35000000))
				userFileContent['supersizeCooldownEnd'] = Date.now() + cooldownLength
				if (interaction.user.bot) { // prevent bot users from going ham
					userFileContent['supersizeFactor'] = Math.max(supersizeFactor + 1, 2)
				} else {
					userFileContent['supersizeFactor'] = Math.max(supersizeFactor + 1 + totalCalories / 3500000, 2)
				}
				userFileContent['latestSupersizeUpdate'] = Date.now()
				fs.writeFileSync(userFilePath, JSON.stringify(userFileContent, null, '\t'))
				if (Math.floor(userFileContent['supersizeFactor']) == 69) {
					await interaction.editReply ('`Your next order will be `**`nice`**`. Come back in ' + millisToTimeString(cooldownLength) + ' to supersize again!`')
				} else {
					await interaction.editReply ('`Your next order will be `**`' + Math.floor(userFileContent['supersizeFactor'] * 10) / 10 + ' times`**` its normal size. Come back in ' + millisToTimeString(cooldownLength) + ' to supersize again!`')
				}
				console.log(
					FB.black + new Date().toLocaleTimeString(),
					interaction.user.id,
					FB.magenta + millisToDHMS(cooldownLength) + '\t' + preAbsenceSupersizeFactor + FB.reset + 'x\t=>' + FB.magenta + previousSupersizeFactor + FB.reset + 'x\t=>' + FB.magenta + userFileContent['supersizeFactor'] + FB.reset + 'x ',
					interaction.user.username,
				)
			}
		} else {
			//If you're not in the database, tell the user
			if (interaction.user.bot) {
				await interaction.editReply ('__`' + invokerNick + '`__ `isn\'t in my database. You can get them started with this command:` **`/feed`** __**`' + invokerNick + '`**__ **`random`**')
			} else {
				await interaction.editReply ('`User` __`' + invokerNick + '`__ `isn\'t in my database. They can start by typing this command:` **`/eat random`**')
			}
		}
	},
}
