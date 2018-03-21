#!/usr/bin/env ts-node

import * as commander from 'commander';

import * as actions from './cli-middleware';

commander
  .version('0.0.1')
  .description('Docker Image Freshness and Vulnerability Manager');

commander
  .command('createContainer <token> <imageName>')
  .description('Create a container')
  .action((token, imageName) => {
    actions.createContainer(token, imageName);
  });

commander
  .command('startContainer <token> <containerId>')
  .description('Start a container')
  .action((token, containerId) => {
    actions.startContainer(token, containerId);
  });

commander
  .command('stopContainer <token> <containerId>')
  .description('Stop a container')
  .action((token, containerId) => {
    actions.stopContainer(token, containerId);
  });

commander
  .command('removeContainer <token> <containerId>')
  .description('Remove a container')
  .action((token, containerId) => {
    actions.removeContainer(token, containerId);
  });

commander
  .command('extractContainer <token> <containerId> <imageName>')
  .description('Extract a container')
  .action((token, containerId, imageName) => {
    actions.extractContainer(token, containerId, imageName);
  });

commander
  .command('checkForVuln <token> <imageName> <checkOnly>')
  .description('Check for vulnerable components')
  .action((token, imageName, checkOnly) => {
    actions.checkForVulnComps(token, imageName, checkOnly);
  });

commander
  .command('persistVulnCheck <token> <imageName>')
  .description('Perform and persist vulnerability check')
  .action((token, imageName) => {
    actions.performVulnerabilityCheck(token, imageName);
  });

commander
  .command('pullImage <token> <imageName>')
  .description('Pull Docker image')
  .action((token, imageName) => {
    actions.pullImage(token, imageName);
  });

commander
  .command('removeImage <token> <imageId>')
  .description('Remove Docker image')
  .action((token, imageId) => {
    actions.removeImage(token, imageId);
  });

commander
  .command('runNpmTests <token> <imageName>')
  .description('Run npm tests')
  .action((token, imageName) => {
    actions.runNpmTests(token, imageName);
  });

commander
  .command('runNcuCheck <token> <imageName>')
  .description('Run ncu check')
  .action((token, imageName) => {
    actions.runNcuCheck(token, imageName);
  });

commander
  .command('updateComponents <token> <imageName>')
  .description('Update npm components')
  .action((token, imageName) => {
    actions.updateNpmComponents(token, imageName);
  });

commander
  .command('updateComponent <token> <imageName> <packageName>')
  .description('Update npm components')
  .action((token, imageName, packageName) => {
    actions.updateNpmComponent(token, imageName, packageName);
  });

commander
  .command('updateAndReinstall <token> <imageName> <packageName>')
  .description('Update npm components')
  .action((token, imageName, packageName) => {
    actions.updateAndReinstall(token, imageName, packageName);
  });

commander
  .command('removeSrcCode <token> <imageName>')
  .description('Remove source code')
  .action((token, imageName) => {
    actions.removeSrcCode(token, imageName);
  });

commander
  .command('dockerLogin <token> <username> <password>')
  .description('Docker login')
  .action((token, username, password) => {
    actions.dockerLogin(token, username, password);
  });

commander
  .command('checkTag <token> <imageName>')
  .description('Check latest image tag')
  .action((token, imageName) => {
    actions.checkTag(token, imageName);
  });

commander
  .command('buildImage <token> <imageName>')
  .description('Build Docker image')
  .action((token, imageName) => {
    actions.buildImage(token, imageName);
  });

commander
  .command('pushImage <token> <imageName>')
  .description('Push Docker image')
  .action((token, imageName) => {
    actions.pushImage(token, imageName);
  });

commander
  .command('register <username> <password>')
  .description('Register')
  .action((username, password) => {
    actions.register(username, password);
  });

commander
  .command('login <username> <password>')
  .description('Login')
  .action((username, password) => {
    actions.login(username, password);
  });

if (!process.argv.slice(2).length) {
  commander.outputHelp();
  process.exit();
}
commander.parse(process.argv);
