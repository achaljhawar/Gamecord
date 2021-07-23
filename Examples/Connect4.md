# Connect 4

```js
const { Connect4 } = require('discord-gamecord')

new Connect4({
    message: message,
    opponent: message.mentions.users.first(),
    embed: {
      title: 'Connect 4',
      color: '#7289da',
    },
    emojis: {
      player1: '🔵',
      player2: '🟢'
    },
    askMessage: 'Hey {opponent}, {challenger} challenged you for a game of Connect 4!',
}).startGame();
```