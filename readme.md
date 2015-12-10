# Cloud Compiler
App is intended to execute custom command line commands(usually compilation related) inside your git repository on external machine which is doing all the compilation heavy lifting and pushing results back to same repo instance inside client machine.

## Concept
Cloud compiler is intended to execute time consuming CLI commands like [gulp](http://gulpjs.com/) tasks on more powerful server machine. Server machine will execute commands which is setup on gulp file and use [git](https://git-scm.com/) to transfer data back and forth between client machine and server machine.

User of the app will initialize a git repo in directory which contains files to be compiled and gulp file in the root of the directory. Repo will be linked with remote (on Bitbucket, Github or your own git server) and https clone path of the repo will be given to Cloud Compiler.

User will change file which is used as input file of the gulp task and run ```clcomp compile``` command. Client app will ```git push``` the repo to remote , then app server side will ```git pull``` repo from remote to user personal folder in server, server will execute gulp commands in the repo and push compiled repo back to remote, then client app will ```git pull``` compiled repo back.

Therefore client will get compiled files.

The downside of the Cloud Compiler is few seconds time loss for http requests and git operations so you should use it for tasks which takes much more than few seconds ... like minutes or more.

Also all the point of Cloud Compiler is running tasks on server machine more powerful than your working machine to get higher compilation speeds. So if your machine hardware is same of more powerfull then server machine with [Cloud Compiler Server](https://github.com/DarthMarcius/cloudCompilerServer) there is no point of using it.

 But in situation where server compiles at least 2 times faster than your local machine there is a point of using it.

## Installation
**You need to install cloud compiler globally else it will not be usable:**
```npm install cloud-compiler -g```
## Setup
>For Cloud Compiler to work you need to setup [Cloud Compiler Server](https://github.com/DarthMarcius/cloudCompilerServer) on live server machine.

*After installation is done first thing to do is configuration file setup.*
### Config setup
```clcfile.js``` file is a file which you should create and place under root of local git repo you will use for Cloud Compiler.

You can edit it manually though it's not recomended way to do it. You should use Cloud Compiler command line tools to do that.

Cloud compiler has getter and setter for config options:
### Getting config option
```clcomp conf get optionName```
### Setting config option
```clcomp conf set optionName optionValue```
>String values like ```watchFor``` should be enclosed into quotes like so:
```clcomp conf set watchFor "sass/**/*.scss"```

### Required config options
The following options must be correctly set for the app to function correctly:
- ```user``` - Your user name on server machine, each user of the app have his own folder in server side which contains repository on which compilations will run.
- ```password``` - User password on server. Used to confirm that you are the original owner of the folder, without it any user with same name as yours would be able to owerride your repo folder with his. So password is used to avoid conflicts.
- ```watchFor``` - set of path options to files which you want to watch for changes. Each value can be separated by comma, for example: ```sass/**/*.scss, scripts/**/*js```. **Note that this path is relative to the directory from which you run ```clcomp``` command which is your local repo.**
- ```serverIP``` - public IP address for server  machine which is used to run [Cloud Compiler Server](https://github.com/DarthMarcius/cloudCompilerServer)
- ```serverPort``` - Port in server on which the server runs the [Cloud Compiler Server](https://github.com/DarthMarcius/cloudCompilerServer) by default it's ```3000``` unless you changed it in server.js file on server side.
- ```gitClonePath``` - HTTPS clone path of repository in which compilations will take place for example ```https://User_Name:user_password@bitbucket.org/User_Name/reponame.git```
>**It's absolute must to use HTTPS path with password included in example above it's ```user_password``` , if you use other service than Bitbucket it may have different syntax for including your git password in clone path. Also you should set the same path in you remote option inside your git config file. If you don't follow this advice cloud compiler will not work for you.**

- ```gitPushRemote``` - Git remote to use in git operations e.g ```origin```.
- ```gitPushBranch``` - Git brunch to use in git operations e.g ```master```.
- **```cloudCommands```** - Commands to be executed on the server after ```compile``` or ```watch``` command triggers server side compilation. It can be single command like ```gulp compass``` or list of commands separated by comma```gulp libsass,gulp minify``` commands will be executed one by one synchroniously.

### Cloud Compiler CLI commands
>**To run any of clcomp commands you need to ```cd``` into you local repo directory (directory in which clcfile.js should be created).**

- **```clcomp conf reset```** - Will reset your clcfile.js , all options will be set to empty string except default server port 3000, git remote "origin" and git branch "master". If you do not have clcfile.js in your repo yet it will be created for you.
- **```clcomp init```** - Command creates yor folder named by your config ```user``` option in server side and runs ```git clone``` of repo specified in ```gitClonePath``` config option inside this folder.
- **```clcomp destroy```** - Sometimes when you did not setup config options correclly or there was some sort of error during ```clcomp init``` command and ```compile```  or new ```clcomp init``` does not work ```clcomp destroy``` will remove your folder and user record on server side. After you can run ```clcomp init``` again. **```clcomp destroy``` works only when ```password``` option in your config matches password for folder owner on server**.
- **```clcomp compile```** - git pushes your local repo to server, runs commands specified in ```cloudCommands``` config option one by one and pushes it back to your local repo.
- **```clcomp watch```** - Watches all files specified in ```watchDir``` config option and triggers ```clcomp compile``` if files inside changes.

### Workflow
>**To run any of clcomp commands you need to ```cd``` into you local repo directory (directory in which clcfile.js should be created)**. In this section this directory is represented in step 1.

1. Run ```git init``` in folder which contains your gulpfile and project files.
2. Run ```git add -A``` and ```git commit -m ""``` in same folder.
3. Create new repo in https://bitbucket.org and run commands from **"I have an existing project"** from "Overview" section of new repo in the same folder as above.
5. If you plan to use ```watch``` command set ```watchFor``` config option.
6. Set ```gitClonePath``` config option to the https clone URL of the remote repo you created at step 3. **!!!Remember to include your git password inside the clone path you specify and use the same path with password in your local repo git config file after.**
8. Learn your [Cloud Compiler Server](https://github.com/DarthMarcius/cloudCompilerServer) server machine public IP address and set ```serverIP``` to it.
9. Set ```cloudCommands``` conf option to CLI command you want to run in server side.
10. Set ```user``` and  ```password``` fields as you desire. **Note that ```user``` name should be unique for each member of your team who use cloud compiler**.
11. ```serverPort``` defaults to 3000 don't change it unless you need to.
12. ```gitPushRemote``` defaults to ```origin``` and ```gitPushBranch``` defaults to ```master``` In you want to choose other values for your own workflow you can do it. But defaults should be fine for Cloud Compiler test drive.
13. Run ```clcomp init``` and make sure no error occured, if server app is running and you setup config correctly you should get ```git clone is done``` message in CLI
14. Now you can run ```clcomp compile``` or use ```clcomp watch``` command.


>Note: Ideally you should init new repo for each person in your team to run compilations in, but alternatively you should be able to just use different branches on the same repo by changing ```gitPushBranch``` for each of your team members.
Of cource every team member should have his own ```user``` and ```password``` to not override each other compilations.