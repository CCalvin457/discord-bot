const moment = require('moment');
const EmbedData = require('../Classes/embedData');
const axios = require('axios').default;

module.exports = {
    name: 'weather',
    description: `Retrieves the current weather based on the location specified. Example usage: \`!weather toronto\`
                    *aliases*: \`weather\`, \`w\``,
    aliases: ['w'],
    async execute(message, data) {
        let location = data.args[0];

        if(location === undefined) {
            return message.reply('Please include a location! e.g. \`!weather toronto\`');
        }

        let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.WEATHER_API}`;
        let response = await axios.get(url).catch(err => {
            console.log(err);
            return message.reply(`${location} could not be found.`);
        });

        let tempData = response.data;
        let windSpeed = tempData.wind.speed * 3.6;
        let unixSunrise = tempData.sys.sunrise + tempData.timezone;
        let unixSunset = tempData.sys.sunset + tempData.timezone;

        let sunrise = moment.unix(unixSunrise).utc().format('hh:mm a');
        let sunset = moment.unix(unixSunset).utc().format('hh:mm a');
        
        let weatherData = [
            {name: 'Current Temperature', value: `${tempData.main.temp} celsius`},
            {name: 'Feels Like', value: `${tempData.main.feels_like} celsius`},
            {name: 'Humidity', value: `${tempData.main.humidity}%`},
            {name: 'Wind Speed', value: `${windSpeed.toFixed(2)} km/h`},
            {name: 'Sunrise', value: sunrise},
            {name: 'Sunset', value: sunset}
        ]

        let title = `Current weather in ${tempData.name}`;
        
        let embedData = new EmbedData(title, undefined, undefined, weatherData).GenerateEmbed();

        message.channel.send(embedData);

        // message.reply(`It is currently ${response.data.main.temp} degrees celsius in ${location}`);
    }
}