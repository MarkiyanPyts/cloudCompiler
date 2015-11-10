#! /usr/bin/env node
var configName= "./config.js";
var config = require(configName);

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

    default:
        console.log("Cloud Compiler does not support this command")
}
