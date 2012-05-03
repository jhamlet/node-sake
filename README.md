
Saké
====

> [S]cripted-r[ake] -- a JavaScript build tool similar to rake, or make.

This package contains **saké**, a JavaScript build program that runs in node with capabilities similar to ruby's Rake.

Saké has the following features:

1.  `Sakefiles` (saké’s version of Rakefiles) are completely defined in standard JavaScript (or CoffeeScript, for those who want an even more Rake-like feel).
2.  Flexible `FileLists` that act like arrays but know about manipulating file names and paths.
3.  `clean` and `clobber` tasks are available for tidying up.
4.  _Asynchronous_ task handling, with easy options for secifying _synchronous_ tasks.
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
   -P, --prerequisites    List tasks and their prerequisites and exit.
   -r, --require MODULE   Require MODULE before executing Sakefile and expose the
                          MODULE under a sanitized namespace (i.e.: coffee-script =>
                          [sake.]coffeeScript).
   -S, --synchronous      Make all standard tasks 'synchronous' by default.
   -d, --debug            Enable additional debugging output.
   -q, --quiet            Suppress informational messages.
   -V, --version          Print the version of sake and exit.
   -h, --help             Print this help information and exit.

Sake will look within the current directory, and all parent directories, for the first `Sakefile`
it can find, and then invoke the TASK. If no task is given, it will try to invoke the task named
"default".

`Sakefile` can be one of "Sakefile", "sakefile", "Sakefile.js", "sakefile.js", "Sakefile.coffee",
or "sakefile.js"
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
    
Within another node module you can `require("sake")` and access the methods on the exported object:

~~~js
var sake = require("sake");
    
sake.task("taskname", ["prereq1", "prereq2"], function (t) {
    // task action...
    t.done();
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

Alternatively, you can use the `Sync` version of a task to add an *synchronous* action, and `done` will be called for you.

~~~js
taskSync("longtask", function (t) {
    cp("some/dir/file.js", "other/dir/file.js");
});
~~~

There are `Sync` versions of all the core tasks: `taskSync`, `fileSync`, and `fileCreateSync` as well as `Async` versions also: `taskAsync`, `fileAsync`, and `fileCreateAsync`. `directory` tasks are always initially *synchronous*. You can add *asynchronous* task actions after the initial definition.

Thirdly, you can just specify that all task actions are *synchronous* by setting saké's "synchronous" option to `true`, or by use of the command-line options `-S, --synchronous`.

~~~js
sake.options.synchronous = true;

taskSync("longtask", function (t) {
    cp("some/dir/file.js", "other/dir/file.js");
});

//... define more synchronous tasks

//... and then revert to async
sake.options.synchronous = false;
~~~


File Lists
----------

FileLists are lists (an `Array`) of files.

~~~js
new FileList("*.scss");
~~~

Would contain all the files with a ".scss" extension in the top-level directory of your project.

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
*   `notExisting` &mdash; will return a new `FileList` all of the files that do not exist.
*   `extension(ext)` &mdash; returns a new `FileList` with all paths that match the given extension.

~~~js
fl.extension(".scss").forEach(function (path) {
    //...
});
~~~

*   `grep(pattern)` &mdash; get a `FileList` of all the files that match the given `pattern`. `pattern` can be a plain `String`, a `Glob` pattern, a `RegExp`, or a `function` that receives each path and can return a truthy value include it.
*   `clearExcludes()` &mdash; clear all exclude patterns/functions.
*   `clearIncludes()` &mdash; clear all include patterns.


Saké Utility Functions
----------------------

Saké defines a few utility functions to make life a little easier in an asynchronous world. Most of these are just wrappers for `node`'s File System (`require("fs")`) utility methods.

### Synchronous Utilities ###

*   `mkdir(dirpath, mode="755")` &mdash; create the `dirpath` directory, if it doesn't already exist.
*   `mkdir_p(dirpath, mode="755"])` &mdash; as above, but create all intermediate directories as needed.
*   `rm(path, [path1, ..., pathN])` &mdash; remove one or more paths from the file system.
*   `rm_rf(path, [path1, ..., pathN])` &mdash; as above, and remove directories and their contents.
*   `cp(from, to)` &mdash; copy a file from `from` path to `to` path
*   `mv(from, to)` &mdash; move a file from `from` path to `to` path.
*   `ln(from, to)` &mdash; create a hard link from `from` path to `to` path.
*   `ln_s(from, to)` &mdash; create a symlink from `from` path to `to` path.
*   `cat(path, [path1, ..., pathN])` &mdash; read all supplied paths and return their contents as a string. If an argument is an `Array` it will be expanded and those paths will be read.
*   `read(path, [enc])` &mdash; read the supplied file path. Returns a `buffer`, or a `string` if `enc` is given.
*   `write(path, data, [enc], mode="w")` &mdash; write the `data` to the supplied file `path`. `data` should be a `buffer` or a `string` if `enc` is given. `mode` is a `string` of either "w", for over write,  or "a" for append.
*   `slurp(path, [env])` &mdash; alias for `read`
*   `spit(path, data, [enc], mode="w")` &mdash; alias for `write`


### Asynchronous Utilities ###

*   `sh(cmd, fn(error, result))` &mdash; execute shell `cmd`. In the callback function, `error` will be a truthy value if there was an error, and `result` will contain the STDERR returned from `cmd`. Otherwise, `result` will contain the STDOUT from the `cmd`.
