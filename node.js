
var d = React.DOM
  , utils = require('./utils')

var Node = module.exports = React.createClass({
  displayName: 'FanNode',
  getDefaultProps: function () {
    return {
      id: null,
      manager: null,
      transform: undefined,
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
    if (!this.props.manager) return
    this.props.manager.on(this.props.id, this.gotData)
  },
  componentWillUnMount: function () {
    if (!this.props.manager) return
    this.props.manager.off(this.props.id, this.gotData)
  },
  gotData: function (data) {
    this.setState({data: this.props.attr ? (data[this.props.attr] || {}) : data})
  },
  render: function () {
    var data = this.state.data
      , parents = []
    if (data.father) {
      parents.push(Node({
        key: data.father,
        id: data.father,
        ref: 'father',
        className: 'father',
        attr: this.props.attr,
        manager: this.props.manager,
        gen: this.props.gen + 1,
        pos: this.props.pos * 2
      }))
    }
    if (data.mother) {
      parents.push(Node({
        key: data.mother,
        id: data.mother,
        ref: 'mother',
        className: 'mother',
        attr: this.props.attr,
        manager: this.props.manager,
        gen: this.props.gen + 1,
        pos: this.props.pos * 2 + 1
      }))
    }
    return d.g({
        fill: 'none',
        stroke: 'none',
        transform: this.props.transform,
        className: this.props.className
      }, [
      d.path({
        className: 'node',
        d: utils.pathToString(utils.nodePath({x: 0, y: 0}, this.props.gen, this.props.pos, this.props.options))
      }),
      parents
    ])
  },
})

