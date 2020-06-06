module.exports = {
    name: 'c',
    description: 'Removes all songs from the queue',
    execute(message, data) {
        data.serverQueue.songs = [];

        message.channel.send('All songs have been cleared from the queue');
    }
}