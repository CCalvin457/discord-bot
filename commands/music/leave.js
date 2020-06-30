module.exports = {
    name: 'l',
    description: 'Tells the bot to leave the voice channel.',
    execute(message, data) {
        const bot = message.guild.me;
        if(bot.voice.channel != null) {
            data.serverInfo.ClearServerConnectionInfo(data.serverList, message.guild.id);

            bot.voice.channel.leave();
            
            return message.channel.send('Successfully left the voice channel!');
        } else {
            return message.reply('I\'m not currently in a voice channel!');
        }
    }
}