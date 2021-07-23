const { MessageEmbed } = require('discord.js')
const { MessageButton } = require('discord-buttons')
const reactions = { a1: 1, a2: 2, a3: 3, b1: 4, b2: 5, b3: 6, c1: 7, c2: 8, c3: 9 };

const NO_MOVE = 0; 
const PLAYER_1 = 1;
const PLAYER_2 = 2;

class TicTacToe {
    constructor(options = {}) {
		if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        if(!options.opponent) throw new TypeError('NO_OPPONENT: Please provide an opponent arguement')
        if (typeof options.opponent !== 'object') throw new TypeError('INVALID_OPPONENT: Invalid Discord User object was provided.')


        if (!options.xEmoji) options.xEmoji = '❌';
        if (typeof options.xEmoji !== 'string')  throw new TypeError('INVALID_EMOJI: xEmoji should be a string.')
        if (!options.oEmoji) options.oEmoji = '🔵';
        if (typeof options.oEmoji !== 'string')  throw new TypeError('INVALID_EMOJI: oEmoji should be a string.')
        

        if (!options.xColor) options.xColor = 'red';
        if (typeof options.xColor !== 'string')  throw new TypeError('INVALID_COLOR: xColor should be a string.')
        if (!options.oColor) options.oColor = 'blurple';
        if (typeof options.oColor !== 'string')  throw new TypeError('INVALID_COLOR: oColor should be a string.')


        if (!options.color) options.color = '#7289da';
        if (typeof options.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
        if (!options.askMessage) options.askMessage = 'Hey {opponent}, {challenger} challenged you for a game of Tic Tac Toe!';
        if (typeof options.askMessage !== 'string')  throw new TypeError('ASK_MESSAGE: Ask Messgae must be a string.')
        

		this.options = options;
        this.message = options.message;
        this.opponent = options.opponent;
		this.gameBoard = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        this.inGame = false;
		this.xTurn = true;
		// xTurn => author, oTurn => opponent 
    }
 
    async startGame() {
		if (this.inGame) return;
        const author = this.message.author;
        const opponent = this.opponent;

        if (opponent.bot) return this.message.channel.send("**You can't play with bots!**")
        if (opponent.id === author.id) return this.message.channel.send("**You cannot play with yourself!**")

        const embed = new MessageEmbed()
        .setTitle('Tic Tac Toe')
        .setDescription(this.options.askMessage
            .replace('{challenger}', this.message.author)
            .replace('{opponent}', this.opponent))
        .setColor(this.options.color)
        
        const question = await this.message.channel.send(embed);
        ['✅', '❌'].forEach(async e => await question.react(e));

        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === opponent.id;
        const response = await question.awaitReactions(filter, { max: 1, time: 60000 });
        const reaction = response.first();

        try {
            if (reaction.emoji.name === '❌') {
                question.reactions.removeAll().catch();
                return question.edit("**Looks like they refused to have a game of Tic Tac Toe. \:(**");
            } else {
               question.delete();
               this.TTTGame();                
            }
        } catch (e) {
            if (!question.deleted) question.delete().catch();
            return this.message.channel.send('**Since the opponent didnt answer, i dropped the game!**')
        }
    }

    async TTTGame() {
        this.inGame = true;
		var gameBoard = this.gameBoard;
		for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                gameBoard[x][y] = NO_MOVE;
            }
        }

		let btn_a1 = 'a1_' + i(10)
		let btn_a2 = 'a2_' + i(10)
		let btn_a3 = 'a3_' + i(10)
		let btn_b1 = 'b1_' + i(10)
		let btn_b2 = 'b2_' + i(10)
		let btn_b3 = 'b3_' + i(10)
		let btn_c1 = 'c1_' + i(10)
		let btn_c2 = 'c2_' + i(10)
		let btn_c3 = 'c3_' + i(10)

        const embed = new MessageEmbed()
		.setAuthor(`${this.message.author.username} vs ${this.opponent.username}`)
 		.setDescription(`${this.getChip()} | Its now **${this.xTurn ? this.message.author.username : this.opponent.username}** turn!`)
        .setColor(this.options.color)

        let a1 = new MessageButton().setID(btn_a1).setStyle("grey").setLabel("-")
        let a2 = new MessageButton().setID(btn_a2).setStyle("grey").setLabel("-")
        let a3 = new MessageButton().setID(btn_a3).setStyle("grey").setLabel("-")
        
        let b1 = new MessageButton().setID(btn_b1).setStyle("grey").setLabel("-")
		let b2 = new MessageButton().setID(btn_b2).setStyle("grey").setLabel("-")
        let b3 = new MessageButton().setID(btn_b3).setStyle("grey").setLabel("-")

