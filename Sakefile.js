/*globals desc, task, taskSync, file, directory, fileSync, FileList, CLOBBER, CLEAN, spit, slurp, log, sh */
var Path        = require("path"),
    authorInfo  = read("AUTHORS", "utf8").split("\n")[0],
    buildStart  = new Date(),
    readMeFiles = new FileList(),
    buildComplete
;

//---------------------------------------------------------------------------
// Defines the CLEAN file-list and the 'clean' task
//---------------------------------------------------------------------------
require("sake/clean");
//---------------------------------------------------------------------------
// Overall build tasks
//---------------------------------------------------------------------------
taskSync("pre-build", function (t) {
    log.info("Starting build at " + buildStart);
});

taskSync("build", ["pre-build"], function (t) {
    var delta;
    
    buildComplete = new Date();
    delta = buildComplete.getTime() - buildStart.getTime();
    
    log.info("Build complete at " + buildComplete);
    log.info(delta + " ms");
});
//---------------------------------------------------------------------------
// LICENSE
//---------------------------------------------------------------------------
desc("Keep the LICENSE file up-to-date.");
fileSync("LICENSE", ["AUTHORS"], function (t) {
    var year = new Date().getFullYear(),
        license = read(t.name, "utf8").split("\n")
    ;
    
    license[0] = "Copyright (c) " + year + " " + authorInfo;
    
    write(t.name, license.join("\n"), "utf8");
    log.info(t.name + " updated");
});
//---------------------------------------------------------------------------
// README file
//---------------------------------------------------------------------------
readMeFiles.include(
    "README.tmpl", "package.json", "lib/node_modules/sake/options.js",
    "LICENSE", "AUTHORS", "Sakefile.*"
);

desc("Generate the README.md documentation");
file("README.md", readMeFiles, function (t) {
    var _ = require("underscore"),
        pkgInfo = JSON.parse(slurp("package.json", "utf8")),
        tmpl = _.template(slurp(t.prerequisites[0], "utf8")),
        tmplParams = {
            pkg: pkgInfo,
            license: slurp("./LICENSE", "utf8"),
            usage: ""
        }
    ;
    
    sh("./bin/sake -h", function (err, txt) {
        tmplParams.usage = txt.split("\n").slice(1, -2).join("\n");
        spit(t.name, tmpl(tmplParams), "utf8");
        log.info("Update " + t.name);
        t.done();
    });
    
});
CLEAN.include("README.md");
//---------------------------------------------------------------------------
// link up
//---------------------------------------------------------------------------
task("build", ["LICENSE", "README.md"]);
task("default", ["build"]);