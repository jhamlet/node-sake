/*globals suite, test, setup, teardown */

var should   = require("should"),
    FS       = require("fs"),
    FileList = require("sake/file-list"),
    Task     = require("sake/task"),
    FileTask = require("sake/file-task")
;

suite("Sake FileList", function () {
    
    test("Include Glob", function () {
        var fl = new FileList();
        
        fl.include("test/test-*");
        
        fl.items.should.include("test/test-file-list.js");
    });
    
    test("Exclude Glob", function () {
        var fl = new FileList();
        
        fl.include("test/*");
        // console.log(fl.toJSON(true));
        
        fl.exclude("test/test-*");
        
        fl.items.should.not.include("test/test-file-list.js");
    });
    
    test("Exclude RegExp", function () {
        var fl = new FileList();
        
        fl.include("test/*");
        fl.exclude(/test\/test.*\.js$/);
        
        fl.items.should.not.include("test/test-file-list.js");
    });
    
    test("Trap non-existant files", function () {
        var fl = new FileList("test/*");
        fl.include("test/test-fake-name");
        fl.existing.items.should.not.include("test/test-fake-name");
        fl.notExisting.items.should.include("test/test-fake-name");
    });
    
    test("FileList expands into task dependencies", function () {
        var fl = new FileList("test/*"),
            task;
        
        fl.exclude(/mocha/);
        
        task = new FileTask("test.txt", fl, function (t) {
            var preqs = t.prerequisites;
            
            preqs.should.not.include("test/mocha.opts");
            preqs.should.include("test/test-file-list.js");
            
            t.done();
        });
        
        task.invoke();
    });
    
    test("Filtering FileList returns a cloned FileList", function () {
        var origFl = new FileList("lib/**/*").exclude("sake/*");
        
        origFl.grep(/sake/).should.not.equal(origFl);
    });
    
    test("Chaining FileList methods together", function () {
        var origFl = new FileList("**/*"),
            newList;
        
        origFl.exclude(/^(?!lib)/);
        
        newList = origFl.extension(".js").items;
        newList.forEach(function (f) {
            f.should.match(/^lib/);
        });
    });
    
    test("Clone a FileList", function () {
        var origFl = new FileList().include("**/*"),
            cloneFl
        ;
        
        cloneFl = origFl.extension(".js").exclude(/^(?!lib)/);
        
        cloneFl.forEach(function (f) {
            f.should.match(/^lib/);
            f.should.match(/\.js$/);
        });
    });
});
