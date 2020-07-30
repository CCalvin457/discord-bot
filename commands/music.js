const { LoadMusicCommands } = require('../utils/musicUtils.js');
const EmbedData = require('../utils/embedData.js');

let musicCommands = new Map();

module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play. Type \`!music\` for more information.',
    aliases: ['m'],
    async execute(message, data) {
        if(!message.guild) return;

        const voiceChannel = message.member.voice.channel;
        const commandName = data.args.shift();

        if(commandName === undefined) {
            let title = 'Music Help';
            let description = 'Here are the music commands I can use!';
            let embedData = new EmbedData(title, description, undefined, data.help.get(this.name)).GenerateEmbed();
            return message.channel.send(embedData)
        }

        const argsData = {
            args: data.args,
            serverList: data.commandData.serverList,
            serverInfo: data.commandData.serverInfo,
            voiceChannel: voiceChannel
        }
        
        if(musicCommands.size == 0) {
            musicCommands = LoadMusicCommands();
        }

        if(!musicCommands.has(commandName) && !musicCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))) 
            return message.reply(`${commandName} is an invalid argument for the music command.`);

        const command = musicCommands.get(commandName) || musicCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        try{
            command.execute(message, argsData);
        } catch(error) {
            console.error(error);
        }
    }
}