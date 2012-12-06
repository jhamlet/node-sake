
log(">> " + __dirname + " >> " + __filename);
log(require('./mod1'));

taskSync("include-two", logNameAction);
task("default", ["include-two"]);