
log(">> " + __dirname + " >> " + __filename);

taskSync("include-two", logNameAction);
task("default", ["include-two"]);