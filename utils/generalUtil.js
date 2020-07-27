const { MessageEmbed } = require('discord.js');
function GenerateEmbed(data) {
    const embed = new MessageEmbed()
        .setColor(data.color)
        .setTitle(data.title)
        .setDescription(data.description)
        .addFields(data.fields);

    return embed;
}

module.exports = {
    GenerateEmbed
}