const ytdl = require('ytdl-core');
const { database } = require('../../utils/firestore.js');
module.exports = {
    name: 'fav',
    description: '¯\_(ツ)_/¯',
    async execute(message, data) {
        const guildID = message.guild.id;
        const song = data.args.shift();
        var alias = '';

        if(song === undefined) {
            return message.reply(`To favourite a song please provide atleast a youtube video.`);
        }

        if(!ytdl.validateURL(song)) {
            return message.reply(`${song} is not a valid youtube url!`);
        }

        if(data.args[0] === null || data.args[0] === undefined) {
            const songInfo = await ytdl.getBasicInfo(song);
            alias = songInfo.videoDetails.title;
        } else {
            data.args.forEach(arg => {
                alias += arg + ' ';
            });
    
            alias = alias.trim();
        }

        database.collection('favouriteSongs').doc(guildID).set({
            [alias]: song
        }, { merge: true });

        message.reply(`${alias} has been favourited!`);
    }
}