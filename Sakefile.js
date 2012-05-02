/*globals desc, task, taskSync, file, directory, fileSync, FileList, CLOBBER, CLEAN, write, read, log */
var Path        = require("path"),
    buildStart  = new Date(),
    authorInfo  = read("AUTHORS", "utf8").split("\n")[0],
    readMeFiles = new FileList(),
    buildComplete
;

/**
 * Defines the CLEAN file-list and the 'clean' task
 */
require("sake/clean");
CLEAN.include("README.md");

desc("Keep the LICENSE file up-to-date.");
fileSync("LICENSE", ["AUTHORS"], function (t) {
    var year = new Date().getFullYear(),
        license = read(t.name, "utf8").split("\n")
    ;
    
    license[0] = "Copyright (c) " + year + " " + authorInfo;
    
    write(t.name, license.join("\n"), "utf8");
    log(t.name + " updated");
});

taskSync("pre-build", function (t) {
    log("Starting build at " + buildStart);
});

taskSync("build", ["pre-build"], function (t) {
    var delta;
    
    buildComplete = new Date();
    delta = buildComplete.getTime() - buildStart.getTime();
    
    log("Build complete at " + buildComplete);
    log(delta + " ms");
});

readMeFiles.include(
    "README.tmpl", "package.json", "lib/node_modules/sake/options.js",
    "LICENSE", "AUTHORS", "Sakefile.*"
);

fileSync("README.md", readMeFiles, function (t) {
    log("Update " + t.name);
});

task("build", ["LICENSE", "README.md"]);
task("default", ["build"]);