import { generateId, isNotNil } from "../../util/index"
import { Cell } from "../../model/index"
import Graph from "../../model/Graph"
import Selector from "../../model/tool/Selector"
import Draw from "../../Draw"
import selectionExcludingCellTypes from "../exclude/selectionExcludingCellTypes"
import ViewPort from "../../model/tool/ViewPort"
import EventKeyboard from "../../util/EventKeyboard"
import Interaction from "../../core/interaction"
import Grid from "../../model/tool/Grid"
import Renderer from "../../model/tool/Renderer"
import DrawStore from "./DrawStore"
import drawRenderExcludingCellTypes from "../exclude/drawRenderExcludingCellTypes"
import MiniMap from '../../model/tool/MiniMap'
import TestUtils from '../../shared/TestUtils'
import { MINI_MAP, POLYGON } from "../constant/cellType"
import TextInput from '../../model/tool/TextInput'
import { DRAW_ROOT, DRAW_ELEMENT, EXPORTABLE } from '../constant/name'
import { cloneDeep, isNil, find, includes, mapValues, isPlainObject, isArray, notNil } from '../../util/lodash/index'
import isBasicJsonDataType from "../../util/js/isBasicJsonDataType"

export default class Getters {
	drawStore: DrawStore

	ctx: CanvasRenderingContext2D

	tmpCtx: CanvasRenderingContext2D


	constructor( drawStore ) {
		this.drawStore = drawStore
	}

	get draw(): Draw {
		return this.drawStore.draw
	}

	/**
	 * Store without instances
	 */
	get storeActivePanelId(): string {
		return !isNil( this.drawStore.activePanelId ) ?
			this.drawStore.activePanelId :
			this.drawStore.panels.length > 0 ?
				this.drawStore.panels[ 0 ].id :
				null
	}

	get storeElementsIds(): string[] {
		let ids: string[]
		let cachedElements: DrawStoreElement[] = []

		if ( isNil( this.drawStore ) || isNil( this.drawStore.panels ) ) {
			return []
		}

		this.drawStore.panels.map( pushElementsToCachedElement )

		ids = cachedElements.map( getId )

		function pushElementsToCachedElement( panel: DrawStorePanel ) {
			cachedElements = [ ...cachedElements, ...panel.elements ]
		}

		function getId( element: DrawStoreElement ): string {
			return element.id
		}

		return ids
	}

	get storeActiveElements(): DrawStoreElement[] {
		return this.getStoreElementsByPanelId( this.storeActivePanelId )
	}

	get storePanels(): DrawStorePanel[] {
		return this.drawStore.panels
	}

	generateUniqueDrawRootId(): string {
		return generateId( DRAW_ROOT )
	}

	generateUniqueDrawElementId(): string {
		const self = this
		let id: string = generateId( DRAW_ELEMENT )
		id = checkAndUpdateIdIfNeeded( id )

		function checkAndUpdateIdIfNeeded( id: string ) {
			return includes( self.storeElementsIds, id ) ?
				checkAndUpdateIdIfNeeded( generateId() ) :
				id
		}
		return id
	}


	/**
	 * // Cell list
	 */
	get cellList(): Cell[] {
		return this.drawStore.cellList
	}

	get cellListShouldRender(): Cell[] {
		const { renderingMainCells } = this.miniMap
		const res: Cell[] = renderingMainCells ? this.cellList.filter( include ).filter( shouldRenderWhenMiniMapRendering ) : this.cellList.filter( include )
		return res


		function include(  { type }: Cell  ): boolean {
			return ! includes( drawRenderExcludingCellTypes, type )
		}

		function shouldRenderWhenMiniMapRendering( cell: Cell ) {
			return cell.shouldRenderInMiniMap
		}
	}

	get cellsShouldSelect(): Cell[] {
		const res: Cell[] = this.cellList.filter( shouldCellSelect )
		return res

		function shouldCellSelect( cell ): boolean {
			const { shouldSelect } = cell
			return shouldSelect === true
		}
	}

