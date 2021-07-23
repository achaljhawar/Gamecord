const converter = ['ᴀ', 'ʙ', 'ᴄ', 'ᴅ', 'ᴇ', 'ꜰ', 'ɢ', 'ʜ', 'ɪ', 'ᴊ', 
'ᴋ', 'ʟ', 'ᴍ', 'ɴ', 'ᴏ', 'ᴘ', 'ǫ', 'ʀ', 'ꜱ', 'ᴛ', 'ᴜ', 'ᴠ', 'ᴡ', 'x', 'ʏ', 'ᴢ'];
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

function smallCaps(text) {
    const content = text.toLowerCase().split('').map(letter => {
        if (/[a-z]/g.test(letter)) {
            var index = letters.indexOf(letter)
            return converter[index];
        } else {
            return letter
        }
    }).join('');
    return content;
}

function reverseText(content) {
    return content.split('').reverse().join('');
}

module.exports.smallcaps = smallCaps;
module.exports.reverse = reverseText;