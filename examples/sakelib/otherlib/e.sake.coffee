

namespace "e", ()->
  taskSync "one", (t)->
    log t.fqn
