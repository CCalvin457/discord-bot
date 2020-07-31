const { GenerateRandomNumber } = require('../utils/generalUtil');

module.exports = {
    name: 'choose',
    description: `Input a bunch of items and I will select one of them for you!
                    e.g. \`!choose <item1 item2 item3...>\`
                    *aliases*: \`choose\`, \`ch\``,
    aliases: ['ch'],
    execute(message, data) {
        if(data.args.length <= 1) {
            return message.reply(`Please provide at least 2 items!`);
        }

        let random = GenerateRandomNumber();
        let index = random % data.args.length;

        return message.channel.send(`I choose... ${data.args[index]}!`);
    }
}