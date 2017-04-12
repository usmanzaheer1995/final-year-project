const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const rp = require('request-promise');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();

var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on(`connection`, (socket) => {

    console.log('new user connection');

    socket.on('scrapeWikiAddress', (address) => {
        var cheerio = require('cheerio'); // Basically jQuery for node.js 

        console.log('scraping wiki');
        //console.log(address.address);
        

        //console.log(json);

        var newAddress = address.address;
        newAddress = encodeURI(newAddress);

        var options = {
            uri: `https://en.wikipedia.org/wiki/${newAddress}`,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        console.log(options.uri);
        rp(options)
            .then(function ($) {
                // Process html like you would with jQuery... 
                var capital, population, demonym, religion;
                var json = {};

                $("table.geography tr").each(function (tr_index, tr) {

                    var th_text = $(this).find("th").text();
                    var prop_name
                        = th_text.trim().toLowerCase().replace(/[^a-z]/g, " ");

                    //var propname2 = th_text.toLowerCase().replace(/[^a-z]/g, " ");

                    //console.log(`${propname2}: `, $(this).find("td").text());
                    //console.log(`${propname2}`);
                    json[prop_name] = $(this).find("td").text();

                    // if ({ "capital": 1 }[prop_name]) {
                    //     //console.log('Capital: ');
                    //     capital = $(this).find("td").text();

                    //     //console.log(capital);
                    //     json.capital = capital;
                    //     //console.log(json.capital);

                    // }
                    // if ({ "estimate": 1 }[prop_name]) {

                    //     //console.log('population: ');
                    //     population = $(this).find("td").text();

                    //     //console.log(population);
                    //     json.population = population;

                    // }

                    // if ({ "demonym": 1 }[prop_name]) {
                    //     //console.log('demonym: ');
                    //     demonym = $(this).find("td").text();

                    //     //console.log(demonym);
                    //     json.demonym = demonym;

                    // }

                    // if ({ "religion": 1 }[prop_name])   //religion
                    // {
                    //     //console.log('Religion: ');
                    //     religion = $(this).find("td").text();

                    //     //console.log(religion);
                    //     json.religion = religion;

                    // }
                });
                // console.log(JSON.stringify(json, undefined, 2));
                console.log('scrapping done');
                socket.emit('returnScrapeData', json);
            })
            .catch(function (err) {
                // Crawling failed or Cheerio choked... 
            });
    });

});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});