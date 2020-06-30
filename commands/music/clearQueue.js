module.exports = {
    name: 'c',
    description: 'Removes all songs from the queue',
    execute(message, data) {

        if(data.serverList.playing) {
            data.serverList.songs.slice(0, 1);
        } else {
            data.serverList.songs = [];
        }

        message.channel.send('All songs have been cleared from the queue.');
    }
}