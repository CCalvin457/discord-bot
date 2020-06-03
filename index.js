const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
// const ytdl = require('ytdl-core');

const client = new Discord.Client();
dotenv.config();

const botToken = process.env.BOT_TOKEN;
const PREFIX = '!';

// Creating an empty collection to store our commands
client.commands = new Discord.Collection();

// Looking for all .js files inside the commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const queue = new Map();

// Adding all commands into the empty collection, 'client.commands'
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if(!msg.content.startsWith(PREFIX) || msg.author.bot) return;

    let serverQueue = queue.get(msg.guild.id);
    const args = msg.content.slice(PREFIX.length).split(' ');
    const commandName = args.shift().toLowerCase();

    const data = {
        args: args,
        serverQueue: serverQueue,
        queue: queue
    }

    if(!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(msg, data);
    } catch(error) {
        console.error(error);
    }
});

client.login(botToken);