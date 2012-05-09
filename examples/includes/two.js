
log(">> " + __dirname + " >> " + __filename);

taskSync("include-two", logNameActionFoo);
task("default", ["include-two"]);