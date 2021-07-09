const { Play } = require('../../utils/musicUtils.js');
const { Repeat } = require('../../utils/repeatEnum');

module.exports = { 
    name: 'skip',
    description: `Allows the user to skip a number of songs by specifying a number after the command. 
                    If no number is provided then the first song in the queue will be skipped.
                    Note: Skipped songs are removed from the queue.
                    *aliases*: \`skip\`, \`s\``,
    aliases: ['s'],
    execute(message, data) {
        // const serverInfo = data.serverInfo;
        const serverList = data.serverList;
        const musicPlayer = data.serverInfo.musicPlayer;

        if(musicPlayer.songs.length == 0) {
            return message.reply('There are no songs in the queue.');
        }

        const currentSongs = musicPlayer.songs;
        let songIndex = musicPlayer.currentSongIndex;
        let value = data.args[0];

        if(value != null) {
            if(!isNaN(value)) {
                value = parseInt(value);
                let maxSongsLength = currentSongs.length - songIndex;
                // if the number of songs the user wants to skip exceeds the number of songs remaining in the queue, set songIndex to 0 instead
                songIndex = value < maxSongsLength ? (songIndex + value) : 0;
                message.channel.send(`Skipped ${value < maxSongsLength ? value : maxSongsLength} song(s)!`);
            } else {
                return message.reply('Please enter a valid number.');
            }
        } else {
            let skippedSong = currentSongs[songIndex];
            songIndex = (songIndex + 1) < currentSongs.length ? (songIndex + 1) : 0;
            message.channel.send(`${skippedSong.title} has been skipped!`);
        }
        
        musicPlayer.currentSongIndex = songIndex;

        if(musicPlayer.playing) {
            // if there was a song playing while skipping, check to see if repeat is on and if the songIndex is 0
            // if we skip over the last song in the list with repeat off it should stop playing music
            if(musicPlayer.repeat === Repeat.Off && songIndex === 0) {
                songIndex = -1;
            }

            musicPlayer.currentSongIndex = songIndex;
            Play(serverList, message.guild, currentSongs[songIndex]);
        }
        
        // serverList.set(message.guild.id, serverInfo);
    }
}