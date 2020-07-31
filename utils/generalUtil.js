const { MessageEmbed } = require('discord.js');

function GenerateEmbed(data) {
    const embed = new MessageEmbed()
        .setColor(data.color)
        .setTitle(data.title)
        .setDescription(data.description)
        .addFields(data.fields);

    return embed;
}

function GenerateRandomNumber() {
    let seed = new Date().getTime();

        seed ^= seed << 13;
        seed ^= seed >> 17;
        seed ^= seed << 5;

        seed = seed < 0 ? ~seed + 1 : seed;

        return seed;
}

module.exports = {
    GenerateEmbed,
    GenerateRandomNumber
}