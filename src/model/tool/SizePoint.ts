import { SIZE_POINT } from "../../store/constant_cellTypeList";
import Cell from "../Cell";
import Point from "model/shape/Point";
import * as _ from "lodash";
import { getRotatedPoint } from 'util/index'
import * as i from "interface/index"
import Size from 'mixin/size'


export default class SizePoint extends Point {
	public instance: any
	public Size: Size

	get instanceWidth(): number {
		return this.instance.width
	}

	get instanceHeight(): number {
		return this.instance.height
	}

	get instanceDiagonal(): number {
		return Math.sqrt(
			Math.pow(this.instanceWidth, 2) +
			Math.pow(this.instanceHeight, 2)
		)
	}

	get instanceCenterX(): number {
		return this.instance.left + this.instance.width / 2
	}

	get instanceCenterY(): number {
		return this.instance.top + this.instance.height / 2
	}
	get instanceLeftCenterPoint(): i.Point {
		return {
			x: - this.instanceWidth / 2,
			y: 0
		}
	}
	get instanceRightCenterPoint(): i.Point {
		return {
			x: this.instanceWidth / 2,
			y: 0
		}
	}
	get instanceTopCenterPoint(): i.Point {
		return {
			x: 0,
			y: - this.instanceHeight / 2
		}
	}
	get instanceBottomCenterPoint(): i.Point {
		return {
			x: 0,
			y: this.instanceHeight / 2
		}
	}
	get instanceLeftTopPoint(): i.Point {
		return {
			x: - this.instanceWidth / 2,
			y: - this.instanceHeight / 2
		}
	}
	get instanceRightTopPoint(): i.Point {
		return {
			x: this.instanceWidth / 2,
			y: - this.instanceHeight / 2
		}
	}
	get instanceLeftBottomPoint(): i.Point {
		return {
			x: - this.instanceWidth / 2,
			y: this.instanceHeight / 2
		}
	}
	get instanceRightBottomPoint(): i.Point {
		return {
			x: this.instanceWidth / 2,
			y: this.instanceHeight / 2
		}
	}

	constructor(props) {
		super(props)

		this.type = SIZE_POINT
		this.color = 'blue'

		this.instance = props.instance

		this.Size = new Size({ instance: this.instance })
	}

	public render() {
		const ctx = this.draw.ctx

		ctx.save()
		ctx.translate(this.x + this.instanceCenterX, this.y + this.instanceCenterY)
		ctx.fillStyle = this.color
		ctx.strokeStyle = this.strokeColor

		ctx.fill(this.path)
		!_.isNil(this.strokeColor) && ctx.stroke(this.path)

		ctx.restore()
	}

	public containPoint(x, y) {
		let res = false
		const transformedPoint = this.getTransformedPointForContainPoint({ x, y })
		res = this.draw.ctx.isPointInPath(this.path, transformedPoint.x, transformedPoint.y)

		return res
	}

	public getTransformedPointForContainPoint(point: i.Point) {
		let res: i.Point = {
			x: point.x - this.x - this.instanceCenterX,
			y: point.y - this.y - this.instanceCenterY
		}

		res = getRotatedPoint(res, -this.instance.angle)

		return res
	}

	public getTransformedPointForSize(point: i.Point, centerPoint?: i.Point) {
		let res: i.Point = {
			x: point.x - this.instanceCenterX,
			y: point.y - this.instanceCenterY
		}

		res = getRotatedPoint(res, -this.instance.angle, centerPoint)

		return res
	}

	public setRotatedPoint(point: i.Point) {
		const rotatedPoint = getRotatedPoint(point, this.instance.angle)

		this.x = rotatedPoint.x
		this.y = rotatedPoint.y
	}
}


export class SizePointLeft extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: - this.instanceWidth / 2,
			y: 0,
		})
		this.render()
	}

	public _updateDrag(event) {

		this.Size.sizeLeftSide({
			x: event.x,
			y: event.y,
		})

		this._updatePrevDraggingPoint(event)
		this.draw.render()

		return

		let newPoint: i.Point
		let transformedNewPoint: i.Point
		let newCenterPoint: i.Point
		let deltaWidth: number
		let deltaX: number
		let deltaY: number

		newPoint = {
			x: event.x - this.draw.canvasLeft,
			y: event.y - this.draw.canvasTop
		}

		transformedNewPoint = this.getTransformedPointForSize(newPoint)

		deltaWidth = transformedNewPoint.x - this.instanceLeftCenterPoint.x
		deltaY = deltaWidth / 2 * Math.sin(this.instance.radianAngle)
		deltaX = deltaWidth * (1 + Math.cos(this.instance.radianAngle)) / 2

		this.instance.width = this.instance.width - deltaWidth
		this.instance.left = this.instance.left + deltaX
		this.instance.top = this.instance.top + deltaY

		this._updatePrevDraggingPoint(event)
		this.draw.render()
	}
}

