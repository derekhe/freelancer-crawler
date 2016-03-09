require("babel-register");
var fs = require('fs-extra');
var request = require('request');
var async = require('async');
var logger = require("log4js").getDefaultLogger();
var Agent = require('socks5-https-client/lib/Agent');

fs.ensureDir("./out");

var q = async.queue(function (id, callback) {
    var folder = Math.round(id / 10000);

    fs.ensureDir(`./out/${folder}`)
    var projectFileName = `out/${folder}/${id}-project.json`;
    var bidsFileName = `out/${folder}/${id}-bids.json`;

    if (fs.existsSync(projectFileName)) {
        console.log("Skip " + id);
        q.push(id + 1);
        callback();
        return
    }

    var projectUrl = `https://www.freelancer.com/api/projects/0.1/projects/${id}/?compact=true&full_description=true&job_details=true&location_details=true&selected_bids=true&upgrade_details=true&user_avatar=true&user_details=true&user_employer_reputation=true&user_reputation=true&user_status=true`
    q.push(id + 1);
    var options = {
        url: projectUrl,
        agentClass: Agent, agentOptions: {
            socksHost: "localhost",
            socksPort: "9050"
        },
    };

    options.url = projectUrl;
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            logger.info("Get project", projectUrl);
            fs.writeJSON(projectFileName, JSON.parse(body));

            var bidsUrl = `https://www.freelancer.com/api/projects/0.1/projects/${id}/bids/?compact=true&offset=0&reputation=true&user_avatar=true&user_details=true`;
            options.url = bidsUrl;
            request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.info("Get bids", bidsUrl);
                        fs.writeJSON(bidsFileName, JSON.parse(body));
                        callback();
                    } else {
                        callback(error, response);
                    }
                }
            );
        } else {
            callback(error, response);
        }
    });
}, 100);


q.drain = function () {
    logger.info('all items have been processed');
};

q.push(1, function (error, response) {
    if (!error && !response) {
        console.log(error, response);
    }
});