        let c1 = new MessageButton().setID(btn_c1).setStyle("grey").setLabel("-")
        let c2 = new MessageButton().setID(btn_c2).setStyle("grey").setLabel("-")
        let c3 = new MessageButton().setID(btn_c3).setStyle("grey").setLabel("-")

        var msg = await this.message.channel.send({ embed: embed, components: [
            {
              type: 1,  components: [a1, a2, a3]
            },
            {
              type: 1,  components: [b1, b2, b3]
            },
            {
              type: 1,  components: [c1, c2, c3]
            },
        ]})

        const filter = m => m.clicker.user.id == this.message.author.id || m.clicker.user.id == this.opponent.id;
        const collector = msg.createButtonCollector(filter, {
            idle: 120000, // 120 seconds
        })

        collector.on('collect', async btn => {
			const turn = this.xTurn ? this.message.author.id : this.opponent.id;

			if (btn.clicker.user.id !== turn) {
				return btn.reply.send('Waiting for the opponent...', true)
			}
			await btn.reply.defer();

			const index = reactions[btn.id.split('_')[0]] - 1;
			const x = index % 3;
            const y = Math.floor(index / 3);
			const ebtn = msg.components[y].components[x];

			var new_btn = new MessageButton()
			.setID(ebtn.id)
			.setDisabled()
			.setEmoji(this.getChip())
			.setStyle(this.xTurn ? this.options.xColor : this.options.oColor)
            
			msg.components[y].components[x] = new_btn;

            this.placeMove(x, y, this.xTurn ? PLAYER_1: PLAYER_2)

			if (this.isGameOver()) {
				if (this.hasWon(PLAYER_2))
				    this.gameOver({ result: "winner", name: this.opponent.username }, msg); // OPPONENT WON
				else if (this.hasWon(PLAYER_1))
				    this.gameOver({ result: "winner", name: this.message.author.username }, msg) // AUTHOR WON
				else
 				   this.gameOver({ result: "tie" }, msg) // TIE
			}
			else {
				// MAKE NEXT MOVE
				this.xTurn = !this.xTurn;
				const edit_embed = msg.embeds[0]
				.setDescription(`${this.getChip()} | Its now **${this.xTurn ? this.message.author.username : this.opponent.username}** turn!`)

				msg.edit({ embed: edit_embed, components: msg.components })
			}	            
        })

        collector.on("end", async(c, r) => {
            if (r === 'idle' && this.inGame == true) this.gameOver({ result: "timeout" }, msg)
        })

    }

	gameOver(result, msg) {
        this.inGame = false;

        const Embed = new MessageEmbed()
        .setColor(msg.embeds[0].color)
        .setAuthor(`${this.message.author.username} vs ${this.opponent.username}`)
        .setDescription("**Game Over!** - " + this.getResultText(result))

        for (let x = 0; x < msg.components.length; x++) {
			for (let y = 0; y < msg.components[x].components.length; y++) {
			  msg.components[x].components[y].disabled = true;
			}
		}
		return msg.edit({ embed: Embed, components: msg.components })
    }

	getChip() {
		return this.xTurn ? this.options.xEmoji : this.options.oEmoji;
	}

	placeMove(x, y, player) {
        this.gameBoard[x][y] = player;
    }

	isGameOver() {
        if (this.hasWon(PLAYER_1) || this.hasWon(PLAYER_2))
            return true;

        if (this.AvailablePoints().length == 0) {
            return true;
        }
        return false;
    }

	hasWon(player) {
		var gameBoard = this.gameBoard;
        
        // Ascending Diag
        if (gameBoard[0][0] == gameBoard[1][1] && gameBoard[0][0] == gameBoard[2][2] && gameBoard[0][0] == player) {
            return true;
        }
        // Descending Diag
        if (gameBoard[0][2] == gameBoard[1][1] && gameBoard[0][2] == gameBoard[2][0] && gameBoard[0][2] == player) {
            return true;
        }
        // Vertical /  Horizonatl  Check
        for (let i = 0; i < 3; ++i) {
            if (gameBoard[i][0] == gameBoard[i][1] && gameBoard[i][0] == gameBoard[i][2] && gameBoard[i][0] == player) {
                return true;
            }

            if (gameBoard[0][i] == gameBoard[1][i] && gameBoard[0][i] == gameBoard[2][i] && gameBoard[0][i] == player) {
                return true;
            }
        }
        return false;
    }

	AvailablePoints() {
        const availablePoints = [];
        for (let i = 0; i < 3; ++i)
            for (let j = 0; j < 3; ++j)
                if (this.gameBoard[i][j] == NO_MOVE)
                    availablePoints.push({ x: i, y: j });
        return availablePoints;
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

module.exports = TicTacToe;

function i(length) {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  }
  return result;
}