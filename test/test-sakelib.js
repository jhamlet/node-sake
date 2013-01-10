
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
suite('Sakelib', function () {
    
    test('symlinked sakelib directories', function (done) {
        var cmd = 'sake',
            expect = [
                'a:one',
                'b:one',
                'f:one'
            ];
        
        cmd += ' -f examples/sakelib/Sakefile.js';
        // sakelib is relative to the sakefile
        cmd += ' -l linklib';
        
        sh(cmd, shCallback(function (result) {
            result.split(/\n/).filter(Boolean).forEach(function (line, idx) {
                line.should.equal(expect[idx]);
            });
            done();
        }));
    });

});