const { SlashCommandBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fs_readdir_async = promisify(fs.readdir)
const { applyAbsenceEffects, millisToTimeString, millisToDHMS, formatBigNumber, FB } = require('../utils.js')

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
			let filenameId = file.split('.').slice(0, -1).join('.')
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
				let cooldownLength = FB.supersizeAdditionalCooldown + FB.supersizeCooldownInterval * (FB.caloriesPerPound * 10000 / (Math.min(Math.max(totalCalories, 0), 1e308) + FB.caloriesPerPound * 10000)) / ((userFileContent['prestige'] || 0) + 1)
				userFileContent['supersizeCooldownEnd'] = Date.now() + cooldownLength
				if (interaction.user.bot) { // prevent bot users from going ham
					userFileContent['supersizeFactor'] = Math.max(Math.min(supersizeFactor + 1, 1e303), 2)
				} else {
					userFileContent['supersizeFactor'] = Math.max(Math.min(supersizeFactor + 1 + Math.min(totalCalories, 1e308)/ 3500000 * ((userFileContent['prestige'] || 0) + 2), 1e303), 2)
				}
				userFileContent['latestSupersizeUpdate'] = Date.now()
				fs.writeFileSync(userFilePath, JSON.stringify(userFileContent, null, '\t'))
				if (Math.floor(userFileContent['supersizeFactor']) == 69) {
					await interaction.editReply ('`Your next order will be `**`' + formatBigNumber(Math.floor(userFileContent['supersizeFactor'] * 10) / 10) + ' times`**` its normal size (nice).`\n`Come back in ' + millisToTimeString(cooldownLength) + ' to supersize again!`')
				} else {
					await interaction.editReply ('`Your next order will be `**`' + formatBigNumber(Math.floor(userFileContent['supersizeFactor'] * 10) / 10) + ' times`**` its normal size.`\n`Come back in ' + millisToTimeString(cooldownLength) + ' to supersize again!`')
				}
				console.log(
					FB.black + new Date().toLocaleTimeString(),
					interaction.user.id,
				FB.magenta + millisToDHMS(cooldownLength) + '\t' + formatBigNumber(preAbsenceSupersizeFactor) + FB.reset + 'x\t=> ' + FB.magenta + formatBigNumber(previousSupersizeFactor) + FB.reset + 'x\t=> ' + FB.magenta + formatBigNumber(userFileContent['supersizeFactor']) + FB.reset + 'x ',
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
