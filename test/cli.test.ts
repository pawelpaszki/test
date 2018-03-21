import {ChildProcessHandler} from "../src/utilities/ChildProcessHandler";
import {expect} from "chai";

describe('# CLI Test', () => {

  describe('test create container', () => {
    it('should create a container', function(done) {
      this.timeout(20000);
      const output = ChildProcessHandler.executeChildProcCommand(
          'ts-node src/vuln-cli.ts register username password');
      expect(output).to.not.equal('');
      done();
    });
  });

});
