
var Fan = require('fan/node')
  , Manager = require('manager')
  , d = React.DOM

function render(id, what) {
  React.renderComponent(what, document.getElementById(id))
}

function man(gens) {
  var man = new Manager()
  parents(man, 0, gens)
  return man
}

function parents(man, id, gens) {
  if (gens < 0) return
  var fid = parseInt(Math.random() * 100000)
    , mid = parseInt(Math.random() * 100000)
  man.got(id, {
    father: fid,
    mother: mid
  })
  parents(man, fid, gens-1)
  parents(man, mid, gens-1)
}

render('simple', d.svg({
  width: 400,
  height: 400
}, Fan({
  transform: 'translate(100,100)',
  manager: man(4),
  id: 0
})))

