import {ChildProcessHandler} from "../src/utilities/ChildProcessHandler";
import {expect} from "chai";

describe('# CLI Test', () => {

  describe('test create container', () => {
    it('should create a container', function(done) {
      this.timeout(20000);
      const output = ChildProcessHandler.executeChildProcCommand(
          'ts-node src/vuln-cli.ts');
      expect(output).to.include('createContainer');
      expect(output).to.include('startContainer');
      expect(output).to.include('stopContainer');
      expect(output).to.include('removeContainer');
      expect(output).to.include('extractContainer');
      expect(output).to.include('checkForVuln');
      expect(output).to.include('persistVulnCheck');
      expect(output).to.include('pullImage');
      expect(output).to.include('removeImage');
      expect(output).to.include('runNpmTests');
      expect(output).to.include('updateComponents');
      expect(output).to.include('updateComponent');
      expect(output).to.include('updateAndReinstall');
      expect(output).to.include('removeSrcCode');
      expect(output).to.include('checkTag');
      expect(output).to.include('buildImage');
      expect(output).to.include('pushImage');
      expect(output).to.include('register');
      expect(output).to.include('login');
      done();
    });
  });

});
