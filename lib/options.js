
var nomnom  = require("nomnom"),
    FS      = require("fs"),
    Path    = require("path"),
    sutil   = require("sake/util"),
    pkgFile = Path.join(__dirname, "..", "package.json"),
    pkgJson = FS.readFileSync(pkgFile, "utf8"),
    pkgInfo = JSON.parse(pkgJson),
    opts = {
        task: {
            string: "TASK",
            help: "Name of the task to run. Defaults to 'default'.",
            position: 0,
            default: "default"
        },
        
        taskArgs: {
            string: "[ARGUMENTS ...]",
            help: "Zero or more arguments to pass to the task invokation.",
            position: 1
        },
        
        envArgs: {
            string: "[ENV=VALUE ...]",
            help: "Zero or more arguments to translate into environment variables.",
            position: 2
        },
        
        sakefile: {
            string: "-f, --sakefile PATH",
            help: "Specify PATH to Sakefile to run instead of searching for one."
        },

        listTasks: {
            string: "-T, --tasks",
            help: "List tasks with descriptions and exit.",
            flag: true
        },
        
        listPrereqs: {
            string: "-P, --prerequisites",
            help: "List tasks and their prerequisites and exit.",
            flag: true
        },
        
        debug: {
            string: "-d, --debug",
            help: "Enable additional debugging output.",
            flag: true,
            default: false
        },
        
        quiet: {
            string: "-q, --quiet",
            help: "Suppress messages to standard output.",
            flag: true,
            default: false
        },
        
        version: {
            string: "-V, --version",
            help: "Print the version of sake and exit.",
            flag: true,
            callback: function () {
                return "sake version " + pkgInfo.version;
            }
        },

        help: {
            string: "-h, --help",
            help: "Print this help information and exit.",
            flag: true
        }
    },
    nomArgs = []
;

//---------------------------------------------------------------------------
// Process Environment Arguments
//---------------------------------------------------------------------------
process.argv.slice(2).forEach(function (arg) {
    var i, key, val;
    
    if (~(i = arg.indexOf("="))) {
        key = arg.slice(0, i);
        val = sutil.jsonToValue(arg.slice(i+1));
        process.env[key] = val;
    }
    else {
        nomArgs.push(arg);
    }
});

//---------------------------------------------------------------------------
// Export the parsed options
//---------------------------------------------------------------------------
module.exports = nomnom.
    script(pkgInfo.name).
    options(opts).
    parse(nomArgs);
