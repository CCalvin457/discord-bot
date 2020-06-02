const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');

const client = new Discord.Client();
dotenv.config();

const botToken = process.env.BOT_TOKEN;
const PREFIX = '!';

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if(!msg.content.startsWith(PREFIX) || msg.author.bot) return;

    const args = msg.content.slice(PREFIX.length).split(' ');
    const command = args.shift().toLowerCase();

    if(!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(msg, args);
    } catch(error) {
        console.error(error);
    }
});

client.login(botToken);