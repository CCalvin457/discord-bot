module.exports = {
    name: 'ping',
    description: 'Pong!',
    execute(message, data) {
        message.channel.send('Pong!');
    }
}