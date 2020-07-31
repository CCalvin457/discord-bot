const { SongListForEmbed } = require('../../utils/musicUtils.js');
const EmbedData = require('../../utils/embedData.js');
const { GenerateEmbed } = require('../../utils/generalUtil.js');

module.exports = {
    name: 'list',
    description: `Lists all the songs that are currently in the queue.
                    *aliases*: \`list\`, \`li\``,
    aliases: ['li'],
    async execute(message, data) {
        const serverInfo = data.serverInfo;
        const songList = serverInfo.songs;

        console.log(songList);

        if(songList.length == 0) {
            return message.channel.send('There are currently no songs in the queue.');
        }

        const songs = SongListForEmbed(songList);
        let start = 0;
        let title = `Songs ${start + 1}-${songs.length > 10 ? start + 10 : songs.length} of ${songs.length}`;
        let colour = '0099ff';
        let fields = songs.slice(start, start + 10);

        let embedData = new EmbedData(title, undefined, colour, fields);

        let musicListEmbed = GenerateEmbed(embedData);

        message.channel.send(musicListEmbed).then(message => {
            if(songs.length <= 10) return;

            message.react('➡️');

            const collector = message.createReactionCollector(
                (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && (user.id !== message.client.user.id),
                {time: 60000}
            );

            let currentIndex = 0;
            collector.on('collect', reaction => {
                message.reactions.removeAll().then(async () => {
                    reaction.emoji.name === '⬅️' ? currentIndex -= 10 : currentIndex += 10;
                    fields = songs.slice(currentIndex, currentIndex + 10);
                    embedData.fields = fields;

                    message.edit(GenerateEmbed(embedData));

                    if (currentIndex !== 0) await message.react('⬅️');
                    if (currentIndex + 10 < songs.length) message.react('➡️');
                });
            });
        });
    }
}