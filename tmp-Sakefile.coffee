
Path  = require "path"
futil = require "sake/file-utils"

require "sake/clean"
require "sake/clobber"

task "one", ["two"], (t)->
  # task actions
  t.done()
