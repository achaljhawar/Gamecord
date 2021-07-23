const { MessageEmbed } = require('discord.js')
const { MessageButton } = require('discord-buttons')
const choice = { r: '🌑', p: '📃', s: '✂️'};

class RPSGame {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        if(!options.opponent) throw new TypeError('NO_OPPONENT: Please provide an opponent arguement')
        if (typeof options.opponent !== 'object') throw new TypeError('INVALID_OPPONENT: Invalid Discord User object was provided.')


        if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Rock Paper Scissors';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
        if (!options.embed.description) options.embed.description = 'Press a button below to make a choice!';
        if (typeof options.embed.description !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
        if (!options.embed.color) options.embed.color = '#7289da';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')

        if (!options.buttons) options.buttons = {};
        if (!options.buttons.rock) options.buttons.rock = 'Rock';
        if (typeof options.buttons.rock !== 'string')  throw new TypeError('INVALID_BUTTON: Rock Button must be a string.')
        if (!options.buttons.paper) options.buttons.paper = 'Paper';
        if (typeof options.buttons.paper !== 'string')  throw new TypeError('INVALID_BUTTON: Paper Button must be a string.')
        if (!options.buttons.scissors) options.buttons.scissors = 'Scissors';
        if (typeof options.buttons.scissors !== 'string')  throw new TypeError('INVALID_BUTTON: Scissors Button must be a string.')

    
        if (!options.askMessage) options.askMessage = 'Hey {opponent}, {challenger} challenged you for a game of Rock Paper Scissors!';
        if (typeof options.askMessage !== 'string')  throw new TypeError('ASK_MESSAGE: Ask Messgae must be a string.')

        this.inGame = false;
        this.options = options;
        this.opponent = options.opponent;
        this.message = options.message;
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
                question.reactions.removeAll().catch();
                return question.edit("**Looks like they refused to have a game of Tic Tac Toe. \:(**");
            } else {
               question.delete();
               this.RPSGame();                
            }
        } catch (e) {
            if (!question.deleted) question.delete().catch();
            return this.message.channel.send('**Since the opponent didnt answer, i dropped the game!**')
        }
    }

    async RPSGame() {
        this.inGame = true;

        let btn_a1 = 'r_' + i(15)
		let btn_a2 = 'p_' + i(15)
		let btn_a3 = 's_' + i(15)

        const embed = new MessageEmbed()
		.setTitle(this.options.embed.title)
 		.setDescription(this.options.embed.description)
        .setColor(this.options.embed.color)

        let rock = new MessageButton().setID(btn_a1).setStyle("blurple").setLabel(this.options.buttons.rock).setEmoji('🌑')
        let paper = new MessageButton().setID(btn_a2).setStyle("blurple").setLabel(this.options.buttons.paper).setEmoji('📃')
        let scissors = new MessageButton().setID(btn_a3).setStyle("blurple").setLabel(this.options.buttons.scissors).setEmoji('✂️')

        const msg = await this.message.channel.send({ embed: embed, components: [
            {
                type: 1,  components: [rock, paper, scissors]
            },
        ]})

        let challenger_choice;
        let opponent_choice;
        const filter = m => m.clicker.user.id == this.message.author.id || m.clicker.user.id == this.opponent.id;
        const collector = msg.createButtonCollector(filter, {
            time: 120000, // 120 seconds
        }) 

        collector.on('collect', async btn => {
            if (btn.clicker.user.id == this.message.author.id) {
                if (challenger_choice) {
                    return btn.reply.send('You cannot change your selection', true)
                }
                challenger_choice = choice[btn.id.split('_')[0]];

                btn.reply.send(`You choose ${challenger_choice}`, true)

                if (challenger_choice && opponent_choice) {
                    collector.stop()
                    this.getResult(msg, challenger_choice, opponent_choice)
                }
            }
            else if (btn.clicker.user.id == this.opponent.id) {
                if (opponent_choice) {
                    return btn.reply.send('You cannot change your selection', true)
                }
                opponent_choice = choice[btn.id.split('_')[0]];

                btn.reply.send(`You choose ${opponent_choice}`, true)

                if (challenger_choice && opponent_choice) {
                    collector.stop()
                    this.getResult(msg, challenger_choice, opponent_choice)
                }
            }
        })

        collector.on("end", async(c, r) => {
            if (r === 'time' && this.inGame == true) {
                for (let x = 0; x < msg.components.length; x++) {
                    for (let y = 0; y < msg.components[x].components.length; y++) {
                      msg.components[x].components[y].disabled = true;
                    }
                }
                return msg.edit({ embed: msg.embeds[0], components: msg.components })
            }
        })
    }

    getResult(msg, challenger, opponent) {
        let result;

        if (challenger === opponent) {
            result = 'It was a tie!'
        } else if (
            (opponent=== '✂️' && challenger === '📃') || 
            (opponent=== '🌑' && challenger === '✂️') || 
            (opponent=== '📃' && challenger === '🌑')
        ) {
            result = `${this.opponent} won the game!`
        } else {
            result = `${this.message.author} won the game!`
        }

        const finalEmbed = new MessageEmbed()
        .setTitle(this.options.embed.title)
        .setColor(this.options.embed.color)
        .setDescription(result)
        .addField(this.message.author.username, challenger, true)
        .addField(this.opponent.username, opponent, true)
        .setTimestamp()

        for (let x = 0; x < msg.components.length; x++) {
			for (let y = 0; y < msg.components[x].components.length; y++) {
			  msg.components[x].components[y].disabled = true;
			}
		}

        return msg.edit({ embed: finalEmbed, components: msg.components })
    }
}

module.exports = RPSGame;

function i(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
    }
    return result;
  }