
namespace("c", function () {
    
    taskSync("one", function (t) {
        log(t.fqn);
    });
});