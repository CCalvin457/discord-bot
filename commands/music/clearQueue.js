module.exports = {
    name: 'c',
    description: 'Removes all songs from the queue',
    execute(message, data) {

        if(data.serverQueue.playing) {
            data.serverQueue.songs.slice(0, 1);
        } else {
            data.serverQueue.songs = [];
        }

        message.channel.send('All songs have been cleared from the queue.');
    }
}