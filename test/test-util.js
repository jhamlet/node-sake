/*globals suite, test, setup, teardown */

var sutil = require('sake/util');

suite('sake.util', function () {
    
    test('fileFromStackTrace', function () {
        sutil.fileFromStackTrace().should.equal(__filename);
    });

    test('directoryFromStackTrace', function () {
        sutil.directoryFromStackTrace().should.equal(__dirname);
    });
    
});