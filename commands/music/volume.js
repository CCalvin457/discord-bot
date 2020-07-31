const { ValidateVolume } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'volume',
    description: `Adjusts the playback volume.
                    *aliases*: \`volume\`, \`vol\`, \`v\``,
    aliases: ['v', 'vol'],
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;
        const value = data.args[0];
        if(value == null) {
            return message.reply('Please include a value between 0 and 1');
        }

        const volumeInfo = ValidateVolume(value);

        if(!volumeInfo.success) {
            return message.reply(volumeInfo.message);
        }

        serverInfo.volume = volumeInfo.value;
        serverList.set(message.guild.id, serverInfo);
        message.channel.send(`Volume has been set to ${(serverInfo.volume * 100)}%`);
    }
}