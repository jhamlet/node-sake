
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
task("two");

desc("Test text file.");
file("test.txt", ["LICENSE"], function (t) {
    write(t.name, read(t.prerequisites[0], "utf8"), "utf8");
});

desc("Default task.");
task("default", ["test.txt"]);

// console.log(task("one").prerequisites.length);
// console.log(Object.keys(Task.tasks));
// console.log(Task.getAll());
// console.log(Task.get("one") + "");