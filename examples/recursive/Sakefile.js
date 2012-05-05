
taskSync("main", ["build"], function (t) {
    log.info(t.name);
});

taskSync("build", ["main"], function (t) {
    var main = Task.get("build");
    
    main.on("complete", function () {
        log.info(t.name);
        t.done();
    });

});

task("default", ["main"]);


task("defaultB");

task("t1", ["ta"]);
task("t2", ["ta"]);
task("t3", ["t1"]);
task("ta");

task("defaultB", ["t1", "t2", "t3"]);






































