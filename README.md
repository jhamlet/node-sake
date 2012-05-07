
Saké
====

> [S]cripted-r[ake] -- a JavaScript build tool similar to rake, or make.


Overview
--------

This package contains **saké**, a JavaScript build program that runs in node with capabilities similar to ruby's Rake.

Saké has the following features:

1.  `Sakefiles` (**saké’s** version of Rakefiles) are completely defined in standard JavaScript (or CoffeeScript, for those who want an even more Rake-like feel).
2.  Flexible `FileLists` that act like arrays but know about manipulating file names and paths.
3.  `clean` and `clobber` tasks are available for tidying up.
4.  _Asynchronous_ task handling, with easy options for specifying _synchronous_ tasks.
5.  Simple _namespacing_ of tasks to break projects into discreet parts.
5.  Many utility methods for handling common build tasks (rm, rm_rf, mkdir, mkdir_p, sh, cat, etc...)


Installation
------------

### Install with npm

Download and install with the following:

~~~
npm install -g sake
~~~

Command-Line Usage
------------------

~~~
% sake -h

usage: sake [TASK] [ARGUMENTS ...] [ENV=VALUE ...] [options]

[TASK]       Name of the task to run. Defaults to 'default'.
[ARGUMENTS ...]     Zero or more arguments to pass to the task invoked.
[ENV=VALUE ...]     Zero or more arguments to translate into environment variables.

options:
   -f, --sakefile PATH    PATH to Sakefile to run instead of searching for one.
   -n, --dry-run          Do a dry run without executing actions.
   -T, --tasks            List tasks with descriptions and exit.
   -P, --prereqs          List tasks and their prerequisites and exit.
   -r, --require MODULE   Require MODULE before executing Sakefile and expose the
                          MODULE under a sanitized namespace (i.e.: coffee-script =>
                          [sake.]coffeeScript).
   -S, --sync             Make all standard tasks 'synchronous' by default.
   -d, --debug            Enable additional debugging output.
   -q, --quiet            Suppress informational messages.
   -V, --version          Print the version of sake and exit.
   -h, --help             Print this help information and exit.

Sake will look within the current directory, and all parent directories, for the first `Sakefile`
it can find, and then invoke the TASK. If no task is given, it will try to invoke the task named
"default".

`Sakefile` can be one of "Sakefile", or "sakefile", with an optional extension of ".js", or
".coffee"
~~~

### Dependencies ###

These are installed when **sake** is installed.

~~~
nomnom:   >=1.5.x
async:    >=0.1.18
resolve:  >=0.2.x
proteus:  >=0.0.x
wordwrap: >=0.0.2
~~~


### Development Dependencies ###

Installed when you run `npm link` in the package directory.

~~~
mocha:      >=0.3.x
should:     >=0.5.x
underscore: >=1.3.x
~~~


Sakefile Usage
--------------

Within a `Sakefile`, Saké's methods are exported to the global scope, so you can invoke them directly:

~~~js
task("taskname", ["prereq1", "prereq2"], function (t) {
    // task action...
    t.done();
});
~~~
    
Within another node module you can `require("sake")` and access the methods on the exported object, or even run a block of code in the **saké** context (virtual machine):

~~~js
var sake = require("sake");
    
sake.task("taskname", ["prereq1", "prereq2"], function (t) {
    // task action...
    t.done();
});

// The function passed to sake#run is compiled and run in the sake context.
// The function **will not** have access to any variables in this scope,
// nor, will variables leak from the function's scope into this one.
sake.run(function () {
    var jsFiles = new FileList("src/js/**/*.js");
    
    require("sake/clean");
    
    task("script-min.js", jsFiles, function (t) {
        var cmd = "infuse " + jsFiles.map(function (path) {
                return "-i " + path;
            }) + " -E";
            
        sh(cmd, function (err, result) {
            write(t.name, result, "utf8");
            t.done();
        })
    });
    
    CLEAN.include("script-min.js");
});
~~~

