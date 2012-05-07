
function taskAction (t) {
    log(t.namespace + " : " + t.name);
}

desc("default:default");
taskSync("default", taskAction);

namespace("foo", function () {

    desc("foo:default");
    taskSync("default", ["default:default"], taskAction);
    desc("foo:not-default");
    taskSync("not-default", taskAction);
    desc("foo:other-task");
    taskSync("other-task", ["not-default"], taskAction);
    
    namespace("baz", function () {
        desc("baz:not-default");
        taskSync("not-default", taskAction);
        desc("baz:other-task");
        taskSync("other-task", ["not-default"], taskAction);
        desc("baz:default");
        taskSync("default", ["foo:default", "default:default"], taskAction);
        desc("baz:some-task");
        taskSync("some-task", ["other-task", "foo:other-task"]);
    });
    
});
