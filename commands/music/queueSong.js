const {CreateSongInfo} = require('../../utils/musicUtils.js');

module.exports = {
    name: 'q',
    description: 'Adds a song (youtube url) into the song queue',
    async execute(message, data) {
        if(data.args[1] == null) {
            return message.reply('Please include a youtube url');
        }

        const song = await CreateSongInfo(data.args[1]);

        data.serverQueue.songs.push(song);

        message.reply(`${song.title} has been added to the queue!`);
    }
}