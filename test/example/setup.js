
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

function slowParents(man, id, gens) {
  if (gens < 0) return
  var fid = parseInt(Math.random() * 100000)
    , mid = parseInt(Math.random() * 100000)
  man.got(id, {
    father: fid,
    mother: mid
  })
  setTimeout(function () {
    slowParents(man, fid, gens-1)
    setTimeout(function () {
      slowParents(man, mid, gens-1)
    }, 200 + Math.random()*500)
  }, 100 + Math.random()*200)
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

function go() {
  render('simple', d.svg({
    width: 260,
    height: 260
  }, Fan({
    transform: 'translate(130,130)',
    manager: man(4),
    mainTitle: function () {
      return 'Mensch'
    },
    gens: 5,
    id: 0
  })))
}

var slow = new Manager()
slowParents(slow, 0, 4)
render('slow', d.svg({
  width: 260,
  height: 260
}, Fan({
  transform: 'translate(130,130)',
  mainTitle: function () {
    return 'Mensch'
  },
  overTitle: function () {
    return 'Jared Lee Forsyth'
  },
  manager: slow,
  gens: 5,
  id: 0
})))

document.getElementById('go').addEventListener('click', go)

