/*globals suite, test, setup, teardown, directory, file, task, read, write, CLOBBER, CLEAN*/

var should  = require("should"),
    Path    = require("path"),
    FS      = require("fs"),
    sake    = require("sake"),
    futil   = require("sake/file-utils"),
    existsSync = FS.existsSync || Path.existsSync,
    cwd     = process.cwd()
;
//---------------------------------------------------------------------------
// SETUP
//---------------------------------------------------------------------------
process.chdir(__dirname); // Gets us in the right directory
sake.options.quiet = true; // Turn off sake info messages
// Runs the function in sake context. The function **does not** have access to
// this local scope.
sake.run(function () {
    require("sake/clobber");
    
    directory("tmp-tasks");
    CLOBBER.include("tmp-tasks");

    file("tmp-tasks/hello.txt", ["tmp-tasks"], function (t) {
        write(t.name, "hello world", "utf8");
        t.done();
    });
    CLEAN.include("tmp-tasks/hello.txt");
    
    file("tmp-tasks/hello-hello.txt", ["tmp-tasks/hello.txt"], function (t) {
        var txt = read(t.prerequisites[0], "utf8");
        write(t.name, txt + "\n" + txt, "utf8");
        t.done();
    });
    CLEAN.include("tmp-tasks/hello-hello.txt");
    
    task("hello-hello", ["tmp-tasks/hello-hello.txt"]);
});
process.chdir(cwd);

//---------------------------------------------------------------------------
// TESTS
//---------------------------------------------------------------------------
suite("File Tasks", function () {
    // Make sure we are in the correct directory
    setup(function () {
        process.chdir(__dirname);
    });
    // and then move back to the original
    teardown(function () {
        process.chdir(cwd);
    });
    
    test("Create file and parent directory", function () {
        var task = sake.Task.get("tmp-tasks/hello.txt");
        task.on("complete", function (t) {
            // console.log(t.name + " complete");
            existsSync("tmp-tasks").should.eql(true);
            existsSync("tmp-tasks/hello.txt").should.eql(true);
            
            FS.readFileSync("tmp-tasks/hello.txt", "utf8").should.eql("hello world");
        });
        task.invoke();
    });
    
    test("Build a file from a dependent file task", function () {
        var task = sake.Task.get("hello-hello");
        task.on("complete", function (t) {
            existsSync("tmp-tasks/hello-hello.txt").should.eql(true);
            FS.readFileSync("tmp-tasks/hello-hello.txt", "utf8").should.eql(
                "hello world\nhello world"
            );
        });
        task.invoke();
    });
    
    test("Clean up generated files", function () {
        var task = sake.Task.get("clean");
        task.on("complete", function (t) {
            existsSync("tmp-tasks/hello.txt").should.eql(false);
            existsSync("tmp-tasks/hello-hello.txt").should.eql(false);
        });
        task.invoke();
    });
    
    test("Clobber everything", function () {
        var task = sake.Task.get("clobber");
        task.on("complete", function (t) {
            // console.log(t.name + " complete");
            existsSync("tmp-tasks").should.eql(false);
        });
        task.invoke();
    });
});
