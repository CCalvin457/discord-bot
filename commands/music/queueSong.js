const { QueueSongs, QueuePlaylist } = require('../../utils/musicUtils.js');
const ytpl = require('ytpl');

module.exports = {
    name: 'q',
    description: 'Adds a song (youtube url or playlist) into the song queue',
    async execute(message, data) {
        var songList;
        if(data.args[0] == null) {
            return message.reply('Please include a youtube url');
        }
        
        if(data.args[0] === '-pl') {
            const playlistUrl = data.args[1];
            // Queues songs inside a youtube playlist, only one playlist at a time
            if(playlistUrl == null) {
                return message.reply('Please include a youtube playlist url or id');
            }

            try {
                const playlist = await ytpl(playlistUrl, {limit: 0});

                songList = playlist.items;
                QueuePlaylist(data.serverList, message, songList);
            } catch(error) {
                return message.reply(`${playlistUrl} is not a valid youtube playlist url or id`);
            }
            
        } else {
            // Queues song(s) via youtube url
            songList = data.args;
            await QueueSongs(data.serverList, message, songList);
        }
    }
}