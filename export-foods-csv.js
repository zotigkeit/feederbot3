const fs = require('node:fs')
const path = require('node:path')
const FB = require('./constants.js')
const { foodList, colors } = require('./foods.js')

console.log("food\taliasTarget\thidden\tbotOnly\tcalories\tprefix\tcolor\tdigestTime\tdescription\telements\twikipedia")
Object.keys(foodList).forEach(food => {
	switch (foodList[food].color) {
		case colors.red:
			foodList[food].color = 'red'
			break
		case colors.orange:
			foodList[food].color = 'orange'
			break
		case colors.gold:
			foodList[food].color = 'gold'
			break
		case colors.yellow:
			foodList[food].color = 'yellow'
			break
		case colors.lime:
			foodList[food].color = 'lime'
			break
		case colors.green:
			foodList[food].color = 'green'
			break
		case colors.mint:
			foodList[food].color = 'mint'
			break
		case colors.cyan:
			foodList[food].color = 'cyan'
			break
		case colors.azure:
			foodList[food].color = 'azure'
			break
		case colors.blue:
			foodList[food].color = 'blue'
			break
		case colors.purple:
			foodList[food].color = 'purple'
			break
		case colors.pink:
			foodList[food].color = 'pink'
			break
		case colors.magenta:
			foodList[food].color = 'magenta'
			break
		case colors.white:
			foodList[food].color = 'white'
			break
		case colors.silver:
			foodList[food].color = 'silver'
			break
		case colors.gray:
			foodList[food].color = 'gray'
			break
		case colors.black:
			foodList[food].color = 'black'
			break
		case colors.brown:
			foodList[food].color = 'brown'
			break
		case colors.cream:
			foodList[food].color = 'cream'
			break
		default:
			break
	}
	console.log([food, foodList[food].aliasTarget, foodList[food].hidden, foodList[food].botOnly, foodList[food].calories, foodList[food].prefix, foodList[food].color, foodList[food].digestTime, foodList[food].description, (foodList[food].elements ?? []).join(','), foodList[food].wikipedia].join('\t'))
})