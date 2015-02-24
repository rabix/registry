# Rabix Registry

## Instructions
### 1. Install Node.js

Skip this section if you have a node environment setup.

##### Requirements

This guides assumes you have installed the following tools successfully:
- Git
- NodeJS
- Ruby >= 1.9
- SASS >= 3.3.0
- Compass >= 1.0
- Xcode (Mac OSx)
- Homebrew/brew (Mac Osx)

Use nave (or similar) to manage your Node.js installations. You should always try
to use the latest stable version of Node.js.

(Mac OSx) Installing Homebrew [Guide](http://brew.sh/)
Installing Node [Guide](http://nodejs.org/download/)
Installing Git [Guide](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
Installing Ruby [Guide](https://www.ruby-lang.org/en/documentation/installation/)
Installing Compass [Guide](http://compass-style.org/install/)
Installing SASS [Guide](http://sass-lang.com/install)

### 2. Install development tools

	npm install -g bower grunt-cli

- `bower` installs and manages many client-side dependencies
- `grunt-cli` used to execute grunt tasks defined in the project

### 3. Setting up repository

- Clone registry repository
- Install client dependencies
- Install server dependencies

###### Code

    git clone git@github.com:rabix/registry.git
    cd registry/server
    npm install
    cd ../client
    npm install
    bower install
    # prepares angular templates, compiles styles and sets up watchers for client development
    grunt serve


### 4. Create folders for log files

Create folders /data/rabix-registry/

    mkdir -p /data/rabix-registry
    sudo chown <your username>:<your usergroup> -R /data

### 5. Client Production Build

Grunt is used as the task runner. To do production build of your code run:

	grunt

## More info

### Project Structure
	<PROJECT_ROOT>/
	    client/
            .... app/
            .... .... bower_components/ <- all external libs that are installed via bower
            .... .... scripts/
            .... .... images/
            .... .... fonts/
            .... .... data/ <- contains data mocks
            .... .... vendor/ <- libs that are not available from bower or are some extensions of external libs
            .... .... styles/
            .... .... scripts/
            .... .... views/ <- contains angular templates
            .... .bowerrc <- bower cli configuration
            .... .editorconfig <- editor configuration rules (indent style, line endings)
            .... .gitignore <- contains sensible defaults for files/folders to ignore
            .... bower.json  <- bower package definition packages
            .... Gruntfile.js  <- grunt tasks definition module
            .... package.json  <- npm package definitionclient/
            .... test/
            .... .... mocks/ <- tests data mocks
            .... .... spec/ <- tests specifications
        server/
            .... app/
            .... .... controllers/ <- application controllers
            .... .... models/ <- application data models
            .... .... views/ <- not used since node is not rendering any templates
            .... aws/ <- amazon s3 client
            .... bin/ <- deploy scripts
            .... builds/ <- CI for tool builds
            .... mailer/ <- mailer client
            .... docs/ <- API documentation
            .... common/ <- Loggers and route filters
            .... pipeline/ <- Workflow formatters, sorters, validators
            .... test/ <- Server tests
            .... config/ <- application configuration
            .... config-template/ <- deploy configuration templates
            .... nodemon.json <- contains node path for nodemon to use
            .... package.json  <- server dependencies
            .... Gruntfile.js
