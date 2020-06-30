const { JoinChannel, Play, UpdateQueue, QueueSongs } = require('../../utils/musicUtils.js');
const { database } = require('../../utils/firestore.js');
module.exports = {
    name: 'p',
    description: `Plays a song given a youtube url. If a song is already playing, it will queue the song instead
If no url is given it will play the first song in the queue, provided something is there`,
    async execute(message, data) {
        const bot = message.guild.me;
        let songs = data.serverInfo.songs;
        if(data.args[0] == null && data.serverInfo.songs.length == 0) {
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

                // find all songs that contains the query
                const results = await database.collection('servers').doc(message.guild.id).collection('favouriteSongs').where('name', '==', query).get();

                if(!results.empty) {
                    if(results.docs.length === 1) {
                        song = results.docs[0].data().url;
                    } else {
                        let querySongs = [];
                        results.docs.forEach(result => {
                            querySongs.push(result.data());
                        });
                        
                        querySongs.forEach(song => {
                            console.log(song);
                        });
                    }
                } else {
                    return message.reply(`Could not find '${query}'.`);
                }
            }
            await QueueSongs(data.serverList, message, [song]);
        }

        if(bot.voice.channel == null || bot.voice.channel != data.voiceChannel) {
            JoinChannel(message).then(connection => {
                data.serverInfo.UpdateServerConnectionInfo(data.serverList, message, data.voiceChannel, connection);
                Play(data.serverList, message.guild, songs[0]);
            }).catch(error => {
                return message.reply(error);
            });
        } else {
            console.log('already in correct channel');
            console.log(data.serverInfo.playing);
            if(!data.serverInfo.playing) {
                console.log('wat');
                Play(data.serverList, message.guild, songs[0]);
            }
        }
    }
}