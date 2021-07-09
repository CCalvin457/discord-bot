module.exports = {
    name: 'pause',
    descripton: `Pauses the song, if there is one currently playing.
                    *aliases*: \`pause\`, \'pa\``,
    aliases: ['pa'],
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const musicPlayer = serverInfo.musicPlayer;

        if(musicPlayer.playing){
            serverInfo.connection.dispatcher.pause();
            musicPlayer.playing = false;
            message.channel.send('Paused');
        } else {
            serverInfo.connection.dispatcher.resume();
            musicPlayer.playing = true;
            message.channel.send('Resumed');
        }
    }
}