	get cellsShouldDrag(): Cell[] {
		const res: Cell[] = this.cellList.filter( shouldCellDrag )
		return res

		function shouldCellDrag( cell ): boolean {
			return cell.dragger.enable === true
		}
	}

	getTopCell( { x, y }: Point2D ): Cell {
		let res: Cell
		this.cellList.map( getProperCell )
		return res

		function getProperCell( cell ) {
			if ( ! cell.isPart && cell.contain( x, y ) ) {
				res = cell
			}
		}
	}

	/**
	 * // Canvas
	 */
	get canvas(): HTMLCanvasElement {
		return this.drawStore.canvas
	}

	get canvasLeft(): number {
		return this.canvas.getBoundingClientRect().left
}

	get canvasRight(): number {
		return this.canvas.getBoundingClientRect().right
	}

	get canvasTop(): number {
		return this.canvas.getBoundingClientRect().top
	}

	get canvasBottom(): number {
		return this.canvas.getBoundingClientRect().bottom
	}

	get canvasWidth(): number {
		return this.canvas.getBoundingClientRect().width
	}

	get canvasHeight(): number {
		return this.canvas.getBoundingClientRect().height
	}

	get canvasCenterPoint(): Point2D {
		const res = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2
		}
		return res
	}

	get tmpCanvas(): HTMLCanvasElement {
		return this.drawStore.tmpCanvas
	}

	pointOnPath( point: Point2DInitial, path: Path2D ): boolean {
		this.renderer.resetTransform()

		const { x, y }: Point2DCurrent = point
		const isContain = this.ctx.isPointInPath( path, x, y )

		this.renderer.setTransformViewPort()

		return isContain
	}

	/**
	 * Get real-time point on view port
	 */
	getPoint( event ): Point2DCurrent {
		const point: Point2DCurrent = {
			x: event.x - this.canvasLeft,
			y: event.y - this.canvasTop
		}
		return point
	}

	/**
	 * Get point on initial view port
	 */
	getInitialPoint( event ): Point2DInitial {
		const point: Point2DCurrent = this.getPoint( event )
		const res: Point2DInitial = this.viewPort.transformToInitial( point )
		return res
	}

	/**
	 * // View port
	 */
	get viewPort(): ViewPort {
		return this.drawStore.viewPort
	}

	get zoom(): number {
		return this.viewPort.zoom
	}

	get pan(): Point2D {
		return this.viewPort.pan
	}

	get panX(): number {
		return this.viewPort.pan.x
	}

	get panY(): number {
		return this.viewPort.pan.y
	}

	/**
	 *  Horizontal movement of zoomed view port
	 */
	get movementX(): number {
		return this.viewPort.movementX
	}

	/**
	 *  Vertical movement of zoomed view port
	 */
	get movementY(): number {
		return this.viewPort.movementY
	}

	/**
	 * // Renderer
	 */
	get renderer(): Renderer {
		return this.drawStore.renderer
	}

	/**
	 * // Selector
	 */
	get selector(): Selector {
		return this.drawStore.selector
	}

	get selectedCells(): Cell[] {
		return this.cellList.filter( ( { shouldSelect } ) => shouldSelect === true )
	}

	get cellsInSelectorRigion(): Cell[] {
		const self = this
		const res: Cell[] = this.cellList.filter( include ).filter( notCellPart ).filter( inRigion )

		function include( { type }: Cell ): boolean {
			const res: boolean = !includes( selectionExcludingCellTypes, type )
			return res
		}

		function notCellPart( cell ) {
			return ! cell.isPart
		}

		function inRigion( cell: Graph ): boolean {
			const { bounds } = cell
			const res: boolean = self.selector.boundsInSelectionArea( bounds )
			return res
		}

		return res
	}

	pointOnSelectionExcludingCells( point: Point2D ): boolean {
		let res: boolean = false
		const mostTopCell: Cell = this.getTopCell( point )
		if ( isNotNil( mostTopCell ) ) {
			res = includes( selectionExcludingCellTypes, mostTopCell.type )
		}
		return res
	}

	pointOnCellSelected( point: Point2D ): boolean {
		let res: boolean = false
		const mostTopCell: Cell = this.getTopCell( point )
		if ( isNotNil( mostTopCell ) ) {
			const { shouldSelect } = mostTopCell
			res = shouldSelect === true
		}
		return res
	}

	pointOnCellDeselected( point: Point2D ): boolean {
		let res: boolean = false
		const mostTopCell: Cell = this.getTopCell( point )
		if ( isNotNil( mostTopCell ) ) {
			const { shouldSelect } = mostTopCell
			res = shouldSelect === false
		}
		return res
	}

	/**
	 * Data to export
	 */
	get clonedStoreWithoutCircularObjects(): DrawStore {
		let clonedStore: DrawStore = cloneDeep( this.drawStore )

		deleteCellList()

		clonedStore.panels.map( resolvePanel )

		return clonedStore

		function resolvePanel( panel, panelIndex ) {
			panel.elements.map( delete__Instance__( panelIndex ) )
		}

		function delete__Instance__( panelIndex ) {
			return ( element, elementIndex ) => {
				delete clonedStore.panels[ panelIndex ].elements[ elementIndex ]
					.__instance__
			}
		}

		function deleteCellList() {
			delete clonedStore[ "cellList" ]
		}
	}

	get __storeActiveElementsInstances__(): DrawStoreElementInstance[] {
		const res: DrawStoreElementInstance[] = this.storeActiveElements.map(
			get__instance__
		)
		return res

		function get__instance__( element ) {
			return element.__instance__
		}
	}

	getStoreElementsByPanelId( id: string ): any {
		const foundPanel = find( this.drawStore.panels, { id } )
		const res: any = !isNil( foundPanel ) ? foundPanel.elements : []
		return res
	}

	pointOnEmpty( point: Point2D ): boolean {
		const mostTopCell: Cell = this.getTopCell( point )
		const res: boolean = isNil( mostTopCell )
		return res
	}

	/**
	 * // Set ctx, tmp ctx
	 */
	setCtx( ctx: CanvasRenderingContext2D ) {
		this.ctx = ctx
	}

	setTmpCtx( tmpCtx: CanvasRenderingContext2D ) {
		this.tmpCtx = tmpCtx
	}


	/**
	 * // Interaction
	 */
	get interaction(): Interaction {
		return this.drawStore.interaction
	}

	get eventKeyboard(): EventKeyboard {
		return this.interaction.eventKeyboard
	}


	/**
	 * // Mini map
	 */
	get miniMap(): MiniMap {
		return this.drawStore.miniMap
	}


	/**
	 * // Grid
	 */
	get grid(): Grid {
		return this.drawStore.grid
	}

	/**
	 * // Test utils
	 */
	get testUtils(): TestUtils {
		return this.drawStore.testUtils
	}

	/**
	 * // Text input
	 */
	get textInput(): TextInput {
		const { textInput } = this.drawStore
		return textInput
	}


	/**
	 * Export
	 */
	get exportingElements(): any[] {
		return this.drawStore.cellList.filter( element => {
			return element && element[ EXPORTABLE ]
		} ).map( element => {
			let res: any = {}

				// Special situation
				const { type, points } = element
				if ( notNil( points ) ) {
					res[ 'points' ] = points
				}

        mapValues( element, ( value, key ) => {
          // if ( isBasicJsonDataType( value ) || isPlainObject( value ) ) {
          //   res[ key ] = value
					// }
					res[ key ] = recurToGetValidValue( value )
        } )

        return res
		} )

		function recurToGetValidValue( value ) {
			if ( isBasicJsonDataType( value ) || isPlainObject( value ) ) {
				return value
			}

			if ( isArray( value ) && isValidArray( value )  ) {
				value.map( el => recurToGetValidValue( el ) )
			}

			return null
		}

		function isValidArray( array ) {
			return array.every( el => isBasicJsonDataType( el ) || isPlainObject( el ) )
		}
	}

	get exportingData(): ExportingData {
		const { rootId, viewPort } = this.drawStore
		const { zoom, center } = viewPort
		const { exportingElements: elements } = this
		return {
			rootId,
			zoom,
			center,
			elements
		}
	}
}
