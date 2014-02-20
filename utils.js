
module.exports = {
  nodePath: nodePath,
  arcCenter: arcCenter,
  pathToString: pathToString,
  radialLine: radialLine,
  childTop: childTop,
  textPath: textPath,
  textBack: textBack
}

// take a list of path commmands and return a string
function pathToString(items) {
  return items.map(function (item) {
    if (item[0].toLowerCase() == 'a') {
      return (item[0] +
              item[1] + ',' + item[2] + ' ' + // radii
              item[3] + ' ' +
              item[4] + ',' + item[5] + ' ' + // large arc, sweep
              item[6] + ',' + item[7]);       // final pos
    }
    return item[0] + item[1] + ',' + item[2];
  }).join('');
}

// return the position reached by going length in angle direction from pos
function pointAngle(pos, angle, length) {
  return {
    x: pos.x + Math.cos(angle) * length,
    y: pos.y + Math.sin(angle) * length
  };
}

// two points, for going to lengths w/ the same direction and starting pos
function pointsAngle(pos, angle, len1, len2) {
  return [pointAngle(pos, angle, len1),
          pointAngle(pos, angle, len2)];
}

function genWidth(width, gen, doubleWidth, extend) {
  var res;
  if (!doubleWidth || gen <= 4) res = width * gen
  else res = width * gen + width * (gen - 4)
  if (extend && !isNaN(extend) && 'number' === typeof extend) {
    res += extend * width * (doubleWidth && gen > 4 ? 2 : 1);
  }
  return res;
}

// find the appropriate center for the arc
function arcCenter(center, gen, pos, options) {
  var start = - options.sweep/2 - Math.PI/2 + options.offset
    , segs = options.sweep / (Math.pow(2, gen))
    , innerRadius = genWidth(options.width, gen, options.doubleWidth)
    , outerRadius = genWidth(options.width, gen + 1, options.doubleWidth)
    , middleRadius = (outerRadius + innerRadius) / 2
    , angle = start + (pos + 0.5) * segs
    , point = pointAngle(center, start + (pos + 0.5) * segs, middleRadius);
  if (pos < Math.pow(2, gen) / 2) {
    angle += Math.PI;
    if (gen < 4) {
      angle -= Math.PI / 2;
    }
  } else if (gen < 4) {
    angle += Math.PI / 2;
  }
    
  if (gen === 0) point = center;
  return {
    pos: point,
    angle: angle
  };
}

// 
// options:
//  - sweep: total length
//  - offset: 0 - fan points up
//  - width: the width of each ring
//  - doubleWidth: whether rings after the 3rd generation should be doubly
//    thick (nice if you want names to fit on them)
//
function nodePath(center, gen, pos, options) {
  var start = - options.sweep/2 - Math.PI/2 + options.offset
    , segs = options.sweep / (Math.pow(2, gen))
    , innerRadius = genWidth(options.width, gen, options.doubleWidth, options.start)
    , outerRadius = genWidth(options.width, gen + 1, options.doubleWidth, -(1 - options.extend - options.start))
    , left = pointsAngle(center, start + pos * segs, innerRadius, outerRadius)
    , right = pointsAngle(center, start + (pos + 1) * segs, innerRadius, outerRadius);
  if (options.centerCircle && gen === 0) { // circle me
    return [
      ['M', center.x, center.y],
      ['m', -outerRadius, 0],
      ['a', outerRadius, outerRadius, 0, 1, 0, outerRadius * 2, 0],
      ['a', outerRadius, outerRadius, 0, 1, 0, - outerRadius * 2, 0]
    ];
  }
  return [
    ['M', left[0].x, left[0].y],
    ['L', left[1].x, left[1].y],
    ['A', outerRadius, outerRadius, 0, gen === 0 ? 1 : 0, 1, right[1].x, right[1].y],
    ['L', right[0].x, right[0].y],
    ['A', innerRadius, innerRadius, 0, 0, 0, left[0].x, left[0].y]
  ];
}

