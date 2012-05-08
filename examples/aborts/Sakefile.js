
function taskAction (t) {
    log(t.name);
    t.done();
}

task("one", taskAction);

task("two", ["one"], function (t) {
    log(t.name + " action 1");
    if (process.env.ABORT) {
        t.abort(
            "I don't want to complete this task",
            process.env.ABORT_CODE ? process.env.ABORT_CODE : undefined
        );
    }
    else {
        t.done();
    }
});

task("two", function (t) {
    log(t.name + " action 2");
    t.done();
});

task("three", ["two"], taskAction);