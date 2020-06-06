
module.exports = {
    name: 'l',
    description: 'Tells the bot to leave the voice channel.',
    execute(message, data) {
        const bot = message.guild.me;
        if(bot.voice.channel != null) {
            data.serverQueue.connection = null;
            data.serverQueue.voiceChannel = null;
            data.serverQueue.playing = false;
            data.serverQueue.nowPlaying = {};

            data.queue.set(message.guild.id, data.serverQueue);

            bot.voice.channel.leave();
            
            return message.channel.send('Successfully left the voice channel!');
        } else {
            return message.reply('I\'m not currently in a voice channel!');
        }
    }
}