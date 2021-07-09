const EmbedData = require("../Classes/embedData");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'help',
    description: `Displays a list of commands and what they do.
                    *aliases*: \`help\`, \`commands\``,
    aliases: ['commands'],
    async execute(message, data) {
        let title = 'AYAYAYAYAYAYA';
        let description = 'Here is a list of the commands I can use!';
        let embedData = new EmbedData(title, description, undefined, data.help.get(this.name)).GenerateEmbed();

        message.channel.send(embedData);
    }
}