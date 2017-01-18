const express = require('express');
const app = express();
const fs = require("fs-extra");
const http = require('http');
const exec = require('child_process').exec;
const chalk = require('chalk');

const Demo = function() {

    exec('cd oem && node oem deploy all --autolaunch=false', function(error, stdout, stderr) {
      fs.copySync('./oem/deploy/all/oem.js', './src/oem.js');
      fs.copySync('./oem/deploy/all/oem.css', './src/oem.css');
    });

    this.port = 7001;
    this.server;
    this.start();
};

Demo.prototype = {

    handleServerRequest: function(req, res) {
        var that = this;
        fs.readFile("./src/demo.html", 'utf8', function(err, data) {
            res.send(data);
            res.end();
        });
    },

    onStart: function() {
        console.log("");
        console.log("");
        console.log(chalk.bgWhite("       "));
        console.log(chalk.black.bgWhite("  OEM  "), " DEVELOP ");
        console.log(chalk.bgWhite("       "));
        console.log("");
        console.log("");
        console.log("Component:", this.component);
        console.log("Server:", "http://localhost:" + this.port);
        exec('open http://localhost:' + this.port);
        console.log("");
        console.log("");
    },

    reportRequest: function(req, res, next) {
        console.log(chalk.gray("Served: "), req.url);
        next();
    },

    start: function() {
        app.use('/src', this.reportRequest, express.static('src'));
        app.get('/', this.reportRequest, this.handleServerRequest.bind(this));
        app.listen(this.port, this.onStart.bind(this));
    }
    
};

new Demo();