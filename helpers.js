var fs = require('fs');
module.exports = {
    editableConfigs: [
        "user",
        "password",
        "domain",
        "repoDir",
        "serverCommands",
        "gitPushRemote",
        "gitPushBranch"
    ],
    configDefaults: {
        "user": "Marcius",
        "password": "tifind96",
        "repoDir": "D:\\GoogleDrive\\OSF\\MyProjects\\Demandware\\Loreal\\LORA\\Urban Decay HK\\codebace\\ecom-lancome-au\\cartridges\\app_lancome_au\\cartridge\\static\\default",
        "gitPushRemote": "origin",
        "gitPushBranch": "master"
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
    cloudCompile: function(exec, repoDir, gitPushRemote, gitPushBranch) {
        exec("git add -A", {cwd: repoDir}, function (error, stdout, stderr) {
            if (error === null) {
                exec("git commit -m \"cloud compiler process\"", {cwd: repoDir}, function (error, stdout, stderr) {
                    if (error === null) {
                        console.log('commit success: ' + stdout);
                        exec("git push " + gitPushRemote + " " + gitPushBranch, {cwd: repoDir}, function (error, stdout, stderr) {
                            if (error === null) {
                                console.log(stdout);
                                console.log("git push made, waiting for server to compile");
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
    }
}