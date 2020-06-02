module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    async execute(message, args) {
        // code here
        if(!message.guild) return;

        const channel = message.member.voice.channel;
        const bot = message.guild.me;

        switch(args[0]) {
            case 'j':
                if(channel) {
                    const connection = await channel.join();
                } else {
                    message.reply('You need to join a voice channel first!');
                }
                break;
            case 'l':
                if(bot.voice.channel != null) {
                    bot.voice.channel.leave();
                    message.channel.send('Successfully left the voice channel!');
                } else {
                    message.reply('I\'m not currently in a voice channel!');
                }
                // channel.leave();
                break;
        }
    }
}