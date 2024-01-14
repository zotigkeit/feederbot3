const { SlashCommandBuilder } = require('discord.js')
const { feed } = require('../process-feed.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eat')
		.setDescription('Eat food')
		.addStringOption(option =>
			option.setName('food')
				.setDescription('The food to give (or \"random\")')
				.setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply()
		await interaction.editReply (await feed(interaction))
	},
}
