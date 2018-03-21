## Back end for Final Year Project in Applied Compuring course done in Waterford Institute of Technology

[![Dependency Status](https://david-dm.org/pawelpaszki/FYP_back_end.svg)](https://david-dm.org/pawelpaszki/FYP_back_end) [![Build Status](https://travis-ci.org/pawelpaszki/FYP_back_end.svg?branch=master)](https://travis-ci.org/pawelpaszki/FYP_back_end) [![GitHub tag](https://img.shields.io/github/tag/pawelpaszki/FYP_back_end.svg)](https://github.com/pawelpaszki/FYP_back_end)

### Prerequisites

#### Here is the list of software required to run this application (tested on Ubuntu 16.04 on a pc and ec2 instance):

* Docker (tested on version 17.12.0-ce)

* MongoDB installed and mongod service running (tested on v3.2.17 on a pc and v3.6.2 on ec2 instance)

* Node.js installed (preferably v6.12.3)

* npm-check-updates installed globally (v2.14.0 used):
```
npm install -g npm-check-updates@2.14.0
```
* Snyk CLI globally installed (CLI authentication required to perform vulnerability scans - used v1.65.1):
```
npm install -g snyk@1.65.1
```
* Typescript globally installed (tested using v2.7.1):`
```
npm install -g typescript@2.7.1
```

* ts-node globally installed (to access the application through command line interface - v4.1.0 used):
```
npm install -g ts-node@4.1.0
```

Additionally, to run the script, following needs to be installed (ubuntu command):
```
sudo apt-get install jq
```

### Running the application

```bash
npm run dev
```

### Running tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Accessing Documentation (when the application is running)

http://localhost:3000/docs

### Using command line (application must be running in order to use access it through CLI in another terminal window:

display the list of available commands (from the root directory of the project in the terminal):
```bash
ts-node src/vuln-cli.ts --help
```

Example of running CLI command:
```bash
ts-node src/vuln-cli.ts updateComponents pawelpaszki/vuln-demo-10-node
```
