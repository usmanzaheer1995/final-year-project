const rp = require('request-promise');
const request = require('request');
const axios = require('axios');

var NodeGeocoder = require('node-geocoder');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

var scrapeBlogs = ((address, callback) => {
    console.log('BLOGS');
    let blogs = {}
    let options = {
        uri: `http://blogs.tribune.com.pk/tag/${address}/`,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    rp(options)
        .then(function ($) {
            var abc = $('.page-content').find('.story').find('.title').find('a')
            for (let i = 0; i < abc.length; ++i) {

                blogs['title'] = abc[i].attribs.title;
                blogs['link'] = abc[i].attribs.href;

                //console.log(blogs['title']);
                //console.log(blogs['link']);
                //socket.emit('blogsData', blogs);
                callback(blogs);
            }
        })
        .catch(function (err) {
            // Crawling failed or Cheerio choked... 
        });
});

module.exports = {
    scrapeBlogs,
};

// var a = 'my name is usman and usman is my name'
// var count = (a.match(/usman/g) || []).length;
// //console.log(count)
// if(a.includes('usman')){
//     console.log((a.match(/usman/g) || []).length)
//     console.log('true')
// }