const ytdl = require('ytdl-core');

async function JoinChannel(message) {
    const voiceChannel = message.member.voice.channel;

    if(!voiceChannel) {
        return message.reply('You need to be in a voice channel first!');
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.reply('I need the permissions to join and speak in your voice channel!');
    }

    const connection = await voiceChannel.join();

    return connection;
}

function CreateQueue(queue, message, voiceChannel = null, connection = null) {
    const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: connection,
        songs: [],
        volume: 0.5,
        playing: false
    }

    queue.set(message.guild.id, queueConstruct);
}

function UpdateQueue(queue, message, voiceChannel, connection) {
    const serverQueue = queue.get(message.guild.id);

    serverQueue.textChannel = message.channel;
    serverQueue.voiceChannel = voiceChannel;
    serverQueue.connection = connection;

    queue.set(message.guild.id, serverQueue);
}


function Play(queue, guild, song) {
    const serverQueue = queue.get(guild.id);

    if(!song) {
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url, {filter: "audioonly"}))
        .on('finish', () => {
            serverQueue.songs.shift();
            Play(queue, guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    
    dispatcher.setVolumeLogarithmic(serverQueue.volume);
    serverQueue.textChannel.send(`Start Playing: ***${song.title}***`);
}

function SetVolume(queue, guild, vol) {
    const serverQueue = queue.get(guild.id);

    serverQueue.volume = vol;

    queue.set(guild.id, serverQueue);
}

module.exports = {
    JoinChannel,
    CreateQueue,
    UpdateQueue,
    Play,
    SetVolume
}