The remainder of this documentation will assume that we are calling the methods from within a `Sakefile`.


Defining Tasks
--------------

The various task methods take the following arguments:

1.   `taskname`: `string` &mdash; naming the task
2.   `prerequisites`: _optional_ 
    *   an `array` of:
        *   `string` task name, or
        *   a `FileLists`, or 
        *   a `function` that returns one of the above.
    *   or, you can also pass a `FileList` in directly for `prerequisites`.
3.   `action`: an _optional_ `function` that will be called when the task is invoked.

All task methods return the task *instance*.

If a task is already defined, it will be augmented by the additional arguments. So, this:

~~~js
task("one", ["othertask"], function (t) {
    // do action one...
    t.done();
});

task("one", function (t) {
    // do action two...
    t.done();
});

task("othertask");
~~~

Would result in a task "othertask" with no prerequisites, and no action, and a task "one" with "othertask" as a prerequisite and the two functions as its actions.

**Note** how the dependent task was defined *after* it was required as a prerequisite. Task prerequisites are not resolved until the task is invoked. This leads to flexibility in how to compose your tasks and prerequisite tasks.


### File Tasks ###

File tasks are created with the (appropriately named) `file` method. File tasks, however, are only triggered if the file doesn't exist, or the modification time of any of its prerequisites is newer than itself.

~~~js
file("path/to/some/file", function (t) {
    cp("other/path", t.name);
    t.done();
});
~~~

The above task would only be triggered if `path/to/some/file` did not exist.

The following:

~~~js
file("combined/file/path", ["pathA", "pathB", "pathC"], function (t) {
    write(t.name, cat(t.prerequisites), "utf8");
    t.done();
});
~~~

would be triggered if `path/to/some/file` did not exist, or its modification time was earlier than any of its prerequisites (`pathA`, `pathB`, or  `pathC`).


### Directory Tasks ###

Directory tasks, created with the `directory` method, are tasks that will only be called if they do not exist. A task will be created for the named directory (and for all directories along the way) with the action of creating the directory.

Directory tasks do not take any `prerequisites` or an `action` when first defined, however, they may be augmented with such after they are created:

~~~js
directory("dir/path/to/create");

task("dir/path/to/create", ["othertask"], action (t) {
    //... do stuff
    t.done();
});
~~~


### File Create Tasks ###

A file create task is a file task, that when used as a prerequisite, will be needed if, and only if, the file has not been created. Once created, it is not re-triggered if any of its prerequisites are newer, nor does it trigger any rebuilds of tasks that depend on it whenever the file is updated.

~~~js
fileCreate("file/path/to/create.ext", ["pathA", "pathB"], function (t) {
    // create file...
    t.done();
});
~~~


(A)Synchronicity and Tasks
--------------------------

In **saké** all task actions are assumed to be *asynchronous* and an action must call its task's `done` method to tell **saké** that it is done processing stuff.

~~~js
task("long task", function (t) {
    sh("some long running shell command", function (err, result) {
        // do stuff...
        t.done();
    });
});
~~~

Alternatively, you can use the `Sync` version of a task to add a *synchronous* action, and `done` will be called for you after the function completes.

~~~js
taskSync("longtask", function (t) {
    cp("some/dir/file.js", "other/dir/file.js");
});
~~~

There are `Sync` versions of all the core tasks: `taskSync`, `fileSync`, and `fileCreateSync`. Thre are also `Async` versions of each task: `taskAsync`, `fileAsync`, and `fileCreateAsync`. The actions created for a `directory` task are *synchronous*. You can add *asynchronous* task actions after the initial definition.

Thirdly, you can specify that all of the core task creation functions generate *synchronous* actions by setting **saké's** "sync" option to `true`, or by use of the command-line option `-S, --sync`.

~~~js
sake.options.sync = true;

taskSync("longtask", function (t) {
    cp("some/dir/file.js", "other/dir/file.js");
});

//... define more synchronous tasks

//... and then revert to async
sake.options.sync = false;
~~~

