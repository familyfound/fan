
var d = React.DOM
  , utils = require('./utils')
  , Tip = require('tip')

var setSvgContents = function (node, text) {
  var d = document.createElement('div')
  d.innerHTML = "<svg id='wrapper' xmlns='http://www.w3.org/2000/svg'>" + text + "</svg>"
  ;[].slice.call(node.childNodes).forEach(function (n) {
    node.removeChild(n)
  })
  ;[].slice.call(d.firstChild.childNodes).forEach(function (n) {
    node.appendChild(n)
  })
}

var SVGText = React.createClass({
  componentDidMount: function () {
    this.getDOMNode().textContent = this.props.textContent
  },
  componentDidUpdate: function () {
    this.getDOMNode().textContent = this.props.textContent
  },
  render: function () {
    return this.transferPropsTo(d.text(null))
  }
})

var TextPath = React.createClass({
  componentDidMount: function () {
    var text = '<textPath class="fan__over-title__text" xlink:href="' + this.props.pathHref + '" startOffset="' + this.props.startOffset + '">' + this.props.textContent + '</textPath>'
    var node = this.getDOMNode()
    setSvgContents(node, text)
  },
  componentDidUpdate: function () {
    var text = '<textPath class="fan__over-title__text" xlink:href="' + this.props.pathHref + '" startOffset="' + this.props.startOffset + '">' + this.props.textContent + '</textPath>'
    var node = this.getDOMNode()
    setSvgContents(node, text)
  },
  render: function () {
    return this.transferPropsTo(d.text(null))
  }
})

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
        width: 40,
        doubleWidth: false
      }
    }
  },
  getInitialState: function () {
    return {
      data: {},
    }
  },
  shouldComponentUpdate: function (props, state) {
    return this.props.id !== props.id || this.state.data !== state.data
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
      , title = this.props.mainTitle(this.state.data, x, y)
    if (!title) return
    if ('string' !== typeof title) {
      return title
    }
    return SVGText({
      className: 'fan__main-title',
      style: {
        fontSize: this.props.options.width/2
      },
      x: x,
      y: y,
      textContent: title
    })
  },
  textPath: function () {
    var path = utils.textPath({x: 0, y: 0}, this.props.gen, this.props.pos, this.props.options)
      , txt = utils.pathToString(path)
    return d.path({
      className: 'fan__text-path',
      id: 'fan-' + this.props.gen + '-' + this.props.pos,
      style: {display: 'none'},
      d: txt
    })
  },
  textBack: function () {
    var path = utils.textBack({x: 0, y: 0}, this.props.gen, this.props.pos, this.props.options)
      , txt = utils.pathToString(path)
    return d.path({
      className: 'fan__text-back',
      d: txt
    })
  },
  textText: function () {
    var text = this.props.overTitle(this.state.data)
      , scale = [0, 1.1, 1.3, 2]
    if (!text) return
    return TextPath({
      className: 'fan__over-title',
      style: {
        fontSize: this.props.options.width/3/scale[this.props.gen],
      },
      pathHref: '#fan-' + this.props.gen + '-' + this.props.pos,
      startOffset: '50%',
      textContent: text
    })
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
        overTitle: this.props.overTitle,
        onClick: this.props.onClick,
        tip: this.props.tip,
        gens: this.props.gens,
        gen: this.props.gen + 1,
        pos: this.props.pos * 2 + 1,
        options: this.props.options
      }))
    }
    var cls = 'node ' + classes.path
      , showText = this.props.gen > 0 && this.props.gen < 4
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
      showText && this.textPath(),
      showText && this.textBack(),
      showText && this.textText(),
      this.props.gen === 0 && this.mainTitle(),
      parents
    ])
  },
})

