
var futils = require('sake/file-utils'),
    sh = futils.sh;

function shCallback (done) {
    return function (error, result) {
        if (error) {
            throw new Error(error);
        }
        done(result);
    };
}
suite('Precompile Sakefile', function () {

    test('works', function (done) {
        var cmd = 'sake -f examples/precompile-sakefile/Sakefile';

        sh(cmd, shCallback(function (result) {
            result.should.equal('Success\n');
            done();
        }));
    });

});
