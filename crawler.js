require("babel-register");
var fs = require('fs-extra');
var request = require('request');
var async = require('async');
var logger = require("log4js").getDefaultLogger();
fs.ensureDir("./out");

var q = async.queue(function (id, callback) {
    var url = `https://www.freelancer.com/api/projects/0.1/projects/${id}/?compact=true&full_description=true&job_details=true&location_details=true&selected_bids=true&upgrade_details=true&user_avatar=true&user_details=true&user_employer_reputation=true&user_reputation=true&user_status=true`
    logger.info(url);
    q.push(id + 1);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            logger.info("DONE", url);
            fs.writeJSON(`out/${id}.json`, JSON.parse(body));
            callback(id);
        } else {
            callback(id);
        }
    });
}, 5);


q.drain = function () {
    logger.info('all items have been processed');
};

q.push(1, function(){

});