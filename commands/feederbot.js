const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feederbot')
		.setDescription('Information about FeederBot'),
	async execute(interaction) {
		await interaction.reply({
			content:
				'> :underage: This bot caters to the feederism and weight gain fetish community.\n' +
				'> It does not contain explicit adult content, but is only for users 18 years or older.\n' +
				'> \n' +
				'> **:warning: This bot only works in Age-Restricted Channels and DMs. :warning:**\n' +
				'> Type `/help` in an age-restricted channel to get started.\n' +
				'> \n' +
				'> For details on age-restricted commands, go here:\n' +
				'> https://support.discord.com/hc/articles/10123937946007 \n' +
				'> \n' +
				'> If you have questions, send a direct message to `[CONTACT INFO HERE]`.'
		})
	},
}
