const rp = require('request-promise');
const request = require('request');
const axios = require('axios');

var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

var landmarksWiki = ((address, callback) => {
    address = address.toLowerCase();
    address = address.replace(/\s/g, '-');
    var newAddress = encodeURI(address);
    console.log(newAddress);
    let options = {
        uri: `http://pakistani.pk/${newAddress}/`,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    console.log(options.uri);
    rp(options)
        .then(function ($) {
            // Process html like you would with jQuery... 
            console.log('WIKI');
            var json1 = {};
            json1['description'] = $('.jrListingFulltext').children().text();

            //console.log(json1['description']);
            //socket.emit('returnWikiData', json1);
            callback(json1);
        })
        .catch(function (err) {
            // Crawling failed or Cheerio choked... 
            //console.log("Error, not found")
            let json1 = {};
            callback(json1);
        });
});

var scrapeWiki = ((address, callback) => {

    var newAddress = encodeURI(address);
    //console.log(newAddress);
    let options = {
        uri: `https://en.wikipedia.org/wiki/${newAddress}`,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    console.log(options.uri);
    rp(options)
        .then(function ($) {
            // Process html like you would with jQuery... 
            console.log('WIKI');
            var json1 = {};

            $("table.infobox tr").each(function (tr_index, tr) {
                var th_text = $(this).find("th").text();
                var prop_name = th_text.trim().toLowerCase().replace(/[^a-z]/g, " ");

                json1[prop_name] = $(this).find("td").text();

                // if ({ "capital": 1 }[prop_name]) {
                //     //console.log('Capital: ');
                //     capital = $(this).find("td").text();
            });
            // console.log('scrapping done');
            //socket.emit('returnWikiData', json1);
            callback(json1);
        })
        .catch(function (err) {
            // Crawling failed or Cheerio choked... 
            //console.log("Error, not found")
            let json1 = {};
            callback(json1);
        });
})

module.exports = {
    scrapeWiki,
    landmarksWiki,
};

