module.exports = {
    name: 'pause',
    descripton: `Pauses the song, if there is one currently playing.
                    *aliases*: \`pause\`, \'pa\``,
    aliases: ['pa'],
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const musicPlayer = serverInfo.musicPlayer;

        if(serverInfo.connection && serverInfo.connection.dispatcher) {
            if(musicPlayer.playing) {
                serverInfo.connection.dispatcher.pause();
                musicPlayer.playing = false;
                message.channel.send('Paused');
            } else {
                if(serverInfo.connection.dispatcher.paused) {
                    serverInfo.connection.dispatcher.resume();
                    musicPlayer.playing = true;
                    message.channel.send('Resumed');
                } else {
                    message.reply(`nothing was paused`);
                }
            }
        } else {
            message.reply(`I'm not currently in a voice channel or there is currently no song playing to pause/resume!`);
        }
        
    }
}