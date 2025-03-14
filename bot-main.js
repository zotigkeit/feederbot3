// FEEDERBOT 3.0
// by Darm (twitter.com/FontsStuffed) and zotigkeit (twitter.com/zotig_draws)

const fs = require('node:fs')
const path = require('node:path')
const { Client, GatewayIntentBits, Collection } = require('discord.js')
const { token, test } = require('./config.json')
const { FB } = require('./utils.js')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		//GatewayIntentBits.MessageContent,
		//GatewayIntentBits.GuildMembers,
	],
})

client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

console.log ('Loading user commands...')


for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	console.log ('\t' + file)
	const command = require(filePath)
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

client.once ('ready', () => {
	if (test) {
		console.log (FB.cyan + 'FB3 TEST Ready!' + FB.reset);
		
	} else {
		console.log (FB.yellow + 'FB3 Ready!' + FB.reset);
	}
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return

	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) return

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		try {
			await interaction.reply({ content: 'There was an error while running this command!\nPlease message `ADD CONTACT HERE` if this continues happening.', ephemeral: true })
		} catch (error2) {
			await interaction.editReply({ content: 'There was an error while running this command!\nPlease message `ADD CONTACT HERE` if this continues happening.', ephemeral: true })
		}
	}
})

client.login(token)
