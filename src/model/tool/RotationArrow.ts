import Cell from "../../model/Cell"
import SizeContainer from "./SizeContainer"
import getRectVertices from "../../util/geometry/getRectVertices"
import rotatePoints from "../../util/geometry/rotatePoints"
import connectPolygonPoints from "../../util/canvas/connectPolygonPoints"
import { getPointAngleToOrigin } from "../../util/index"
import {
	RADIAN_TO_DEGREE,
	ROTATION_ARROW_SPACE,
	ROTATION_ARROW_SIZE
} from "../../store/constant/index"
import rotate from "../../util/geometry/rotate"
import { ROTATION_ARROW } from "../../store/constant/cellType"
import Item from "../Item"
import { ROTATION_ARROW_ICON } from "../../store/constant/imageUrl";

export default class RotationArrow extends Cell {
	type: string = ROTATION_ARROW

	/**
	 * Item to rotate
	 */
	target: Item

	image: HTMLImageElement = new Image()

	/**
	 * Space between icon and graph the topo of target's rect container
	 */
	static SPACE: number = ROTATION_ARROW_SPACE

	static SIZE: number = ROTATION_ARROW_SIZE

	get targetRotatable(): boolean {
		return this.target.sizable
	}

	/**
	 * Graph target's radian
	 */
	get radian(): number {
		return this.target.radian
	}

	get itemCenter(): Point2D {
		return this.target.itemCenter
	}

	get basicArrowCenter(): Point2D {
		const { SPACE } = RotationArrow

		const { x }: Point2D = this.itemCenter

		const { top } = this.target.itemInitialBounds
		const basicArrowCenter: Point2D = {
			x: x,
			y: top - SPACE
		}

		return basicArrowCenter
	}

	get rotatedArrowCenter(): Point2D {
		const { itemCenter } = this

		const rotatedArrowCenter: Point2D = rotate(
			this.basicArrowCenter,
			this.radian,
			itemCenter
		)
		return rotatedArrowCenter
	}

	get shouldRender(): boolean {
		const { shouldSelect, shouldRotate } = this.target
		const res: boolean = shouldSelect || shouldRotate
		return res
	}

	get path(): Path2D {
		const { SIZE } = RotationArrow
		const { itemCenter } = this

		const basicRectPoints: Point2D[] = getRectVertices(
			this.basicArrowCenter,
			SIZE,
			SIZE
		)

		const rotatedRectPoints: Point2D[] = rotatePoints(
			basicRectPoints,
			this.radian,
			itemCenter
		)

		const path: Path2D = connectPolygonPoints( rotatedRectPoints )

		return path
	}

	constructor( props ) {
		super( props )

		const self = this

		this.target = props.target

		this.image.src = ROTATION_ARROW_ICON
		this.image.onload = function() {
			self.shouldRender && self.render()
		}
	}

	render() {
		if ( this.targetRotatable && this.shouldRender ) {
			const { ctx } = this.getters
			const { SIZE } = RotationArrow
			ctx.save()
			ctx.transform(
				1,
				0,
				0,
				1,
				this.rotatedArrowCenter.x,
				this.rotatedArrowCenter.y
			)
			ctx.drawImage( this.image, -SIZE / 2, -SIZE / 2, SIZE, SIZE )
			ctx.restore()
			this.getters.renderer.setTransformViewPort()
		}
	}

	contain( x: number, y: number ) {
		const isContain =
			this.targetRotatable &&
			this.getters.pointOnPath( { x, y }, this.path )
		return isContain
	}

	// // ******* Drag ******
	public handleStartDrag( event ) {
		this.sharedActions.deselectCell( this.target )
		this.sharedActions.enableCellRotate( this.target )
	}
	public updateDrag( event ) {
		const self = this

		if ( this.draggable ) {
			const point: Point2DInitial = this.getters.getInitialPoint( event )
			const deltaRadian: number = getDeltaRadian( point )
			const radian = this.radian + deltaRadian

			this.sharedActions.rotateCell(
				this.target,
				radian * RADIAN_TO_DEGREE
			)
		}

		/**
		 * Get delta radian from prev dragging point to current point
		 * @param point
		 */
		function getDeltaRadian( point: Point2D ): number {
			const { x, y }: Point2D = point

			const { x: prevX, y: prevY } = self.dragger.prevPoint

			const { x: cx, y: cy }: Point2D = self.itemCenter

			const curRadian: number = getPointAngleToOrigin( {
				x: x - cx,
				y: y - cy
			} )
			const prevRadin: number = getPointAngleToOrigin( {
				x: prevX - cx,
				y: prevY - cy
			} )
			const deltaRadian: number = curRadian - prevRadin

			return deltaRadian
		}
	}
	public handleStopDrag( event ) {
		const { shouldRotate } = this.target

		this.sharedActions.disableCellRotate( this.target )
		this.sharedActions.selectCell( this.target )
	}

	// // ******* Drag ******
}
