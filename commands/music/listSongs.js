const Discord = require('discord.js');

module.exports = {
    name: 'list',
    description: 'Adds a song (youtube url) into the song queue',
    async execute(message, data) {
        //TODO: add pagination
        const songList = data.serverInfo.songs;
        console.log(songList);
        if(songList.length == 0) {
            return message.channel.send('There are currently no songs in the queue.');
        }

        const songs = [];

        for(var i = 0; i < songList.length; i++) {
            let curSong = songList[i];
            songs.push({
                name: `${i + 1}. ${curSong.title}`,
                value: curSong.url
            });
        }

        const musicListEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Song List')
            .setDescription('Songs currently in the queue')
            .addFields(songs)

        message.channel.send(musicListEmbed);
    }
}