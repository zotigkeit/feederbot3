const { colors } = require('../foods.js')
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fs_readdir_async = promisify(fs.readdir)
const { applyAbsenceEffects, millisToTimeString, formatBigNumber, FB } = require('../utils.js')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Check a user\'s stats')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to check')
		)
	,
	async execute(interaction) {
		await interaction.deferReply()
		//await interaction.editReply({ embeds: [new EmbedBuilder().setDescription('Pong!')] })
		var fileNameIdList = []
		var files = await fs_readdir_async('userStats/')
		files.forEach(file => {
			var filenameId = file.split('.').slice(0, -1).join('.')
			fileNameIdList.push(filenameId)
		})
	
		//Determines if the message is for oneself or pinged person
		var targetUser = interaction.options.getUser('user') ?? interaction.user
		
		var invokerNick = interaction.user.username
		if (interaction.member) {
			invokerNick = interaction.member.displayName
		}
		
		var targetNick = targetUser.username
		if (interaction.guild) {
			targetNick = (await interaction.guild.members.fetch(targetUser)).displayName ?? targetNick
		}
		
		//Defined the file path of the user's json
		const userFilePath = require('path').resolve('userStats', targetUser.id + '.json')
		if (fileNameIdList.includes(targetUser.id)) {
			
			//Parses user's JSON for eaten calories
			const userFileContent = applyAbsenceEffects(JSON.parse((fs.readFileSync(userFilePath, 'utf-8').trim())))
			
			//Calculates days since the user joined the database
			var daysSinceJoin = Math.floor((Date.now() - userFileContent['dateMade']) / FB.dayLength)
			
			var sinceJoinMsg = new Date(userFileContent['dateMade']).toDateString() + '\n(' + formatBigNumber(daysSinceJoin)
			if (daysSinceJoin == 1) {
				sinceJoinMsg += ' day ago)'
			} else {
				sinceJoinMsg += ' days ago)'
			}
			
		var daysSinceJoinOrPrestige = userFileContent['datePrestige'] ? Math.floor((Date.now() - userFileContent['datePrestige']) / FB.dayLength) : daysSinceJoin
			
			if (userFileContent['isInfinite']) {
				var embed = new EmbedBuilder()
					.setColor(colors.black)
			.setTitle('User Statistics ' + '⭐'.repeat((userFileContent['prestige'] || 0) / 10) + '⭐\ufe0e'.repeat((userFileContent['prestige'] || 0) % 10))
					.setAuthor({ name: targetNick, iconURL: targetUser.displayAvatarURL() })
					.addFields(
					{name: 'Weight', value: '**Infinity**', inline: true},
						{name: 'Level', value: '**Infinity**', inline: true},
						{name: 'Join date', value: sinceJoinMsg, inline: true},
						{name: 'Avg. cal/day', value: '**Infinity**', inline: true},
						{name: 'Total calories', value: '**Infinity**', inline: true},
						{name: 'Status', value: 'You have reached the ultimate.\nType `/eat everything` to Prestige.', inline: true},
					)
					.setFooter({ text: 'Info requested by ' + invokerNick, iconURL: interaction.user.displayAvatarURL() })
				if (userFileContent['supersizeFactor'] >= 1.1) {
					embed.addFields(
						{name: 'Next order size', value: formatBigNumber(Math.floor((userFileContent['supersizeFactor'] || 1) * 10)/10) + '×', inline: true},
					)
				}
			} else {
				var calsADayMsg = formatBigNumber(Math.round(userFileContent['totalCalories']/Math.max(daysSinceJoinOrPrestige, 1)))
			
				if (userFileContent['foodDigestEnd'] < Date.now()) {
					var digestionMsg = '**Ready for more!**'
				} else {
					var digestionMsg = '**' +  millisToTimeString(userFileContent['foodDigestEnd'] - Date.now()) + ' **left.'
				}
				var calorieOffset = userFileContent['calorieOffset'] || 0
				var totalPounds = FB.baseWeight + (userFileContent['totalCalories'] + calorieOffset - (daysSinceJoinOrPrestige * FB.caloriesPerDay)) / FB.caloriesPerPound
				totalPounds = Math.max(totalPounds, FB.minPounds)
				
				
				//Determines your level num
				if (totalPounds > FB.baseWeight) {
					var levelNum = Math.floor((Math.sqrt(0.8 * (totalPounds - FB.baseWeight) + 1) - 1) / 2)
				} else {
					var levelNum = 0
				}
				
				var weightRange
				//Categorizes your weight range
				switch(levelNum) {
					case 0:
						weightRange = 'Scrawny'
						embedColor = colors.red
						break
					case 1:
						weightRange = 'Slim'
						embedColor = colors.red
						break
					case 2:
						weightRange = 'Average'
						embedColor = colors.orange
						break
					case 3:
						weightRange = 'Soft'
						embedColor = colors.orange
						break
					case 4:
						weightRange = 'Chubby'
						embedColor = colors.orange
						break
					case 5:
						weightRange = 'Pudgy'
						embedColor = colors.gold
						break
					case 6:
						weightRange = 'Plump'
						embedColor = colors.gold
						break
					case 7:
						weightRange = 'Husky'
						embedColor = colors.gold
						break
					case 8:
						weightRange = 'Hefty'
						embedColor = colors.gold
						break
					case 9:
						weightRange = 'Bulky'
						embedColor = colors.lime
						break
					case 10:
						weightRange = 'Rotund'
						embedColor = colors.lime
						break
					case 11:
						weightRange = 'Ponderous'
						embedColor = colors.lime
						break
					case 12:
						weightRange = 'Enormous'
						embedColor = colors.lime
						break
					case 13:
						weightRange = 'Colossal'
						embedColor = colors.cyan
						break
					case 14:
						weightRange = 'Gargantuan'
						embedColor = colors.cyan
						break
					case 15:
						weightRange = 'Titanic'
						embedColor = colors.cyan
						break
					case 16:
						weightRange = 'Whale-Like'
						embedColor = colors.cyan
						break
					case 17:
						weightRange = 'Mountainous'
						embedColor = '#268bd2'
						break
					case 18:
						weightRange = 'Astronomical'
						embedColor = '#268bd2'
						break
					case 69:
						weightRange = 'Nice'
						embedColor = colors.purple
						break
					default:
						weightRange = 'undefined'
						embedColor = colors.purple
				}
				
				//Establishes embed layout
				var embed = new EmbedBuilder()
					.setColor(embedColor)
					.setTitle('User Statistics ' + '⭐'.repeat((userFileContent['prestige'] || 0) / 10) + '⭐\ufe0e'.repeat((userFileContent['prestige'] || 0) % 10))
					.setAuthor({ name: targetNick, iconURL: targetUser.displayAvatarURL() })
					.addFields(
						{name: 'Weight', value: '**' + formatBigNumber(Math.floor(totalPounds)) + ' pounds**\n(' + formatBigNumber(Math.floor(totalPounds / 2.205)) + ' kg)\n(' + formatBigNumber(Math.floor(totalPounds / 14)) + ' st' + (totalPounds < 1200 ? ' ' + Math.floor(totalPounds) % 14 + ' lb)' : ')'), inline: true},
						{name: 'Level', value: weightRange + '\n(Lv ' + formatBigNumber(levelNum) + ')', inline: true},
						{name: 'Join date', value: sinceJoinMsg, inline: true},
						{name: 'Avg. cal/day', value: calsADayMsg, inline: true},
						{name: 'Total calories', value: formatBigNumber(Math.floor(userFileContent['totalCalories'])), inline: true},
						{name: 'Digestion', value: digestionMsg, inline: true},
					)
					.setFooter({ text: 'Info requested by ' + invokerNick, iconURL: interaction.user.displayAvatarURL() })
				
				if (userFileContent['prestige']) {
					//Calculates days since the user's last prestige
					var daysSincePrestige = Math.floor((Date.now() - userFileContent['datePrestige']) / FB.dayLength)
					
					var sincePrestigeMsg = new Date(userFileContent['datePrestige']).toDateString() + ' (' + formatBigNumber(daysSincePrestige)
					if (daysSincePrestige == 1) {
						sincePrestigeMsg += ' day ago)'
					} else {
						sincePrestigeMsg += ' days ago)'
					}
					
					if (userFileContent['prestige'] == 1) {
						embed.addFields(
							{name: 'Prestige', value: 'Prestiged on ' + sincePrestigeMsg, inline: true}
						)
					} else {
						embed.addFields(
							{name: 'Prestige', value: 'Prestiged **' + userFileContent['prestige'] + ' times**. Latest: ' + sincePrestigeMsg, inline: true}
						)
					}
				}
				
				if (userFileContent['supersizeFactor'] >= 1.1) {
					embed.addFields(
						{name: 'Next order size', value: formatBigNumber(Math.floor((userFileContent['supersizeFactor'] || 1) * 10)/10) + '×', inline: true},
					)
				}
			}
			await interaction.editReply( { embeds: [embed]})
		} else {
			if (targetUser.bot) {
				await interaction.editReply ('__`' + targetNick + '`__ `isn\'t in my database. You can get them started with this command:` **`/feed`** __**`' + targetNick + '`**__ **`random`**')
			} else {
				await interaction.editReply ('`User` __`' + targetNick + '`__ `isn\'t in my database. They can start by typing this command:` **`/eat random`**')
			}
		}
	},
}
