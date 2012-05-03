
// tasks are going to be defined as synchronous
options.synchronous = true;

task("default", function (t) {
    log.info(t.name);
});

// after this they will asynchronous
options.synchronous = false;

task("async-task", ["default", "async-task-2"], function (t) {
    log.info(t.name);
    t.done();
});

taskAsync("async-task-2", function (t) {
    log.info(t.name);
    t.done();
});

taskAsync("test-sync-nocallback", function (t) {
    log.info(t.name);
});

taskAsync("test-sync-2-nocallback", function () {
    log.info(t.name);
    done();
});