const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { strToCanonFood, millisToTimeString, FB } = require('../utils.js')
const fs = require('node:fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('See the Wikipedia article of a food')
		.addStringOption(option => option
			.setRequired(true)
			.setName('food')
			.setDescription('The food to check')
		),
	async execute(interaction) {
		await interaction.deferReply()
		var checkedEntry = strToCanonFood(interaction.options.getString('food'))
		if (checkedEntry.food && !checkedEntry.food.botOnly) {
			if (checkedEntry.food.wikipedia) {
				await interaction.editReply('http://en.wikipedia.org/wiki/' + checkedEntry.food.wikipedia.split(' ').join('_'))
			} else {
				await interaction.editReply('`I don\'t have a Wikipedia article for \"' + (checkedEntry.food.goodName ?? checkedEntry.name.split('_').join(' ')) + '\" yet.`\n`Here is my best guess:` https://en.wikipedia.org/wiki/Special:Search?search=' + (checkedEntry.food.goodName ?? checkedEntry.name).split(' ').join('_'))
			}
		} else {
			if (!checkedEntry.food) {
				console.log ('%s%s%s%s', FB.cyan, 'user wikied nonexisting food: ', interaction.options.getString('food'), FB.reset)
				fs.appendFileSync('requested-foods.txt', '\n' + interaction.options.getString('food').toLowerCase().split(' ').join('_'))
			}
			await interaction.editReply ('`Sorry, I don\'t have \"' + interaction.options.getString('food') + '\" in my database.`')
		}
	},
}
