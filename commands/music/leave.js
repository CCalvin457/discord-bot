const { LeaveChannel } = require('../../utils/musicUtils');
module.exports = {
    name: 'leave',
    description: `Leaves the voice channel.
                    *aliases*: \`leave\`, \`l\``,
    aliases: ['l'],
    execute(message, data) {
        const bot = message.guild.me;
        const serverInfo = data.serverInfo;
        // const serverList = data.serverList;

        // const server = {
        //     serverInfo: serverInfo,
        //     serverList: serverList
        // }

        let response = LeaveChannel(serverInfo, bot);

        if(!response) {
            return message.reply('I\'m not currently in a voice channel!');   
        }
        return message.channel.send('Successfully left the voice channel!');
    }
}