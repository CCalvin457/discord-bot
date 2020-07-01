const { JoinChannel, Play, CreateSongList, QueueSongs, SongListForEmbed } = require('../../utils/musicUtils.js');
const { database } = require('../../utils/firestore.js');
const Discord = require('discord.js');
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
                        // If there are multiple songs which have the same name, we let the user select which song to play or add to the queue
                        // Maybe separate some of these into their own functions?
                        let querySongs = [];
                        results.docs.forEach(result => {
                            querySongs.push(result.data());
                        });

                        const songList = SongListForEmbed(querySongs);

                        // filter for user input
                        const filter = response => {
                            return !isNaN(response.content) && (response.content > 0 && response.content <= querySongs.length);
                        }

                        const songListEmbed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle('Song List')
                            .setDescription('Which song did you want to play?')
                            .addFields(songList);
                        
                        // Allows users to input a number to select which song to play or add to the queue
                        message.channel.send(songListEmbed);

                        const songSelect = await message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
                            .then(collected => {
                                const index = collected.first().content - 1;
                                return querySongs[index];
                            })
                            .catch(() => {
                                return false;
                            });

                        if(!songSelect) {
                            return message.channel.send('Song selection timed out.');
                        } else {
                            song = songSelect.url;
                        }
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
            if(!data.serverInfo.playing) {
                Play(data.serverList, message.guild, songs[0]);
            }
        }
    }
}