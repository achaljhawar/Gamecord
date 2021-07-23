const { MessageEmbed } = require('discord.js');

const WIDTH = 7;
const HEIGHT = 6;
const gameBoard = [];
const reactions = { "1️⃣": 1, "2️⃣": 2, "3️⃣": 3, "4️⃣": 4, "5️⃣": 5, "6️⃣": 6, "7️⃣": 7 }

module.exports = class Connect4Game {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')

        if(!options.opponent) throw new TypeError('NO_OPPONENT: Please provide an opponent arguement')
        if (typeof options.opponent !== 'object') throw new TypeError('INVALID_OPPONENT: Invalid Discord User object was provided.')
        
        if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Connect 4';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')

        if (!options.embed.color) options.embed.color = '#7289da';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
        
        if (!options.emojis) options.emojis = {};
        if (!options.emojis.player1) options.emojis.player1 = '🔴';
        if (typeof options.emojis.player1 !== 'string')  throw new TypeError('INVALID_EMOJI: Player1 Emoji must be a string.')

        if (!options.emojis.player2) options.emojis.player2 = '🟡';
        if (typeof options.emojis.player2 !== 'string')  throw new TypeError('INVALID_EMOJI: Player2 Emoji must be a string.')

        if (!options.askMessage) options.askMessage = 'Hey {opponent}, {challenger} challenged you for a game of Connect 4!';
        if (typeof options.askMessage !== 'string')  throw new TypeError('ASK_MESSAGE: Ask Messgae must be a string.')

        this.message = options.message;
        this.opponent = options.opponent;
        this.emojis = options.emojis;
        this.options = options;
        this.gameEmbed = null;
        this.inGame = false;
        this.redTurn = true;
        // red => author, yellow => opponent

    }

    getGameBoard() {
        let str = "";
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                str += "" + gameBoard[y * WIDTH + x];
            }
            str += "\n";
        }
        str += "1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣"
        return str;
    
    }

    async startGame() {
        if (this.inGame) return;
        const author = this.message.author;
        const opponent = this.opponent;

        if (opponent.bot) return this.message.channel.send("**You can't play with bots!**")
        if (opponent.id === author.id) return this.message.channel.send("**You cannot play with yourself!**")

        const embed = new MessageEmbed()
        .setTitle(this.options.embed.title)
        .setDescription(this.options.askMessage
            .replace('{challenger}', this.message.author)
            .replace('{opponent}', this.opponent))
        .setColor(this.options.embed.color)

        const question = await this.message.channel.send(embed);
        ['✅', '❌'].forEach(async e => await question.react(e));

        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === opponent.id;
        const response = await question.awaitReactions(filter, { max: 1, time: 60000 });
        const reaction = response.first();

        try {
            if (reaction.emoji.name === '❌') {
                question.reactions.removeAll().catch()
                return question.edit("**Looks like they refused to have a game of Connect4. \:(**");
            } else if (reaction.emoji.name === '✅') {
                question.delete();
                for (let y = 0; y < HEIGHT; y++) {
                    for (let x = 0; x < WIDTH; x++) {
                        gameBoard[y * WIDTH + x] = "⚪";
                    }
                }
                this.inGame = true;
        
                this.message.channel.send(this.GameEmbed()).then(msg => {
                    this.gameEmbed = msg;
                    Object.keys(reactions).forEach(reaction => {
                        this.gameEmbed.react(reaction);
                    });
        
                    this.checkReactions();
                });        
            }
        } catch (e) {
            if (!question.deleted) question.delete().catch();
            return this.message.channel.send('**Since the opponent didnt answer, i dropped the game!**')
        }
    }
    
    GameEmbed() {
        const status = this.getChip() + ` | Its now **${this.redTurn ? this.message.author.username : this.opponent.username}** turn!`

        return new Discord.MessageEmbed() 
        .setColor(this.options.embed.color)
        .setTitle(this.options.embed.title)
        .setDescription(this.getGameBoard())
        .addField('Status', status)
        .setFooter(`${this.message.author.username} vs ${this.opponent.username}`, this.message.guild.iconURL({ dynamic: true }))
    } 


    gameOver(result) {
        this.inGame = false;

        const editEmbed = new Discord.MessageEmbed()
        .setColor(this.options.embed.color)
        .setTitle(this.options.embed.title)
        .setDescription(this.getGameBoard())
        .addField('Status', this.getResultText(result))
        .setFooter(`${this.message.author.username} vs ${this.opponent.username}`, this.message.guild.iconURL({ dynamic: true }))
        
        this.gameEmbed.edit({ embed: editEmbed });
        this.gameEmbed.reactions.removeAll();
    }

    
    checkReactions() {
        const filter = (reaction, user) => Object.keys(reactions).includes(reaction.emoji.name) && user.id === this.message.author.id || user.id === this.opponent.id;

        this.gameEmbed.awaitReactions((reaction, user) => filter(reaction, user), { max: 1, time: 120000, errors: ['time'] })
        .then(async collected => {
            const reaction = collected.first();
            const user = reaction.users.cache.filter(user => user.id !== this.gameEmbed.author.id).first();
            
            // Get the turn of the user.
            const turn = this.redTurn ? this.message.author.id : this.opponent.id;

            if (user.id !== turn) {
                reaction.users.remove(user.id)
                return this.waitForReaction();
            }
            
            const column = reactions[reaction.emoji.name] - 1;
            let placedX = -1;
            let placedY = -1;

            for (let y = HEIGHT - 1; y >= 0; y--) {
                const chip = gameBoard[column + (y * WIDTH)];
                if (chip === "⚪") {
                    gameBoard[column + (y * WIDTH)] = this.getChip();
                    placedX = column;
                    placedY = y;
                    break;
                }
            }

            reaction.users.remove(user.id).then(() => {
                if (placedY == 0)
                    this.gameEmbed.reactions.cache.get(reaction.emoji.name).remove();

                if (this.hasWon(placedX, placedY)) {
                    this.gameOver({ result: 'winner', name: this.getChip() + " | " + user.username });
                }
                else if (this.isBoardFull()) {
                    this.gameOver({ result: 'tie' });
                }
                else {
                    this.redTurn = !this.redTurn;
                    this.gameEmbed.edit({ embed: this.GameEmbed() });
                    this.checkReactions();
                }
            });
        })
        .catch(collected => {
            this.gameOver({ result: 'timeout' });
        });

    }


    hasWon(placedX, placedY) {
        const chip = this.getChip();

        //Horizontal Check
        const y = placedY * WIDTH;
        for (var i = Math.max(0, placedX - 3); i <= placedX; i++) {
            var adj = i + y;
            if (i + 3 < WIDTH) {
                if (gameBoard[adj] === chip && gameBoard[adj + 1] === chip && gameBoard[adj + 2] === chip && gameBoard[adj + 3] === chip)
                    return true;
            }
        }
        //Verticle Check
        for (var i = Math.max(0, placedY - 3); i <= placedY; i++) {
            var adj = placedX + (i * WIDTH);
            if (i + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH] === chip && gameBoard[adj + (2 * WIDTH)] === chip && gameBoard[adj + (3 * WIDTH)] === chip)
                    return true;
            }
        }
        //Ascending Diag
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY + i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH + 1] === chip && gameBoard[adj + (2 * WIDTH) + 2] === chip && gameBoard[adj + (3 * WIDTH) + 3] === chip)
                    return true;
            }
        }
        //Descending Diag
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY - i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY - 3 >= 0) {
                if (gameBoard[adj] === chip && gameBoard[adj - WIDTH + 1] === chip && gameBoard[adj - (2 * WIDTH) + 2] === chip && gameBoard[adj - (3 * WIDTH) + 3] === chip)
                    return true;
            }
        }
        return false;
    }

    getChip() {
        return this.redTurn ? this.emojis.player1 : this.emojis.player2;
    }

    isBoardFull() {
        for (let y = 0; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++)
                if (gameBoard[y * WIDTH + x] === "⚪")
                    return false;
        return true;
    }

    getResultText(result) {
        if (result.result === 'tie')
            return 'It was a tie!';
        else if (result.result === 'timeout')
            return 'The game went unfinished :(';
        else if (result.result === 'error')
            return 'ERROR: ' + result.error;
        else
            return result.name + ' won the game!';
    }
}    
