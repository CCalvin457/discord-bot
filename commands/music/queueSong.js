const {CreateSongInfo} = require('../../utils/musicUtils.js');

module.exports = {
    name: 'q',
    description: 'Adds a song (youtube url) into the song queue',
    async execute(message, data) {
        if(data.args[1] == null) {
            return message.reply('Please include a youtube url');
        }

        let song = {};
        
        
        try {
            // Try to create song info from given url
            song = await CreateSongInfo(data.args[1]); 
        } catch(error) {
            // error should occur when the url given is invalid
            return message.reply(error);
        }

        console.log(`Pushing song into the queue...`);
        data.serverQueue.songs.push(song);
        return message.reply(`${song.title} has been added to the queue!`);

    }
}