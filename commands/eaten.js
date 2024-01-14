const { SlashCommandBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fs_readdir_async = promisify(fs.readdir)
const { clientId } = require('../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eaten')
		.setDescription('Check which foods a user has eaten')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to check')
		)
		.addIntegerOption(option => option
			.setName('page')
			.setDescription('Page number')
		),
	async execute(interaction) {
		await interaction.deferReply()
		fileNameIdList = []
		
		//Makes list of users to check
		files = await fs_readdir_async('userStats/')
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
		var startIndex = 20 * (Math.max(interaction.options.getInteger('page'), 1) - 1) ?? 0
		//Lists eaten foods
		const userFilePath = require('path').resolve('userStats', targetUser.id + '.json')
		//Makes sure the wanted person 
		if (fileNameIdList.includes(targetUser.id)) { 
			const userFileContent = JSON.parse((fs.readFileSync(userFilePath, 'utf-8').trim()))
			startIndex = Math.min(startIndex, Math.floor(userFileContent['foodsEaten'].length / 20) * 20)
			var foodString = ''
			//console.log(startIndex)
			for (var i = startIndex; i < userFileContent['foodsEaten'].length && i < startIndex + 20; i++) {
				foodString += '- ' + userFileContent['foodsEaten'][i].replace(/_/g, ' ') + '\n'
			}
			if (targetUser.id == clientId) {
				await interaction.editReply('`Foods I\'ve eaten: (' + userFileContent['foodsEaten'].length + ' total)`\n' + foodString + '(Page ' + (Math.ceil(startIndex / 20) + 1) + '/' + Math.ceil(userFileContent['foodsEaten'].length / 20) + ')')
			} else {
				await interaction.editReply('`Foods` __`' + targetNick + '`__ `has eaten: (' + userFileContent['foodsEaten'].length + ' total)`\n' + foodString + '(Page ' + (Math.ceil(startIndex / 20) + 1) + '/' + Math.ceil(userFileContent['foodsEaten'].length / 20) + ')')
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
