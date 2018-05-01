const Application = require('spectron').Application;
const assert = require('assert');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const electron = require('electron');

global.before(() => {
    chai.should();
chai.use(chaiAsPromised);
})
module.exports = {
    startApp() {
        const opts = {
            path: electron,
            args: ['main.js']
        };

        const app = new Application(opts);

        return app.start().then((app) => {
            chaiAsPromised.transferPromiseness = app.transferPromiseness;
        return app
    })
    },

    stopApp(app) {
        return app.stop()
    }
};