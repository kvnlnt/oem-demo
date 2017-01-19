const express = require('express');
const app = express();
const fs = require("fs-extra");
const http = require('http');
const exec = require('child_process').exec;
const chalk = require('chalk');

const Demo = function(demo, deployment) {
    var self = this;
    self.deployment = deployment || 'all';
    self.demo = demo || 'weather';
    self.port = 7001;

    exec('cd oem && node oem deploy '+self.deployment+' --autolaunch=false', function(error, stdout, stderr) {
      fs.copySync('./oem/deploy/'+self.deployment+'/oem.js', './src/oem.js');
      fs.copySync('./oem/deploy/'+self.deployment+'/oem.js', './src/oem.min.js');
      fs.copySync('./oem/deploy/'+self.deployment+'/oem.css', './src/oem.css');
      fs.copySync('./oem/deploy/'+self.deployment+'/oem.js', './src/oem.min.js');
    });

    self.server;
    self.start();
};

Demo.prototype = {

    handleServerRequest: function(req, res) {
        var that = this;
        fs.readFile("./src/"+this.demo+".html", 'utf8', function(err, data) {
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
        console.log("Demo:", this.demo);
        console.log("Deployment", this.deployment);
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

const ARGS = process.argv.filter(function(arg, i){ return i > 1; });
new Demo(ARGS[0], ARGS[1]);
