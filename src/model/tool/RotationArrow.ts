import Cell from "model/Cell"
import RectContainer from "./RectContainer"
import getRectVertices from "util/geometry/getRectVertices"
import rotatePoints from "util/geometry/rotatePoints"
import connectPolygonPoints from "util/canvas/connectPolygonPoints"
import coupleShouldRotateCell from "../../mixin/coupleShouldRotateCell"
import coupleSelectCell from "../../mixin/coupleSelectCell"
import { getPointAngleToOrigin } from "../../util/index"
import {
	RADIAN_TO_DEGREE,
	ROTATION_ARROW_SRC
} from "../../store/constant/index"
import rotate from "../../util/geometry/rotate"
import getters from "../../store/draw/getters"
import { ROTATE_ARROW } from "../../store/constant/cellType"
import { deselectCell, selectCell, enableCellRotate, disableCellRotate } from "../../mixin/coupleCell";

export default class RotationArrow extends Cell {
	type: string = ROTATE_ARROW

	/**
	 * Graph target to rotate
	 */
	target: any

	img: HTMLImageElement = new Image()

	/**
	 * Graph target's radian
	 */
	get radian(): number {
		return this.target.radianAngle
	}

	get rectContainer(): RectContainer {
		return this.target.rectContainer
	}

	get basicCenter(): Point2D {
		const { SPACE } = RotationArrow
		const { basicCenter: basicCenter_r, basicTop } = this.rectContainer
		const basicCenter: Point2D = {
			x: basicCenter_r.x,
			y: basicTop - SPACE
		}

		return basicCenter
	}

	get rotatedCenter(): Point2D {
		const { basicCenter: basicCenter_r } = this.rectContainer
		const res: Point2D = rotate(
			this.basicCenter,
			this.radian,
			basicCenter_r
		)
		return res
	}

	get shouldRender(): boolean {
		const { shouldSelect } = this.target
		const { shouldRotate } = this.target
		const res: boolean = shouldSelect || shouldRotate
		return res
	}

	getDeltaRadianFromPrevDraggingPointToCur( point : Point2D): number {
		const { x, y }: Point2D = point

		const { x: prevX, y: prevY } = this.dragger.prevPoint

		/**
		 * Center x, y of rect container
		 */
		const {
			x: centerX_r,
			y: centerY_r
		}: Point2D = this.rectContainer.basicCenter

		const deltaRadian: number =
			getPointAngleToOrigin( { x: x - centerX_r, y: y - centerY_r } ) -
			getPointAngleToOrigin( {
				x: prevX - centerX_r,
				y: prevY - centerY_r
			} )

		return deltaRadian
	}

	/**
	 * Space between icon and graph the topo of target's rect container
	 */
	static SPACE: number = 20

	static SIZE: number = 20

	get path(): Path2D {
		const { SIZE } = RotationArrow
		const { basicCenter: basicCenter_r } = this.rectContainer

		const basicRectPoints: Point2D[] = getRectVertices(
			this.basicCenter,
			SIZE,
			SIZE
		)

		const rotatedRectPoints: Point2D[] = rotatePoints(
			basicRectPoints,
			this.radian,
			basicCenter_r
		)

		const path: Path2D = connectPolygonPoints( rotatedRectPoints )

		return path
	}

	constructor( props ) {
		super( props )

		const self = this

		this.target = props.target

		this.img.src = ROTATION_ARROW_SRC
		this.img.onload = function() {
			self.render()
		}
	}

	render() {
		if ( this.shouldRender ) {
			const ctx: CanvasRenderingContext2D = getters.ctx
			const { SIZE } = RotationArrow
			ctx.save()
			ctx.transform(
				1,
				0,
				0,
				1,
				this.rotatedCenter.x,
				this.rotatedCenter.y
			)
			ctx.drawImage( this.img, -SIZE / 2, -SIZE / 2, SIZE, SIZE )
			ctx.restore()
		}
	}

	contain( x: number, y: number ) {
		const res: boolean = getters.ctx.isPointInPath( this.path, x, y )
		return res
	}

	// ******* Drag ******
	public handleStartDrag( event ) {
		deselectCell( this.target )
		enableCellRotate( this.target )

		this.draw.render()
	}
	public updateDrag( event ) {
		const point: Point2D = getters.getPoint( event )
		const deltaRadian: number = this.getDeltaRadianFromPrevDraggingPointToCur( point )
		const radian = this.radian + deltaRadian

		this.target.angle = radian * RADIAN_TO_DEGREE

		this.draw.render()
	}
	public handleStopDrag( event ) {
		const { shouldRotate } = this.target

		disableCellRotate( this.target )
		selectCell( this.target )

		this.draw.render()
	}
	// ******* Drag ******
}