Ultimately, it is up to the **saké** script author to correctly designate a task action as *synchronous* or *asynchronous*. Nothing prevents the running of an *asynchronous* function within a task's *synchronous* action. If nothing is dependent on the result of that action, then no problem would occur. It's when other tasks rely on the completion of certain *asynchronous* actions, that problems may arise.

In the case of *asynchronous* actions, **Saké** will issue a `WARNING` when it can not detect a `done()` call within that action.


Namespaces
----------

**Saké** supports simple name spacing of tasks. Simply prepend the namespace before the task name with a colon ":". This can be done when defining a task, or in the list of prerequisites for a task.

~~~js
// Defines a task 'fuz' in the namespace 'foo' that depends on the task 'buz'
// in the namespace 'baz'
task("foo:fuz", ["baz:buz"], function (t) {
    //...
    t.done();
});
~~~

Then invoke the task as so:

~~~
% sake foo:fuz
~~~

You can also use the convenience function `namespace` to wrap your task definitions for a particular namespace. Any _namespace naked_ definitions will first be tried in the local namespace, otherwise they will fall-back to the default namespace:

~~~js

task("default", function (t) {
    //...
    t.done():
});

task("bazil", function (t) {
    //...
    t.done():
});

// define within the 'foo' namespace
namespace("foo", function () {
    
    // defines 'foo:foom' task
    task("foom", function (t) {
        //...
        t.done():
    });
    
});

namespace("baz", function () {
    
    // this task is defined in the 'baz' namespace, and depends on the
    // 'foom' task from the 'foo' namespace
    task("bazil", ["foo:foom"], function (t) {
        //...
        t.done():
    });
    // This task is also defined in the 'baz' namespace. It depends on 
    // the 'bazil' task, which is also defined in 'baz' namespace. It
    // also depends on the 'default' task in the 'default' (top-level)
    // namespace.
    task("buzil", ["bazil", "default"], function (t), {
        //...
        t.done():
    });
    // If 'bazil' wasn't defined in the 'baz' namespace, it would resolve
    // to the 'default' namespace task.
});
~~~

**Note:** prerequisite names are tied to the defined task's namespace. i.e: If a task "foo:fuz" depends on "foom" **saké** will look in the "foo" namespace for "foom", and then the "default" namespace.

**Note:** although the `namespace` functions can be nested, **saké** does not track the hierarchy of `namespace` calls -- if a dependent task is not found in the current task's namespace, it will look for it in the default namespace.


File Lists
----------

FileLists are lists of file paths.

~~~js
new FileList("*.scss");
~~~

Would contain all the file paths with a ".scss" extension in the top-level directory of your project.

You can use FileLists pretty much like an `Array`. You can iterate them (with `forEach, filter, reduce`, etc...), `concat` them, `splice` them, and you get back a new FileList object.

To add files, or glob patterns to them, use the `#include` method:

~~~js
var fl = new FileList("*.scss");
fl.include("core.css", "reset.css", "*.css");
~~~

You can also `exlucude` files by Glob pattern, `Regular Expression` pattern, or by use of a `function` that takes the file path as an argument and returns a `truthy` value to exclude a file.

~~~js
// Exclude by RegExp
fl.exclude(/^dev-.*\.css/);

// Exclude by Glob pattern
fl.exclude("dev-*.css");

// Exclude by function
fl.exclude(function (path) {
    return FS.statSync(path).mtime.getTime() < (Date.now() - 60 * 60 * 1000);
});
~~~

To get to the actual items of the FileList, use the `#items` property, or the `#toArray` method, to get a plain array back. You can also use the `#get` or `#set` methods to retrieve or set an item.

FileLists are *lazy*, in that the actual file paths are not determined from the include and exclude patterns until the individual items are requested. This allows you to define a FileList and incrementally add patterns to it in the Sakefile file. The FileList paths will not be resolved until the task that uses it as a prerequisite actually asks for the final paths.


### FileList Utility Properties & Methods ###

