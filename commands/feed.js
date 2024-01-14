const { SlashCommandBuilder } = require('discord.js')
const { feed } = require('../process-feed.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feed')
		.setDescription('Give food to a user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to receive the food')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('food')
				.setDescription('The food to give (or \"random\")')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply()
		await interaction.editReply (await feed(interaction))
	},
}
