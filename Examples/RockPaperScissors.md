# Rock Paper Scissors

```js
const { RockPaperScissors } = require('discord-gamecord')

new RockPaperScissors({
    message: message,
    opponent: message.mentions.users.first(),
    embed: {
      title: 'Connect 4',
      description: 'Press a button below to make a choice!',
      color: '#7289da',
    },
    buttons: {
      rock: 'Rock',
  	  paper: 'Paper',
  	  scissors: 'Scissors',
    },
    askMessage: 'Hey {opponent}, {challenger} challenged you for a game of Connect 4!'
}).startGame();
```