*   `existing` &mdash; will return a new `FileList` with all of the files that actually exist.
*   `notExisting` &mdash; will return a new `FileList` of all the files that do not exist.
*   `extension(ext)` &mdash; returns a new `FileList` with all paths that match the given extension.

~~~js
fl.extension(".scss").forEach(function (path) {
    //...
});
~~~

*   `grep(pattern)` &mdash; get a `FileList` of all the files that match the given `pattern`. `pattern` can be a plain `String`, a `Glob` pattern, a `RegExp`, or a `function` that receives each path and can return a truthy value to include it.
*   `clearExcludes()` &mdash; clear all exclude patterns/functions.
*   `clearIncludes()` &mdash; clear all include patterns.

By default, a `FileList` excludes directories. To allow directories call `FileList#clearExcludes()` before requesting any items.


The "clean" and "clobber" Tasks, and The CLEAN and CLOBBER FileLists
--------------------------------------------------------------------

Within a `Sakefile`:

~~~js
// defines the CLEAN FileList and 'clean' task
require("sake/clean");

// defines the above, and also the CLOBBER FileTask and 'clobber' task
require("sake/clobber");
~~~

When the "clean" task is run, it will remove any files that have been included in the `CLEAN FileList`. "clobber" will remove any file, or directory, included in the `CLOBBER FileList`.


Saké Utility Functions
----------------------

Saké defines a few utility functions to make life a little easier in an asynchronous world. Most of these are just wrappers for `node`'s File System (`require("fs")`) utility methods.

### Synchronous Utilities ###

*   `mkdir(dirpath, mode="777")` &mdash; create the `dirpath` directory, if it doesn't already exist.
*   `mkdir_p(dirpath, mode="777"])` &mdash; as above, but create all intermediate directories as needed.
*   `rm(path, [path1, ..., pathN])` &mdash; remove one or more paths from the file system.
*   `rm_rf(path, [path1, ..., pathN])` &mdash; as above, and remove directories and their contents.
*   `cp(from, to)` &mdash; copy a file from `from` path to `to` path.
*   `cp_r(from, to)` &mdash; copy all files from `from` path to `to` path.
*   `mv(from, to)` &mdash; move a file from `from` path to `to` path.
*   `ln(from, to)` &mdash; create a hard link from `from` path to `to` path.
*   `ln_s(from, to)` &mdash; create a symlink from `from` path to `to` path.
*   `cat(path, [path1, ..., pathN])` &mdash; read all supplied paths and return their contents as a string. If an argument is an `Array` it will be expanded and those paths will be read.
*   `readdir(path)` &mdash; returns the files of directory `path`.
*   `read(path, [enc])` &mdash; read the supplied file path. Returns a `buffer`, or a `string` if `enc` is given.
*   `write(path, data, [enc], mode="w")` &mdash; write the `data` to the supplied file `path`. `data` should be a `buffer` or a `string` if `enc` is given. `mode` is a `string` of either "w", for over write,  or "a" for append.
*   `slurp(path, [env])` &mdash; alias for `read`
*   `spit(path, data, [enc], mode="w")` &mdash; alias for `write`


### Asynchronous Utilities ###

*   `sh(cmd, fn(error, result))` &mdash; execute shell `cmd`. In the callback function, `error` will be a truthy value if there was an error, and `result` will contain the STDERR returned from `cmd`. Otherwise, `result` will contain the STDOUT from the `cmd`.


Report an Issue
---------------

* [Bugs](http://github.com/jhamlet/node-sake/issues)
* Contact the author: <jhamlet@hamletink.com>


License
-------

> Copyright (c) 2012 Jerry Hamlet <jerry@hamletink.com>
> 
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation
> files (the "Software"), to deal in the Software without
> restriction, including without limitation the rights to use,
> copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the
> Software is furnished to do so, subject to the following
> conditions:
> 
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
> 
> The Software shall be used for Good, not Evil.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
> OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
> HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
> WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
> FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
> OTHER DEALINGS IN THE SOFTWARE.
