async function JoinChannel(message) {
    const channel = message.member.voice.channel;

    if(channel) {
        const connection = await channel.join();

        return connection;
    } else {
        message.reply('You need to join a voice channel first!');
    }
}

module.exports = {
    JoinChannel
}