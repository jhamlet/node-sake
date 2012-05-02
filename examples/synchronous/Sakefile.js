
task("default", function (t) {
    log(t.name);
});

taskAsync("async-task", ["default", "async-task-2"], function (t) {
    log(t.name);
    t.done();
});

taskAsync("async-task-2", function (t) {
    log(t.name);
    t.done();
});