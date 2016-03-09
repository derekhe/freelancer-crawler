require("babel-register");
var fs = require('fs-extra');
var request = require('request');
var async = require('async');
var logger = require("log4js").getDefaultLogger();
var Agent = require('socks5-https-client/lib/Agent');

fs.ensureDir("./out");

var q = async.queue(function (id, callback) {
    var filename = `out/${id}.json`;

    if (fs.existsSync(filename)) {
        console.log("Skip " + id);
        q.push(id + 1);
        callback();
        return
    }

    var url = `https://www.freelancer.com/api/projects/0.1/projects/${id}/?compact=true&full_description=true&job_details=true&location_details=true&selected_bids=true&upgrade_details=true&user_avatar=true&user_details=true&user_employer_reputation=true&user_reputation=true&user_status=true`
    logger.info(url);
    q.push(id + 1);
    request({
        url: url, agentClass: Agent, agentOptions: {
            socksHost: "localhost",
            socksPort: "9050"
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            logger.info("DONE", url);
            fs.writeJSON(filename, JSON.parse(body));
            callback();
        } else {
            callback(error, response);
        }
    });
}, 30);


q.drain = function () {
    logger.info('all items have been processed');
};

q.push(1, function (error, response) {
    if (!error && !response) {
        console.log(error, response);
    }
});