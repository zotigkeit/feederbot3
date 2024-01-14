# A feederism minigame in a Discord bot

## Installation

* Install [Node.js](https://nodejs.org/)

* Install the [discord.js](https://discord.js.org/) package to FeederBot's directory.

```
npm install discord.js
```

* Get a Discord bot

* Put your bot's token and user id in `config.json`

* Run `deploy-commands.js` to push your bot commands to Discord

```
node deploy-commands.js
```

* Run `bot-main.js` to start the bot

```
node bot-main.js
```

* Recommended additional steps...

* * Add your contact info to `commands/help.js` to get feedback from your users

* * Add more foods to `foods.js`

## Debug scripts

### `audit-users.js`

Outputs a brief description of every user

### `export-foods-csv.js`

Outputs food list as CSV

### `export-foods-json.js`

Outputs food list as JSON