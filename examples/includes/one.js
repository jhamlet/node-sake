
log(">> " + __dirname + " >> " + __filename);

function logNameActionFoo (t) {
    log(t.name + ": foo");
}

taskSync("include-one", logNameAction);
task("default", ["include-one"]);

include("./two.js");
