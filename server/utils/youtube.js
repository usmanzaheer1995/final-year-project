var YouTube = require('youtube-node');

var scrapeVideos = ((address, callback) => {
    console.log('videos');
    //console.log(address);
    var youTube = new YouTube();
    youTube.setKey('AIzaSyAhYlzJrh5hdjCLLIg3-OWnsrccBziPfDQ');
    youTube.addParam("type", 'video');
    youTube.search(address + " facts", 2, function (error, result) {
        console.log('facts');
        if (error) {
            console.log(error);
        }
        else {
            // console.log(JSON.stringify(result.items[i].id.videoId, null, 2));
            // console.log(JSON.stringify(result.items[i].snippet.title, null, 2));
            //socket.emit('videosData', result);
            callback(result);
        }
    });
    youTube.search(address + " documentary", 2, function (error, result) {
        console.log('documentary');
        if (error) {
            console.log(error);
        }
        else {
            //socket.emit('videosData', result);
            callback(result);
        }
    });

    youTube.search(address + " best resturants", 2, function (error, result) {
        console.log('food');
        if (error) {
            console.log(error);
        }
        else {
            //socket.emit('videosData', result);
            callback(result);
        }
    });
});

module.exports = {
    scrapeVideos,
};


