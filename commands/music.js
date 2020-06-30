const { LoadMusicCommands } = require('../utils/musicUtils.js');
const Server = require('../utils/serverInfo.js');

let musicCommands = new Map();

module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    async execute(message, data) {
        if(!message.guild) return;

        const voiceChannel = message.member.voice.channel;
        const commandName = data.args.shift();

        if(!data.serverInfo) {
            // Create new serverinfo instance if it doesn't exist for the discord server
            let server = new Server(message);

            data.serverList.set(message.guild.id, server);

            data.serverInfo = server;
        }

        const argsData = {
            args: data.args,
            serverList: data.serverList,
            serverInfo: data.serverInfo,
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