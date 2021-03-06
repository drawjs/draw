import Path from "../Path"
import { RECT } from "../../store/constant/cellType"
import { isNotNil } from "../../util/index"
import getRectPoints from "../../util/getRectPoints"
import { notUndefined, notNil } from "../../util/lodash/index"
import { EXPORTABLE } from "../../store/constant/name"

export default class Rect extends Path {
	type = RECT

	left: number = Rect.DEFAULT_LEFT
	top: number = Rect.DEFAULT_TOP
	width: number = Rect.DEFAULT_WIDTH
	height: number = Rect.DEFAULT_HEIGHT

	static DEFAULT_LEFT = 0
	static DEFAULT_TOP = 0
	static DEFAULT_WIDTH = 100
	static DEFAULT_HEIGHT = 100

	/**
	 * Override
	 */
	t = 1

	constructor( props ) {
		super( setPropsPointsDangerously( props ) )

		const { x, y, left, top } = props

		this.width = notNil( props.width ) ? props.width : this.width
		this.height = notNil( props.height ) ? props.height : this.height

		const { width, height } = this

		if ( notNil( x ) && notNil( y ) ) {
			this.left = x - width / 2
			this.top = y - height / 2
		} else {
			this.left = notNil( left ) ? left : this.left
			this.top = notNil( top ) ? top : this.top
		}


		this.sizable = notNil( props.sizable ) ? props.sizable : this.sizable
		this.rotatable = notNil( props.rotatable ) ?
			props.rotatable :
			this.rotatable

		this.sharedActions.clearSegmentsHandles( this.segments )
		this.sharedActions.hideSegmentsHandles( this.segments )
		this.sharedActions.hideSegments( this.segments )

		function setPropsPointsDangerously( props ) {
			let { x, y, left, top, width, height } = props

			width = notUndefined( width ) ? width : Rect.DEFAULT_WIDTH
			height = notUndefined( height ) ? height : Rect.DEFAULT_HEIGHT

			if ( notNil( x ) && notNil( y ) ) {
				left = x - width / 2
				top = y - height / 2
			} else {
				left = notUndefined( left ) ? left : Rect.DEFAULT_LEFT
				top = notUndefined( top ) ? top : Rect.DEFAULT_TOP
			}

			const rectPoints = getRectPoints( { left, top, width, height } )
			const { leftTop, rightTop, rightBottom, leftBottom } = rectPoints
			const points: Point2D[] = [
				leftTop,
				rightTop,
				rightBottom,
				leftBottom
			]

			props.points = points

			return props
		}
	}

	updateWidth( width ) {
		this.width = width
	}

	updateHeight( height ) {
		this.height = height
	}

	translate( dx: number, dy: number ) {
		this.left = this.left + dx
		this.top = this.top + dy
		super.translate( dx, dy )
	}
}
