const { JoinChannel, Play, QueueSongs, SongListForEmbed, GetFavouriteSong } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'play',
    description: `Plays a song given a youtube url. If a song is already playing, it will queue the song instead.
                    If no song is provided it will play the first song in the queue.
                    You can use the \`-f\` argument followed by a search term to search for a song from this server's favourites list.
                    *aliases*: \`play\`, \`p\``,
    aliases: ['p'],
    async execute(message, data) {
        const bot = message.guild.me;
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;
        let songs = serverInfo.songs;
        if(data.args[0] == null && songs.length == 0) {
            return message.reply('Please specify the song you wish to play by entering a youtube url');
        }
        
        if(data.args[0] != null) {
            let song = data.args.shift();
            if(song === '-f') {
                // setup user query
                let query = '';
                
                data.args.forEach(arg => {
                    query += arg + ' ';
                });
        
                query = query.trim();

                let result = await GetFavouriteSong(message, message.guild.id, query);

                if(result === undefined) {
                    return message.channel.send(`${query} could not be found.`);
                }

                song = result;
            }
            await QueueSongs(serverList, message, [song]);
        }

        if(bot.voice.channel == null || bot.voice.channel != data.voiceChannel) {
            JoinChannel(message).then(connection => {
                serverInfo.UpdateServerConnectionInfo(serverList, message, data.voiceChannel, connection);
                Play(serverList, message.guild, songs[serverInfo.currentSongIndex]);
            }).catch(error => {
                return message.reply(error);
            });
        } else {
            console.log('already in correct channel');
            if(!serverInfo.playing) {
                Play(serverList, message.guild, songs[serverInfo.currentSongIndex]);
            }
        }
    }
}