const { Repeat } = require('../../utils/repeatEnum.js');
module.exports = {
    name: 'r',
    description: 'Manages song repeat',
    execute(message, data) {
        let argument = data.args[0] == null ? null : data.args[0].toLowerCase();
        
        if(argument === null ||
            !(argument === Repeat.On || argument === Repeat.One || argument === Repeat.Off)) {
            return message.reply(`Please specify argument for repeat [on|one|off]`);
        }

        data.serverInfo.repeat = argument;
        data.serverList.set(message.guild.id, data.serverInfo);

        if(argument === Repeat.On) {
            message.channel.send(`Repeating whole playlist.`);
        } else if(argument === Repeat.One) {
            message.channel.send(`Repeating one song.`);
        } else {
            message.channel.send(`Repeating disabled.`);
        }
    }
}