function midPoint(points) {
  var p1 = points[0]
    , p2 = points[1]
  return {
    x: (p2.x + p1.x)/2,
    y: (p2.y + p1.y)/2
  }
}

function shrink(poss, by) {
  var xs = shrink1(poss[0].x, poss[1].x, by)
    , ys = shrink1(poss[0].y, poss[1].y, by)
  return [{
    x: xs[0],
    y: ys[0]
  }, {
    x: xs[1],
    y: ys[1]
  }]
}

function shrink1(a, b, by) {
  var m = (1 - by) / 2
    , diff = b - a
  return [
    b - diff * m,
    a + diff * m
  ]
}

function textBack(center, gen, pos, options) {
  var start = - options.sweep/2 - Math.PI/2 + options.offset
    , segs = options.sweep / (Math.pow(2, gen))
    , innerRadius = genWidth(options.width, gen, options.doubleWidth, options.start)
    , outerRadius = genWidth(options.width, gen + 1, options.doubleWidth, -(1 - options.extend - options.start))
    , left = pointsAngle(center, start + pos * segs, innerRadius, outerRadius)
    , right = pointsAngle(center, start + (pos + 1) * segs, innerRadius, outerRadius)
    , sleft = shrink(left, 0.6)
    , sright = shrink(right, 0.6)
    , srad = shrink1(innerRadius, outerRadius, 0.6)
  innerRadius = srad[0]
  outerRadius = srad[1]
  left = sleft
  right = sright

  if (options.centerCircle && gen === 0) { // circle me
    return [
      ['M', center.x, center.y],
      ['m', -outerRadius, 0],
      ['a', outerRadius, outerRadius, 0, 1, 0, outerRadius * 2, 0],
      ['a', outerRadius, outerRadius, 0, 1, 0, - outerRadius * 2, 0]
    ];
  }
  return [
    ['M', left[0].x, left[0].y],
    ['L', left[1].x, left[1].y],
    ['A', outerRadius, outerRadius, 0, gen === 0 ? 1 : 0, 1, right[1].x, right[1].y],
    ['L', right[0].x, right[0].y],
    ['A', innerRadius, innerRadius, 0, 0, 0, left[0].x, left[0].y]
  ];
}

function textPath(center, gen, pos, options) {
  var start = - options.sweep/2 - Math.PI/2 + options.offset
    , segs = options.sweep / (Math.pow(2, gen))
    , innerRadius = genWidth(options.width, gen, options.doubleWidth, options.start)
    , outerRadius = genWidth(options.width, gen + 1, options.doubleWidth, -(1 - options.extend - options.start))
    , middleRadius = (outerRadius + innerRadius) / 2
    , left = pointsAngle(center, start + pos * segs, innerRadius, outerRadius)
    , right = pointsAngle(center, start + (pos + 1) * segs, innerRadius, outerRadius)
    , mleft = midPoint(left)
    , mright = midPoint(right)
  return [
    ['M', mleft.x, mleft.y],
    ['A', middleRadius, middleRadius, 0, 0, 1, mright.x, mright.y],
  ]
}

function radialLine(center, gen1, gen2, num, options) {
  var start = - options.sweep/2 - Math.PI/2 + options.offset
    , begin = genWidth(options.width, gen1, options.doubleWidth)
    , end = genWidth(options.width, gen2, options.doubleWidth)
    , segs = options.sweep / Math.pow(2, gen1)
    , line = pointsAngle(center, start + segs * num, begin, end);
  return [
    ['M', line[0].x, line[0].y],
    ['L', line[1].x, line[1].y]
  ];
}

function childTop(ccounts, i, width, horiz) {
  var top = 0;
  for (var j = 0; j < ccounts.length; j++) {
    top += width * Math.ceil(ccounts[j] / horiz);
    top += width / 4;
  }
  return Math.floor(i / horiz) * width + top + width * 3 / 2;
}

