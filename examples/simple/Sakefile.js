
var simpleMod = require("simple/standard");

require("sake/clean");
CLEAN.include("**/*.js");

log(">> " + __dirname + " >> " + __filename);

includePaths.push(__dirname + "/other-module");

require("simple/sake-context");
require("sample");

function logNameAction (t) {
    log(t.name);
}

include("./include.js");
include("../includes/one.js");

taskSync("default", ["include"], logNameAction);

taskSync("required", simpleMod.foo);
task("default", ["required"]);

taskSync("globalized", function (t) {
    log(t.name + ": " + baz);
});
task("default", ["globalized"]);

taskSync("contextualized", fooPlus);
task("default", ["contextualized"]);

