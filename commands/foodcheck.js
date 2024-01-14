const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { strToCanonFood, millisToTimeString, FB } = require('../utils.js')
const fs = require('node:fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('foodcheck')
		.setDescription('Check a food in the bot\'s database')
		.addStringOption(option => option
			.setRequired(true)
			.setName('food')
			.setDescription('The food to check')
		),
	async execute(interaction) {
		await interaction.deferReply()
		var invokerNick = interaction.user.username
		if (interaction.member) {
			invokerNick = interaction.member.displayName
		}
		var checkedEntry = strToCanonFood(interaction.options.getString('food'))
		if (checkedEntry.food && !checkedEntry.food.botOnly) {
			//await interaction.editReply ('`Yep! I have ' + (checkedFood.goodName ?? interaction.options.getString('food')) + ' (' + checkedFood.calories + ' calories).`')
			var elementString = ''
			if (checkedEntry.food.elements) {
				//console.log('elemence')
				checkedEntry.food.elements.forEach(item => {
					elementString += '/' + item.charAt(0).toUpperCase() + item.slice(1)
					//console.log(elementString)
				})
				elementString = elementString.slice(1)
			}
			var embed = new EmbedBuilder()
				.setColor(checkedEntry.food.color ?? '#ffffff')
				.setTitle((checkedEntry.food.prefix ? checkedEntry.food.prefix.charAt(0).toUpperCase() + checkedEntry.food.prefix.slice(1) + ' ' : '') + '\"' + ((checkedEntry.food.goodName ?? checkedEntry.name.split('_').join(' ')) ?? '*unknown*') + '\" ' + (checkedEntry.food.suffix ?? ''))
				.addFields(
					{name: 'Calories', value: Math.floor(checkedEntry.food.calories).toLocaleString() + ' Cal' ?? '*unknown*', inline: true},
					{name: 'Base digestion time', value: checkedEntry.food.digestTime ? millisToTimeString(checkedEntry.food.digestTime * FB.minuteLength) : '*unknown*', inline: true},
				)
				.setFooter({ text: 'Info requested by ' + invokerNick, iconURL: interaction.user.displayAvatarURL() })
			if (elementString.length) {
				embed.addFields ({name: 'Element', value: elementString.length ? elementString : '*unknown*', inline: true})
			}
			if (checkedEntry.food.description) {
				embed.addFields ({name: 'Description', value: checkedEntry.food.description, inline: false})
			}
			await interaction.editReply( { embeds: [embed] })
		} else {
			if (!checkedEntry.food) {
				console.log (FB.cyan + 'user checked nonexisting food:', interaction.options.getString('food'), FB.reset)
				fs.appendFileSync('requested-foods.txt', '\n' + interaction.options.getString('food').toLowerCase().split(' ').join('_'))
			}
			await interaction.editReply ('`Sorry, I don\'t have \"' + interaction.options.getString('food') + '\" in my database.`')
		}
	},
}
