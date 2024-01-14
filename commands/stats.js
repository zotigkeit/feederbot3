const { colors } = require('../foods.js')
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fs_readdir_async = promisify(fs.readdir)
const { applyAbsenceEffects, millisToTimeString, FB } = require('../utils.js')


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
			var daysSinceJoin = Math.ceil((Date.now() - userFileContent['dateMade']) / FB.dayLength)
			
			if (daysSinceJoin == 1) {
				var sinceJoinMsg = daysSinceJoin.toLocaleString('en') + ' day'
			} else {
				var sinceJoinMsg = daysSinceJoin.toLocaleString('en') + ' days'
			}
			var calsADayMsg = Math.round(userFileContent['totalCalories']/daysSinceJoin).toLocaleString('en') + ' Cal/day'
			
			if (userFileContent['foodDigestEnd'] - Date.now() < 0) {
				var digestionMsg = '**Ready for more!**'
			} else {
				var digestionMsg = '**' +  millisToTimeString(userFileContent['foodDigestEnd'] - Date.now()) + ' **left.'
			}
			var calorieOffset = userFileContent['calorieOffset'] || 0
			var totalPounds = FB.baseWeight + (userFileContent['totalCalories'] + calorieOffset - (daysSinceJoin * FB.caloriesPerDay)) / FB.caloriesPerPound
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
				.setTitle('User Statistics')
				.setAuthor({ name: targetNick, iconURL: targetUser.displayAvatarURL() })
				//.setThumbnail('https://dummyimage.com/160/' + embedColor.substring(1) + '/FFF.png&text=%0d' + levelNum)
				.addFields(
					{name: 'Current weight', value: '**' + Math.floor(totalPounds).toLocaleString('en') + ' pounds**\n(' + Math.floor(totalPounds / 2.205).toLocaleString('en') + ' kg / ' + Math.floor(totalPounds / 14).toLocaleString('en') + ' st' + (totalPounds < 1200 ? ' ' + Math.floor(totalPounds) % 14 + ' lb)' : ')'), inline: true},
					{name: 'Weight level', value: weightRange + '\n(Level ' + levelNum.toLocaleString('en') + ')', inline: true},
					{name: 'Days since joining', value: sinceJoinMsg, inline: true},
					{name: 'Avg. calories/day', value: calsADayMsg, inline: true},
				//.addField('Weight projection:', addedPoundsMsg, true)
					{name: 'Total calories', value: Math.floor(userFileContent['totalCalories']).toLocaleString('en') + ' calories', inline: true},
					{name: 'Digestion', value: digestionMsg, inline: true},
				)
				.setFooter({ text: 'Info requested by ' + invokerNick, iconURL: interaction.user.displayAvatarURL() })
			if (userFileContent['supersizeFactor'] >= 1.1) {
				embed.addFields(
					{name: 'Next order size', value: (Math.floor((userFileContent['supersizeFactor'] || 1) * 10)/10) + '×', inline: true},
				)
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
