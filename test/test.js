const Discord = require('discord.js');
const client = new Discord.Client();
const buttons = require('discord-buttons');
const { Snake } = require('../index');
buttons(client);

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (message) => {
  if(message.content === '!snake') {
    new Snake({
      message: message,
      embed: {
        title: 'Snake Game',
	color: '#7289da',
	OverTitle: "Game Over",
      },
      snake: { head: '😄', body: '🟨', tail: '🟡' },
      emojis: {
        board: '⬛', 
        food: '🍎',
        up: '⬆️', 
        down: '⬇️',
	right: '➡️',
	left: '⬅️',
      }
    }).startGame();
  }
});

client.login('DISCORD_BOT_TOKEN');