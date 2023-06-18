import http, { request } from "http";
import fs, { readFileSync } from "fs";
import requests from "requests";
import axios from "axios";


const frontEndFile = fs.readFileSync("home.html", "utf-8");

async function fetchCityByIP(ip) {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        const city = response.data.city;
        return city;
    } catch (error) {
        console.log('Error:', error.message);
        return null;
    }
}

let userCity = 'California';
const frontApi = "https://api.openweathermap.org/data/2.5/weather?q=";
const backApi = "&appid=9de87523a365ddda49574cab759c14a7";

const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%Temperature%}", (orgVal.main.temp - 273.15).toFixed(2));
    temperature = temperature.replace("{%TemperatureMin%}", (orgVal.main.temp_min - 273.15).toFixed(2));
    temperature = temperature.replace("{%TemperatureMax%}", (orgVal.main.temp_max - 273.15).toFixed(2));
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%Country%}", orgVal.sys.country);
    temperature = temperature.replace("{%TemperatureStatus%}", orgVal.weather[0].main);

    return temperature;
};

const server = http.createServer((req, res) => {

    const ip = req.socket.remoteAddress;
    console.log(ip);
    fetchCityByIP(ip)
        .then(city => {
            if (city) {
                console.log('User city:', city);
                // Proceed with fetching weather information for the city
            } else {
                console.log('Unable to fetch user city.');
            }
        });

    if (req.url == "/") {

        requests(frontApi + userCity + backApi)
            .on('data', (chunk) => {
                const obj = JSON.parse(chunk);
                const apiData = [obj];
                const realTimeData = apiData.map((val) => replaceVal(frontEndFile, val)).join("");
                res.write(realTimeData);
            })
            .on('end', (err) => {
                if (err) return console.log('connection closed due to errors', err);
                res.end();
            });
    } else {
        res.end("File not found");
    }
});

server.listen(8000, "127.0.0.1");