let axios = require('axios');
let {decode} = require('html-entities');
let { GetUserFromMention } = require('../utils/generalUtil.js');

module.exports = {
    name: 'insult',
    description: `Generates an 'evil' insult. (mention a user to insult them, maybe).
                    Insults taken from: \`https://evilinsult.com/\`
                    *aliases*: \`insult\`, \`i\``,
    aliases: ['i'],
    async execute(message, data) {
        let url = `https://evilinsult.com/generate_insult.php?type=json`;
        let response = await axios.get(url).catch(err => {
            console.log(err);
            message.reply(`an error has occurred`);
        });

        let insult = response.data.insult;

        if(data.args.length > 0) {
            const user = GetUserFromMention(message, data.args.shift());

            if(!user) {
                return message.reply(`${insult}. (Also seems like you don't know how to ping someone properly).`);
            }

            return message.channel.send(`${user}, ${decode(insult)}`);

        }

        return message.channel.send(`${insult}`);
    }
}