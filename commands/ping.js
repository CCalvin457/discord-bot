module.exports = {
    name: 'ping',
    description: 'Ping!',
    execute(message, data) {
        message.channel.send('Pong!');
    }
}