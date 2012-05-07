
function taskAction (t) {
    log(t.name);
    t.done();
}

task("one", taskAction);

task("two", ["one"], function (t) {
    log(t.name + " action 1");
    t.abort("I don't want to complete this task", 2);
});

task("two", function (t) {
    log(t.name + " action 2");
    t.done();
});

task("three", ["two"], taskAction);