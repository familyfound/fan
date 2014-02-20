
var d = React.DOM
  , utils = require('./utils')
  , Tip = require('tip')

function tipPosition(x, y, ew, eh, pos) {
  var pad = 15;
  switch (pos) {
    case 'top':
      return {
        top: y - eh - pad,
        left: x - ew / 2
      }
    case 'bottom':
      return {
        top: y + pad,
        left: x - ew / 2
      }
    case 'right':
      return {
        top: y - eh / 2,
        left: x + pad
      }
    case 'left':
      return {
        top: y - eh / 2,
        left: x - ew - pad
      }
    case 'top left':
      return {
        top: y - eh,
        left: x - ew + pad
      }
    case 'top right':
      return {
        top: y - eh,
        left: x - pad
      }
    case 'bottom left':
      return {
        top: y,
        left: x - ew + pad
      }
    case 'bottom right':
      return {
        top: y,
        left: x - pad
      }
    default:
      throw new Error('invalid position "' + pos + '"');
  }
}

function positionTip(x, y, tip) {
  tip.show(x, y)
  var ew = tip.el.clientWidth
    , eh = tip.el.clientHeight
    , dir = tip.suggested('right', {left: x, top: y}) || 'right'
    , xy = tipPosition(x, y, ew, eh, dir)
  tip.position(dir)
  tip.show(xy.left, xy.top)
}

var Node = module.exports = React.createClass({
  displayName: 'FanNode',
  getDefaultProps: function () {
    return {
      id: null,
      manager: null,
      transform: undefined,
      getClasses: function () {},
      onClick: function () {},
      mainTitle: function () {},
      overTitle: function () {},
      tip: false,
      attr: null,
      gen: 0,
      pos: 0,
      options: {
        sweep: Math.PI*4/3,
        offset: 0,
        width: 20,
        doubleWidth: false
      }
    }
  },
  getInitialState: function () {
    return {
      data: {},
    }
  },
  componentDidMount: function () {
    this.tip = new Tip('loading')
    if (!this.props.manager) return
    this.props.manager.on(this.props.id, this.gotData)
  },
  componentWillUnmount: function () {
    if (this.tip) this.tip.hide()
    if (!this.props.manager) return
    this.props.manager.off(this.props.id, this.gotData)
  },
  gotData: function (data) {
    this.setState({data: data})
  },
  showTip: function (e) {
    positionTip(e.pageX, e.pageY, this.tip)
  },
  hideTip: function () {
    this.tip.hide()
  },
  componentWillReceiveProps: function (props) {
    if (props.id !== this.props.id) {
      if (!this.props.manager) return
      this.props.manager.off(this.props.id, this.gotData)
      this.props.manager.on(props.id, this.gotData)
    }
  },
  componentDidUpdate: function () {
    if (this.tip && this.props.tip) {
      this.tip.message(this.props.tip(this.state.data))
    }
  },
  onClick: function () {
    if (this.tip) this.tip.hide()
    this.props.onClick(this.props.id, this.state.data)
  },
  mainTitle: function () {
    var x = 0
      , y = this.props.options.width * 2
      , title = this.props.mainTitle(x, y)
    if ('string' !== typeof title) {
      return title
    }
    return d.text({
      className: 'fan__main-title',
      style: {
        fontSize: this.props.options.width/2
      },
      x: x,
      y: y
    }, title)
  },
  overTitle: function () {
    var text = this.props.overTitle()
      , c = utils.arcCenter({x: 0, y: 0}, this.props.gen, this.props.pos, this.props.options)
    return d.text({
      className: 'fan__over-title',
      style: {
        fontSize: this.props.options.width/3,
      },
      x: c.pos.x,
      y: c.pos.y,
      transform: 'rotate(' + (180 * c.angle / Math.PI) + ')'
    }, text)
  },
  render: function () {
    var data = this.state.data
      , classes = this.props.getClasses(data) || {}
      , parents = []
    if (this.props.attr && data[this.props.attr]) {
      data = data[this.props.attr]
    }
    if (data.father && this.props.gens > this.props.gen + 1) {
      parents.push(Node({
        key: data.father,
        id: data.father,
        ref: 'father',
        className: 'father',
        attr: this.props.attr,
        getClasses: this.props.getClasses,
        onClick: this.props.onClick,
        overTitle: this.props.overTitle,
        tip: this.props.tip,
        manager: this.props.manager,
        gens: this.props.gens,
        gen: this.props.gen + 1,
        pos: this.props.pos * 2,
        options: this.props.options
      }))
    }
    if (data.mother && this.props.gens > this.props.gen + 1) {
      parents.push(Node({
        key: data.mother,
        id: data.mother,
        ref: 'mother',
        className: 'mother',
        attr: this.props.attr,
        manager: this.props.manager,
        getClasses: this.props.getClasses,
        onClick: this.props.onClick,
        tip: this.props.tip,
        gens: this.props.gens,
        gen: this.props.gen + 1,
        pos: this.props.pos * 2 + 1,
        options: this.props.options
      }))
    }
    var cls = 'node ' + classes.path
    return d.g({
        fill: 'none',
        stroke: 'none',
        transform: this.props.transform,
        className: this.props.className + ' ' + (classes.g || '')
      }, [
      d.path({
        className: cls,
        onMouseEnter: this.props.tip && this.showTip,
        onMouseMove: this.props.tip && this.showTip,
        onMouseLeave: this.props.tip && this.hideTip,
        onClick: this.onClick,
        ref: 'path',
        d: utils.pathToString(utils.nodePath({x: 0, y: 0}, this.props.gen, this.props.pos, this.props.options))
      }),
      this.overTitle(),
      this.props.gen === 0 && this.mainTitle(),
      parents
    ])
  },
})

