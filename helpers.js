var fs = require('fs');
var http = require('http');
var exec = require('child_process').exec;
module.exports = {
    editableConfigs: [
        "user",
        "password",
        "domain",
        "repoDir",
        "serverCommands",
        "gitPushRemote",
        "gitPushBranch",
        "serverUrl",
        "gitClonePath"
    ],

    configDefaults: {
        "user": "Marcius",
        "password": "tifind96",
        "repoDir": "D:\\GoogleDrive\\OSF\\MyProjects\\Demandware\\Loreal\\LORA\\Urban Decay HK\\codebace\\ecom-lancome-au\\cartridges\\app_lancome_au\\cartridge\\static\\default",
        "gitPushRemote": "origin",
        "gitPushBranch": "master",
        "serverUrl": "91.210.21.144",
        "gitClonePath": "git@bitbucket.org:Markiyan_Pyts/testrepoforcompiler.git"
    },

    resetDefaultConfig: function() {
        fs.writeFile(configName, "module.exports = \n"+JSON.stringify(this.configDefaults, null, 4), function (err) {
            if (err) return console.log(err)
            console.log("default configs are set");
        });
    },

    setConfig: function(userArgs, configName, config) {
        if(this.editableConfigs.indexOf(userArgs[2])  != -1) {
            config[userArgs[2]] = userArgs[3];
            fs.writeFile(configName, "module.exports = \n"+JSON.stringify(config, null, 4), function (err) {
              if (err) return console.log(err)
              console.log(userArgs[2] + ' is set to to ' + userArgs[3]);
            });
        }else {
            console.error("You do not have access to this config value or it does not exist");
        }
    },

    getConfig: function(userArgs, config) {
        if(this.editableConfigs.indexOf(userArgs[2])  != -1) {
            console.log(config[userArgs[2]]);
        }else {
            console.error("You do not have access to this config value or it does not exist");
        }
    },

    cloudCompile: function(config) {
        var that = this;
        exec("git add -A", {cwd: config.repoDir}, function (error, stdout, stderr) {
            if (error === null) {
                exec("git commit -m \"cloud compiler process\"", {cwd: config.repoDir}, function (error, stdout, stderr) {
                    if (error === null) {
                        console.log('commit success: ' + stdout);
                        exec("git push " + config.gitPushRemote + " " + config.gitPushBranch, {cwd: config.repoDir}, function (error, stdout, stderr) {
                            if (error === null) {
                                console.log(stdout);
                                that.compileRequestToServer(config, function() {});
                            }else {
                                console.log('error: ' + error);
                            }
                        });
                    }else {
                        console.log("There is nothing new to commit, please make change in repo");
                    }
                });
            }else {
                console.log('error: ' + error);
            }
        });
    },

    cloudInit: function(config) {
        this.initRequestToServer(config);
    },

    initRequestToServer: function(config) {
        console.log("git push made, waiting for server to respond");
        var options = {
            host: config.serverUrl,
            path: '/init',
            port: '3000',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(JSON.stringify(config))
            }
        };
        var req = http.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            //res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
            res.on('end', function() {
                console.log('No more data in response.')
            })
        });
        req.write(JSON.stringify(config));
        req.end();
    },

    compileRequestToServer: function(config, callback) {
        console.log("git push made, waiting for server to respond");
        var options = {
            host: config.serverUrl,
            path: '/compile',
            port: '3000',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(JSON.stringify(config))
            }
        };
        var req = http.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            //res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
            res.on('end', function() {
                console.log('No more data in response.')
            })
        });
        req.write(JSON.stringify(config));
        req.end();
    }
}