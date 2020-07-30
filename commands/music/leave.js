module.exports = {
    name: 'leave',
    description: 'Leaves the voice channel.',
    aliases: ['l'],
    execute(message, data) {
        const bot = message.guild.me;
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;
        if(bot.voice.channel != null) {
            serverInfo.ClearServerConnectionInfo(serverList, message.guild.id);

            bot.voice.channel.leave();
            
            return message.channel.send('Successfully left the voice channel!');
        } else {
            return message.reply('I\'m not currently in a voice channel!');
        }
    }
}