#!/usr/bin/env node
var path = require("path");
var fs = require('fs');
// Set env var for ORIGINAL cwd
// before anything touches it
process.env.INIT_CWD = process.cwd();

var configName= path.resolve(process.env.INIT_CWD + "/clcfile.js");

var errorMessages = {
    "noConfigFile": "clcfile.js does not exits in current directory, please create one"
}

try {
    var config = require(configName);
    config.repoDir = process.env.INIT_CWD;
} catch(e) {
    console.log(errorMessages.noConfigFile);
}

//custom helpers
var helpers = require("./helpers.js");

var userArgs = process.argv.slice(2);
//config operations
switch (userArgs[0]) {
    case "conf":
        switch (userArgs[1]) {
            case "get":
                helpers.getConfig(userArgs, config);
                break;
            case "set":
                helpers.setConfig(userArgs, configName, config);
                break;
            case "reset":
                helpers.resetDefaultConfig(configName);
                break;
            default:
                console.error("There is no operation like this for conf"); 
        }     
    break;
    case "compile":
        helpers.cloudCompile(config);
    break;
    case "watch":
        helpers.watch(config);
    break;
    case "init":
        helpers.cloudInit(config);
    break;
    case "destroy":
        helpers.destroyUser(config);
    break;

    default:
        console.log("Cloud Compiler does not support this command")
}
