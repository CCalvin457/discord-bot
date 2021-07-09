const { Repeat } = require('../../utils/repeatEnum.js');
module.exports = {
    name: 'repeat',
    description: `Allows the user to repeat \`on\`, \`one\`, or \`off\`. By default this is set to \`off\`.
                    *aliases*: \`repeat\`, \`r\``,
    aliases: ['r'],
    execute(message, data) {
        const serverInfo = data.serverInfo;
        // const serverList = data.serverList;

        let argument = data.args[0] == null ? null : data.args[0].toLowerCase();
        
        if(argument === null ||
            !(argument === Repeat.On || argument === Repeat.One || argument === Repeat.Off)) {
            return message.reply(`Please specify argument for repeat [on|one|off]`);
        }

        serverInfo.musicPlayer.repeat = argument;
        // serverList.set(message.guild.id, serverInfo);

        if(argument === Repeat.On) {
            message.channel.send(`Repeating whole playlist.`);
        } else if(argument === Repeat.One) {
            message.channel.send(`Repeating one song.`);
        } else {
            message.channel.send(`Repeating disabled.`);
        }
    }
}