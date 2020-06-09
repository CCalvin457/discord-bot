const { QueueSongs } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'q',
    description: 'Adds a song (youtube url) into the song queue',
    async execute(message, data) {
        if(data.args[0] == null) {
            return message.reply('Please include a youtube url');
        }

        QueueSongs(data.queue, message, data.args);
    }
}