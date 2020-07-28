module.exports = {
    name: 'weather',
    description: 'Retrieves the current weather based on the location specified.',
    execute(message, data) {
        message.channel.send('Pong!');
    }
}