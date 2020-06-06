const Discord = require('discord.js');
module.exports = {
    name: 'np',
    description: 'Displays the currently playing song',
    execute(message, data) {
        if(!data.serverQueue.playing) {
            return message.reply('no song currently playing');
        }
        
        const currentSong = data.serverQueue.nowPlaying;

        const curSongEmbed = new Discord.MessageEmbed()
            .setColor('#a6f87e')
            .setTitle('Now Playing')
            .addField(currentSong.title, currentSong.url)

        message.channel.send(curSongEmbed);
    }
}