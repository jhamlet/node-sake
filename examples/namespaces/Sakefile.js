
function taskAction (t) {
    log(t.namespace + " : " + t.name);
}

taskSync("default", taskAction);

namespace("foo", function () {

    taskSync("default", ["default"], taskAction);

    namespace("baz", function () {
        taskSync("default", ["foo:default", "default"], taskAction);
    });
    
});
