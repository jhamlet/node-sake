
namespace("a", function () {
    
    taskSync("one", function (t) {
        log(t.fqn);
    });
});