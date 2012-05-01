
var Path    = require("path"),
    futil   = require("sake/file-utils"),
    files   = new FileList("**/*", "some/non-existing/file.js")
;

require("sake/clean");
require("sake/clobber");

task("one", ["two"], function (t) {
    // task actions
    t.done();
});
