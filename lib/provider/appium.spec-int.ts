import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';

import {spawnProcess} from '../../spec/support/helpers/test_utils';
import {Appium} from './appium';

xdescribe('appium', () => {
  const tmpDir = path.resolve(os.tmpdir(), 'test');
  let origTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  describe('getVersion', () => {
    let proc: childProcess.ChildProcess;

    beforeAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

    afterAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = origTimeout;
    });

    describe('with a http server', () => {
      beforeAll(async () => {
        proc = spawnProcess('node', ['dist/spec/server/http_server.js']);
        console.log('http-server: ' + proc.pid);
        try {
          fs.mkdirSync(tmpDir);
        } catch (err) {
        }
        await new Promise((resolve, _) => {
          setTimeout(resolve, 3000);
        });
      });

      afterAll(() => {
        try {
          rimraf.sync(tmpDir);
        } catch (err) {
        }
        process.kill(proc.pid);
      });

      it('should get the version from the local server', async () => {
        const appium = new Appium({
          outDir: tmpDir,
          requestUrl: 'http://127.0.0.1:8812/spec/support/files/appium.json'
        });
        expect(await appium.getVersion()).toBe('10.11.12');
      });
    });
  });

  describe('setup', () => {
    beforeAll(() => {
      origTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      try {
        fs.mkdirSync(tmpDir);
      } catch (err) {
      }
    });

    afterAll(() => {
      try {
        rimraf.sync(tmpDir);
      } catch (err) {
      }
      jasmine.DEFAULT_TIMEOUT_INTERVAL = origTimeout;
    });

    it('should create the package.json file', async () => {
      const appium = new Appium({outDir: tmpDir});
      await appium.setup('10.11.12');
      const packageJson = path.resolve(tmpDir, 'appium', 'package.json');
      expect(fs.statSync(packageJson).size).not.toBe(0);
    });
  });
});