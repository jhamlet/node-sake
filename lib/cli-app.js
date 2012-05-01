
var Proteus = require("proteus"),
    FS      = require("fs"),
    Path    = require("path"),
    nutil   = require("util"),
    sutil   = require("sake/util"),
    Task    = require("sake/task"),
    DEFAULT_SAKEFILES = [
        "Sakefile", "sakefile", "Sakefile.js", "sakefile.js",
        "Sakefile.coffee", "sakefile.coffee",
    ]
;

module.exports = {
    
    run: function () {
        var opts = this.options,
            cmd  = opts._[0],
            taskArgs = opts._.slice(1).map(sutil.jsonToValue),
            task
        ;
        
        this.sake = require("sake")(opts);
        
        this.loadSakefile(opts.sakefile);
        
        this.processRunOptions();
        
        Task.invoke(opts.task, taskArgs);
    },
    
    processRunOptions: function () {
        var opts = this.options,
            exit = false;
        
        if (opts.listTasks) {
            this.listTasks();
            exit = true;
        }
        else if (opts.listPrereqs) {
            this.listTasksAndPrerequisites();
            exit = true;
        }
        
        if (exit) {
            process.exit(0);
        }
    },
    
    loadSakefile: function (filepath) {
        var dir;
        
        filepath = filepath || this.sakefileLocation();

        if (!Path.existsSync(filepath)) {
            throw new Error("Can not find a Sakefile.");
        }

        filepath = Path.resolve(filepath);
        this.options.sakefile = filepath;
        
        dir = Path.dirname(filepath);
        process.chdir(dir);
        this.sake.log("sake in " + dir);

        this.sake.load(filepath);
    },
    
    sakefileLocation: function () {
        var here = process.cwd(),
            start = here,
            filename
        ;
            
        while (!(filename = this.haveSakefile(here)) && here !== "/") {
            process.chdir("..");
            here = process.cwd();
        }
        
        process.chdir(start);
        
        if (filename) {
            return Path.join(here, filename);
        }
    },
    
    haveSakefile: function (here) {
        var filenames = FS.readdirSync(here),
            len = filenames.length,
            i = 0,
            f
        ;
        
        for (; i < len; i++) {
            f = filenames[i];
            if (~DEFAULT_SAKEFILES.indexOf(f)) {
                return f;
            }
        }
    },
    
    listTasks: function () {
        var nameW = 0;
        
        Task.getAll().filter(function (task) {
            return task.description;
        }).map(function (task) {
            var name = task.name,
                len  = name.length
            ;
            
            nameW = len > nameW ? len : nameW;
            
            return {name: name, description: task.description};
        }).forEach(function (obj) {
            var name = obj.name,
                len  = name.length
            ;
            
            console.log(
                name +
                Array(nameW - len + 5).join(" ") + "# " +
                obj.description
            );
        });
    },
    
    get options () {
        return require("./options");
    }
};
