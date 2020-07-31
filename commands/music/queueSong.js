const { QueueSongs, QueuePlaylist, GetFavouriteSong } = require('../../utils/musicUtils.js');
const ytpl = require('ytpl');

module.exports = {
    name: 'queue',
    description: `Adds a song (youtube url or playlist) into the song queue.
                    To add a playlist use the \`-pl\` argument followed by the youtube playlist url.
                    To add a song from this server's favourites list use the \`-f\` argument followed by a search term.
                    *aliases*: \`queue\`, \`q\``,
    aliases: ['q'],
    async execute(message, data) {
        const serverList = data.serverList;
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
                QueuePlaylist(serverList, message, songList);
            } catch(error) {
                return message.reply(`${playlistUrl} is not a valid youtube playlist url or id`);
            }
            
        } else if(data.args[0] === '-f') {
            let queryArr = data.args.splice(1, data.args.length - 1);
             // setup user query
             let query = '';
                
             queryArr.forEach(arg => {
                 query += arg + ' ';
             });
     
             query = query.trim();

             song = await GetFavouriteSong(message, message.guild.id, query);

            if(song === undefined) {
                return message.channel.send(`${query} could not be found`);                
            } 

            await QueueSongs(serverList, message, [song]);
        } else {
            // Queues song(s) via youtube url
            songList = data.args;
            await QueueSongs(serverList, message, songList);
        }
    }
}