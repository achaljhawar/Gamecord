# Snake

```js
const { Snake } = require('discord-gamecord')

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
      right: '➡️',
      down: '⬇️',
      left: '⬅️',
    },
}).startGame();
```