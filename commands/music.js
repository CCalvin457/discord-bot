const { JoinChannel } = require('../utils/musicUtils.js');
const ytdl = require('ytdl-core');
module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    async execute(message, args) {
        console.log(args);
        if(!message.guild) return;

        const channel = message.member.voice.channel;
        const bot = message.guild.me;

        var connection = null;

        switch(args[0]) {
            case 'j':
                JoinChannel(message);
                break;
            case 'l':
                if(bot.voice.channel != null) {
                    bot.voice.channel.leave();
                    message.channel.send('Successfully left the voice channel!');
                } else {
                    message.reply('I\'m not currently in a voice channel!');
                }
                break;
            case 'p':
                if(args[1] == null) {
                    console.log('empty');
                    return;
                }
                
                JoinChannel(message).then(connection => {
                    connection.play(ytdl(args[1], { filter: 'audioonly' }));
                });
                break;
            default:
                message.reply('Invalid argument(s)');
        }
    }
}