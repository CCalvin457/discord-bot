const { ValidateVolume, SetVolume } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'v',
    description: 'Adjusts the volume of the bot',
    execute(message, data) {
        const value = data.args[0];
        if(value == null) {
            return message.reply('Please include a value between 0 and 1');
        }

        const volumeInfo = ValidateVolume(value);

        if(!volumeInfo.success) {
            return message.reply(volumeInfo.message);
        }

        data.serverInfo.volume = volumeInfo.value;
        data.serverList.set(message.guild.id, data.serverInfo);
        message.channel.send(`Volume has been set to ${(data.serverInfo.volume * 100)}%`);
    }
}