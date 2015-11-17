var fs = require('fs');
var http = require('http');
var exec = require('child_process').exec;
var path = require('path');
module.exports = {
    editableConfigs: [
        "user",
        "password",
        "repoDir",
        "serverCommands",
        "gitPushRemote",
        "gitPushBranch",
        "serverUrl",
        "serverPort",
        "gitClonePath",
        "cloudCommands",
        "watchDir",
        "gitPassword"
    ],

    configDefaults: {
        "user": "Marcius",
        "password": "tifind96",
        "repoDir": "D:\\GoogleDrive\\OSF\\MyProjects\\Demandware\\Loreal\\LORA\\Urban Decay HK\\codebace\\ecom-lancome-au\\cartridges\\app_lancome_au\\cartridge\\static\\default",
        "gitPushRemote": "origin",
        "gitPushBranch": "master",
        "serverUrl": "91.210.21.144",
        "gitClonePath": "https://Markiyan_Pyts@bitbucket.org/Markiyan_Pyts/testrepoforcompiler.git",
        "cloudCommands": "gulp compass",
        "watchDir": "D:\\GoogleDrive\\OSF\\MyProjects\\Demandware\\Loreal\\LORA\\Urban Decay HK\\codebace\\ecom-lancome-au\\cartridges\\app_lancome_au\\cartridge\\static\\default\\sass",
        "gitPassword": "tifind96",
        "serverPort": "3000"
    },

    serverLocked: false,

    resetDefaultConfig: function(configName) {
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

    watch: function(config) {
        var watchPath = path.normalize(config.watchDir),
            that = this;
        console.log("Watching " + watchPath +" for changes")
        fs.watch(watchPath, { persistent: true, recursive: true }, function (event, filename) {
            if(!that.serverLocked) {
                that.cloudCompile(config);
                that.serverLocked = true;
                setTimeout(function() {
                    that.serverLocked = false;
                }, 100)
            }
        });
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
        this.requestToServer(config, "/init");
    },

    compileRequestToServer: function(config) {
        this.requestToServer(config, "/compile");
    },
    requestToServer: function(config, requestPath) {
        var that = this;
        console.log("waiting for server to respond");
        var options = {
            host: config.serverUrl,
            path: requestPath,
            port: config.serverPort,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(JSON.stringify(config))
            }
        };
        var req = http.request(options, function(res) {
            var response = "";
            res.on('data', function (chunk) {
                response += chunk;
            });
            res.on('end', function() {
                console.log(response)
                if(response === "compiled data is pushed back successfully") {
                    that.pullCompiledDataBack(config);
                }
            })
        });
        req.write(JSON.stringify(config));
        req.end();
    },
    destroyUser: function(config) {
        this.requestToServer(config, "/destroy");
    },
    pullCompiledDataBack: function(config) {
        exec("git pull " + config.gitPushRemote + " " + config.gitPushBranch, {cwd: config.repoDir}, function (error, stdout, stderr) {
            if (error === null) {
                console.log("compiled data is successfully pulled back to local repo");
            }else {
                console.log('error: ' + error);
            }
        });
    }
}