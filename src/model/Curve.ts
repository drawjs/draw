import Particle from "./Particle"
import Handle from "./Handle"
import Segment from "./Segment"
import bezierCurve from "../util/geometry/bezierCurve"
import MathPoint from "../util/math/MathPoint"
import MathVector from "../util/math/MathVector"
import Path from "./Path"
import getBizerCurveBounds from "../util/geometry/checkBezierCurveBounds"
import rotate from "../util/geometry/rotate"
import origin from "../util/geometry/origin"
import { notNil } from "../util/lodash/index"
import Cell from "./Cell"

const { PI } = Math

export default class Curve extends Cell {
	segment1: Segment

	segment2: Segment

	handle1: Handle

	handle2: Handle

	path: Path

	useCanvasCurve: boolean

	/**
	 * Beizer variable, which determines curve's smooth degree
	 */
	t

	setLineDash: number[]
	lineWidth: number = 1

	constructor( props ) {
		super( props )

		const self = this

		const { points = [] } = props

		if ( points.length > 0 ) {
			this.segment1 = this.sharedGetters.createSegmentByPoint(
				points[ 0 ],
				this.draw,
				{ showHandle: false }
			)
			this.segment2 = this.sharedGetters.createSegmentByPoint(
				points[ 1 ],
				this.draw,
				{ showHandle: false }
			)
		} else {
			this.segment1 = props.segment1
			this.segment2 = props.segment2
		}

		this.handle1 = this.segment1.handleOut
		this.handle2 = this.segment2.handleIn

		this.path = props.path

		if ( notNil( props.setLineDash ) ) {
			this.setLineDash = props.setLineDash
		}

		const { curveUsesCanvasApi, curveRate } = this.drawStore.setting
		this.useCanvasCurve = notNil( curveUsesCanvasApi ) ?
			curveUsesCanvasApi :
			false
		this.useCanvasCurve = notNil( props.useCanvasCurve ) ?
			props.useCanvasCurve :
			this.useCanvasCurve

		this.t = notNil( curveRate ) && curveRate !== 0 ? curveRate : 1
		this.t = notNil( props.t ) && props.t !== 0 ? props.t : this.t
	}

	get point1(): Point2D {
		return this.segment1.point
	}

	get point2(): Point2D {
		return this.segment2.point
	}

	get handle1Point(): Point2D {
		return this.handle1.point
	}

	get handle2Point(): Point2D {
		return this.handle2.point
	}

	get prevSegment(): Segment {
		return this.segment1.previous
	}

	get nextSegment(): Segment {
		return this.segment2.next
	}

	get prevPoint(): Point2D {
		return this.prevSegment.point
	}

	get nextPoint(): Point2D {
		return this.nextSegment.point
	}

	get path2d(): Path2D {
		let path2d = new Path2D()

		const {
			handle1Point,
			handle2Point,
			point1,
			point2,
			useCanvasCurve,
			t
		} = this

		!useCanvasCurve &&
			bezierCurve( [ point1, handle1Point, handle2Point, point2 ], t, path2d )

		if ( useCanvasCurve ) {
			path2d.moveTo( point1.x, point1.y )
			path2d.bezierCurveTo(
				handle1Point.x,
				handle1Point.y,
				handle2Point.x,
				handle2Point.y,
				point2.x,
				point2.y
			)
		}

		return path2d
	}

	/**
	 * Real-time and absolute bounds(with no rotation)
	 */
	get bounds(): Bounds {
		const { handle1Point, handle2Point, point1, point2 } = this
		const res: Bounds = getBizerCurveBounds(
			point1,
			handle1Point,
			handle2Point,
			point2
		)
		return res
	}

	get boundsCenter(): Point2D {
		const res: Point2D = this.sharedGetters.getBoundsCenter( this.bounds )
		return res
	}

	contain() {
		return false
	}

	render() {
		const { ctx } = this.getters
		const { setLineDash, lineWidth, strokeColor } = this

		if ( strokeColor ) {
			ctx.save()
			ctx.lineWidth = lineWidth
			ctx.strokeStyle = "#00f0ff"
			if ( notNil( setLineDash ) ) {
				ctx.setLineDash( setLineDash )
			}
			ctx.stroke( this.path2d )
			ctx.restore()
		}
	}
}
