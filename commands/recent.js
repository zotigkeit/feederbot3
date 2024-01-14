const { SlashCommandBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fs_readdir_async = promisify(fs.readdir)
const { millisToTimeString, FB } = require('../utils.js')
const { clientId } = require('../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recent')
		.setDescription('Check which foods a user has eaten in the past day')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to check')
		),
	async execute(interaction) {
		await interaction.deferReply()
		fileNameIdList = []
		
		//Makes list of users to check
		var files = await fs_readdir_async('userStats/')
		files.forEach(file => {
			var filenameId = file.split('.').slice(0, -1).join('.')
			fileNameIdList.push(filenameId)
		})
		  
		//Determines if the message is for oneself or pinged person
		var targetUser = interaction.options.getUser('user') ?? interaction.user
		
		var targetNick = targetUser.username
		if (interaction.guild) {
			targetNick = (await interaction.guild.members.fetch(targetUser)).displayName ?? targetNick
		}
		
		//Lists eaten foods
		const userFilePath = require('path').resolve('userStats', targetUser.id + '.json')
		
		//Makes sure the wanted person 
		if (fileNameIdList.includes(targetUser.id)) { 
		
			const userFileContent = JSON.parse((fs.readFileSync(userFilePath, 'utf-8').trim()))
			var recentFoods = userFileContent['recentFoods'] || [{}]
			var recentString = ''
			
			for (var i = 0; i < recentFoods.length; i++) { 
				if (Date.now() >= (recentFoods[i]['expiry'] || 0)) {
					recentFoods.splice(i, 1); // removes old foods from 'recently eaten' list
				} else {
					recentString += '- ' + recentFoods[i]['name'].replace(/_/g, ' ') + ' (' + millisToTimeString(Date.now() - (recentFoods[i]['expiry'] - FB.dayLength)) + ' ago)\n'
				}
			}
			if (targetUser.id == clientId) {
				if (recentFoods.length > 0) {
					await interaction.editReply ('`Foods I\'ve eaten in the past 24 hours:`\n' + recentString)
				} else {
					await interaction.editReply ('`I haven\'t eaten anything in the past 24 hours!`')
				}
			} else {
				if (recentFoods.length > 0) {
					await interaction.editReply ('`Foods` __`' + targetNick + '`__ `has eaten in the past 24 hours:`\n' + recentString)
				} else {
					await interaction.editReply ('__`' + targetNick + '`__ `hasn\'t eaten anything in the past 24 hours!`')
				}
			}
		} else {
			if (targetUser.bot) {
				await interaction.editReply ('__`' + targetNick + '`__ `isn\'t in my database. You can get them started with this command:` **`/feed`** __**`' + targetNick + '`**__ **`random`**')
			} else {
				await interaction.editReply ('`User` __`' + targetNick + '`__ `isn\'t in my database. They can start by typing this command:` **`/eat random`**')
			}
		
		}
	},
}
