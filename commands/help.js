const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Information about FeederBot\'s commands'),
	async execute(interaction) {
		await interaction.reply({
			content:
				'> Hi! I\'m FeederBot, a special robot specializing in cuisine!\n' +
				'> \n' +
				'> `/eat` - Eat the chosen food (or random).\n' +
				'> `/feed` - Give food (or random) to someone else.\n' +
				'> `/stats` - A detailed overview of a user\'s progress so far.\n' +
				'> `/foodcheck` - Check for a food in my database.\n' +
				'> `/eaten` - List all the foods a user has eaten before.\n' +
				'> `/recent` - List what a user has eaten in the past 24 hours. __For best results, try eating a diverse variety of foods.__\n' +
				'> `/bellyrub` - Rub a user\'s belly, allowing them to eat more food sooner.\n' +
				'> `/supersize` - Increase the size of your next food order. Keep using the command to build up a higher multiplier! Multiplier reverts to 1 after a food order.\n' +
				'> `/wiki` - View a Wikipedia article about a food' +
				'> \n' +
				'> These commands only appear in Age-Restricted Channels.\n' +
				'> \n' +
				'> If you have feedback, questions, or wish to be removed from the user database, [CONTACT INFO HERE]'
		})
	},
}
