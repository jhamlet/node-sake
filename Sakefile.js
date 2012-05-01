
var Path    = require("path"),
    futil   = require("sake/file-utils"),
    files   = new FileList("**/*", "some/non-existing/file.js")
;

require("sake/clean");
require("sake/clobber");

desc("Sample task one.");
task("one", ["two"], function (t) {
    // task actions
    t.done();
});

desc("Sample task two.");
task("two", function (t) {
    t.done();
});

directory("tmp/path/directory");
CLOBBER.include("tmp");

desc("Test text file.");
fileSync("tmp/path/directory/test.txt", ["tmp/path/directory", "LICENSE"], function (t) {
    console.log(t.name);
    write(t.name, read(t.prerequisites[1], "utf8"), "utf8");
});
CLEAN.include("tmp/path/directory/test.txt");

desc("Default task.");
task("default", ["tmp/path/directory/test.txt"]);

taskSync("testSync", function (t) {
    console.log(t.name);
});

taskSync("testSync2", ["testSync"], function (t) {
    console.log(t.name);
});

// console.log(task("one").prerequisites.length);
// console.log(Object.keys(Task.tasks));
// console.log(Task.getAll());
// console.log(Task.get("one") + "");