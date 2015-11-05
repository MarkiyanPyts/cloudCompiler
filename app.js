#! /usr/bin/env node
var configName= "./config.js";
var config = require(configName);
var http = require('http');
//custom helpers
var helpers = require("./helpers.js");

var exec = require('child_process').exec;
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
                helpers.resetDefaultConfig();
                break;
            default:
                console.error("There is no operation like this for conf"); 
        }     
    break;
    case "compile":
        helpers.cloudCompile(exec, config);
    break;
    case "watch":

    break;
    default:
        console.log("Cloud Compiler does not support this command")
}
