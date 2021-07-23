# Tic Tac Toe

```js
const { TicTacToe } = require('discord-gamecord')

new TicTacToe({
    message: message,
    opponent: message.mentions.users.first(),
    oEmoji: '🔵', 
    xEmoji: '❌',
    oColor: 'blurple',
    xColor: 'red',
    color: '#7289da',
    askMessage: 'Hey {opponent}, {challenger} challenged you for a game of Connect 4!',
}).startGame();
```