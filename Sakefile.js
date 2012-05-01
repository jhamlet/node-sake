/*globals desc, task, taskSync, file, directory, fileSync, FileList, CLOBBER, CLEAN, write, read, log */
var Path    = require("path"),
    futil   = require("sake/file-utils"),
    files   = new FileList("**/*", "some/non-existing/file.js"),
    authorInfo,
    buildStart,
    buildComplete
;

desc("Keep the LICENSE file up-to-date.");
taskSync("LICENSE", ["read-authors"], function (t) {
    var year = new Date().getFullYear(),
        license = read(t.name, "utf8").split("\n")
    ;
    
    license[0] = "Copyright (c) " + year + " " + authorInfo;
    
    write(t.name, license.join("\n"), "utf8");
    log(t.name + " updated");
});

taskSync("read-authors", ["AUTHORS"], function (t) {
    authorInfo = read(t.prerequisites[0], "utf8").split("\n")[0];
    log("Read author info");
});

taskSync("pre-build", function (t) {
    buildStart = Date.now();
    log("Starting build...");
});

taskSync("build", ["pre-build", "LICENSE"], function (t) {
    var delta;
    
    buildComplete = Date.now();
    delta = buildComplete - buildStart;
    
    log("Build complete");
    log(delta + " ms");
});

taskSync("default", ["build"]);