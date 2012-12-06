
log(">> " + __dirname + " >> " + __filename);
log(require('./mod1'));

function logNameAction (t) {
    var sutil = require('sake/util');
    log(t.name + ": foo");
    log(sutil.fileFromStackTrace());
    include("./three.js");
    include("./inc/four.js");
    log(require('./mod2'));
}

taskSync("include-one", logNameAction);
task("default", ["include-one"]);

include("./two.js");
