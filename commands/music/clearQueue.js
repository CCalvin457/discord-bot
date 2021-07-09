module.exports = {
    name: 'clear',
    description: `Removes all songs from the queue. If a song is playing, it will continue to play.
                    *aliases*: \`clear\`, \`c\``,
    aliases: ['c'],
    execute(message, data) {
        // const serverList = data.serverList;
        const musicPlayer = data.serverInfo.musicPlayer;

        if(musicPlayer.songs) {
            musicPlayer.songs.splice(0, musicPlayer.songs.length);
        }

        // serverList.set(message.guild.id, data.serverInfo);

        message.channel.send('All songs have been cleared from the queue.');
    }
}