export class SizePointRight extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: this.instanceWidth / 2,
			y: 0,
		})
		this.render()
	}

	public _updateDrag(event) {
		let newPoint: i.Point
		let transformedNewPoint: i.Point
		let newCenterPoint: i.Point
		let deltaWidth: number
		let deltaX: number
		let deltaY: number

		newPoint = {
			x: event.x - this.draw.canvasLeft,
			y: event.y - this.draw.canvasTop
		}

		transformedNewPoint = this.getTransformedPointForSize(newPoint)

		deltaWidth = - (transformedNewPoint.x - this.instanceRightTopPoint.x)
		deltaY = - deltaWidth / 2 * Math.sin(this.instance.radianAngle)
		deltaX = deltaWidth * (1 - Math.cos(this.instance.radianAngle)) / 2

		this.instance.width = this.instance.width - deltaWidth
		this.instance.left = this.instance.left + deltaX
		this.instance.top = this.instance.top + deltaY

		this._updatePrevDraggingPoint(event)
		this.draw.render()
	}
}

export class SizePointTop extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: 0,
			y: - this.instanceHeight / 2,
		})
		this.render()
	}

	public _updateDrag(event) {
		let newPoint: i.Point
		let transformedNewPoint: i.Point
		let newCenterPoint: i.Point
		let deltaHeight: number
		let deltaX: number
		let deltaY: number

		newPoint = {
			x: event.x - this.draw.canvasLeft,
			y: event.y - this.draw.canvasTop
		}

		transformedNewPoint = this.getTransformedPointForSize(newPoint)

		deltaHeight = transformedNewPoint.y - this.instanceTopCenterPoint.y
		deltaX = deltaHeight / 2 * Math.sin(this.instance.radianAngle)
		deltaY = deltaHeight * (1 + Math.cos(this.instance.radianAngle)) / 2

		this.instance.height = this.instance.height - deltaHeight
		this.instance.top = this.instance.top + deltaY
		this.instance.left = this.instance.left - deltaX

		this._updatePrevDraggingPoint(event)
		this.draw.render()
	}
}

export class SizePointBottom extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: 0,
			y: this.instanceHeight / 2,
		})
		this.render()
	}

	public _updateDrag(event) {
		let newPoint: i.Point
		let transformedNewPoint: i.Point
		let newCenterPoint: i.Point
		let deltaHeight: number
		let deltaX: number
		let deltaY: number

		newPoint = {
			x: event.x - this.draw.canvasLeft,
			y: event.y - this.draw.canvasTop
		}

		transformedNewPoint = this.getTransformedPointForSize(newPoint)

		deltaHeight = - (transformedNewPoint.y - this.instanceBottomCenterPoint.y)
		deltaX = - (deltaHeight / 2 * Math.sin(this.instance.radianAngle))
		deltaY = deltaHeight * (1 - Math.cos(this.instance.radianAngle)) / 2

		this.instance.height = this.instance.height - deltaHeight
		this.instance.top = this.instance.top + deltaY
		this.instance.left = this.instance.left - deltaX

		this._updatePrevDraggingPoint(event)
		this.draw.render()
	}
}

export class SizePointTopLeft extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: - this.instanceWidth / 2,
			y: - this.instanceHeight / 2
		})

		this.render()
	}

	public _updateDrag(event) {
		let newPoint: i.Point
		let transformedNewPoint: i.Point
		let newCenterPoint: i.Point
		let deltaWidth: number
		let deltaHeight: number
		let deltaX: number
		let deltaY: number

		newPoint = {
			x: event.x - this.draw.canvasLeft,
			y: event.y - this.draw.canvasTop
		}

		transformedNewPoint = this.getTransformedPointForSize(newPoint)

		deltaWidth = transformedNewPoint.x - this.instanceLeftCenterPoint.x
		deltaY = deltaWidth / 2 * Math.sin(this.instance.radianAngle)
		deltaX = deltaWidth * (1 + Math.cos(this.instance.radianAngle)) / 2

		this.instance.width = this.instance.width - deltaWidth
		this.instance.left = this.instance.left + deltaX
		this.instance.top = this.instance.top + deltaY


		newPoint = {
			x: event.x - this.draw.canvasLeft,
			y: event.y - this.draw.canvasTop
		}

		transformedNewPoint = this.getTransformedPointForSize(newPoint)

		deltaHeight = transformedNewPoint.y - this.instanceTopCenterPoint.y
		deltaX = deltaHeight / 2 * Math.sin(this.instance.radianAngle)
		deltaY = deltaHeight * (1 + Math.cos(this.instance.radianAngle)) / 2

		this.instance.height = this.instance.height - deltaHeight
		this.instance.top = this.instance.top + deltaY
		this.instance.left = this.instance.left - deltaX

		this._updatePrevDraggingPoint(event)
		this.draw.render()
	}
}

export class SizePointTopRight extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: this.instanceWidth / 2,
			y: - this.instanceHeight / 2,
		})
		this.render()
	}
}

export class SizePointBottomLeft extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: - this.instanceWidth / 2,
			y: this.instanceHeight / 2,
		})
		this.render()
	}
}

export class SizePointBottomRight extends SizePoint {
	constructor(props) {
		super(props)
	}

	public renderByInstance() {
		this.setRotatedPoint({
			x: this.instanceWidth / 2,
			y: this.instanceHeight / 2,
		})
		this.render()
	}
}