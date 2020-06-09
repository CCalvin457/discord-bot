const { CreateQueue, LoadMusicCommands } = require('../utils/musicUtils.js');

let musicCommands = new Map();

module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    async execute(message, data) {
        if(!message.guild) return;

        const voiceChannel = message.member.voice.channel;
        const commandName = data.args.shift();

        if(!data.serverQueue) {
            CreateQueue(data.queue, message);
            data.serverQueue = data.queue.get(message.guild.id);
        }

        const argsData = {
            args: data.args,
            queue: data.queue,
            serverQueue: data.serverQueue,
            voiceChannel: voiceChannel
        }
        
        if(musicCommands.size == 0) {
            musicCommands = LoadMusicCommands();
        }

        if(!musicCommands.has(commandName)) return message.reply(`${commandName} is an invalid argument for the music command.`);

        const command = musicCommands.get(commandName);

        try{
            command.execute(message, argsData);
        } catch(error) {
            console.error(error);
        }
    }
}