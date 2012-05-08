

namespace "f", ()->
  taskSync "one", (t)->
    log t.fqn
