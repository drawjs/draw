import getCellTypeClassMap from "../map/getCellTypeClassMap"
import Cell from "../../model/Cell"
import { isNotNil } from "../../util/index"
import storeElementFields from "../../store/storeElementFields"
import Selector from "../../model/tool/Selector"
import Interaction from "../../core/interaction"
import ViewPort from "../../model/tool/ViewPort"
import Grid from "../../model/tool/Grid"
import Renderer from "../../model/tool/Renderer"
import DrawStore from "./DrawStore"
import Getters from "./Getters"
import SharedActions from "../../shared/SharedActions"
import MiniMap from "../../model/tool/MiniMap"
import TestUtils from "../../shared/TestUtils"
import TextInput from "../../model/tool/TextInput"
import { notNil, isNil, cloneDeep, intersection, mapValues, isPlainObject, isNumber, isBoolean, isString, isDate } from "../../util/lodash/index"
import { removeElement } from "../../util/js/array"
import Draw from "../../index"
import { DRAW, EXPORTABLE } from '../constant/name'
import isJsonDataType from "../../util/js/isJsonDataType"
import isBasicJsonDataType from "../../util/js/isBasicJsonDataType"

export default class Actions {
	drawStore: DrawStore

	getters: Getters

	get sharedActions(): SharedActions {
		return this.getters.draw.sharedActions
	}

	constructor( drawStore: DrawStore, getters: Getters ) {
		this.drawStore = drawStore
		this.getters = getters
	}




	/**
	 * // Update props in drawStore
	 */
	UPDATE_STORE( store: DrawStore | DrawStoreWithoutInstance ) {
		const cloned = cloneDeep( store )
		const keys: string[] = Object.keys( store )
		keys.map( set )

		function set( key ) {
			store[ key ] = cloned[ key ]
		}
	}

	UPDATE_DRAW( draw: Draw ) {
		this.drawStore[ "draw" ] = draw
	}

	UPDATE_CANVAS( canvas: HTMLCanvasElement ) {
		this.drawStore[ "canvas" ] = canvas
		this.getters.setCtx( canvas.getContext( "2d" ) )
	}

	UPDATE_TMP_CANVAS( tmpCanvas: HTMLCanvasElement ) {
		this.drawStore[ "tmpCanvas" ] = tmpCanvas
		this.getters.setTmpCtx( tmpCanvas.getContext( "2d" ) )
	}

	INTIALIZE_DRAW_ROOT_ID() {
		this.drawStore.rootId = this.getters.generateUniqueDrawRootId()
	}
	UPDATE_DRAW_ROOT_ID( rootId ) {
		this.drawStore.rootId = rootId
	}

	UPDATE_SETTING( setting: Setting ) {
		this.drawStore.setting = setting
	}

	RESET() {
		this.drawStore.cellList = []
	}

	/**
	 * View port
	 */
	UPDATE_VIEWPORT( viewPort: ViewPort ) {
		this.drawStore[ "viewPort" ] = viewPort
	}

	UPDATE_RENDERER( renderer: Renderer ) {
		this.drawStore[ "renderer" ] = renderer
	}

	UPDATE_SELECTOR( selector: Selector ) {
		this.drawStore[ "selector" ] = selector
	}

	UPDATE_INTERACTION( interaction: Interaction ) {
		this.drawStore[ "interaction" ] = interaction
	}

	UPDATE_MINIMAP( miniMap: MiniMap ) {
		this.drawStore[ "miniMap" ] = miniMap
	}

	UPDATE_GRID( grid: Grid ) {
		this.drawStore[ "grid" ] = grid
	}

	UPDATE_TEST_UTILS( testUtils: TestUtils ) {
		this.drawStore[ "testUtils" ] = testUtils
	}

	UPDATE_TEXT_INPUT( textInput: TextInput ) {
		this.drawStore[ "textInput" ] = textInput
	}

	ADD_ELEMENT( type: string, props: any = {} ) {	
		const cellTypeClassMap = getCellTypeClassMap()
		const ElementClass = cellTypeClassMap[ type ]

		if ( isNil( ElementClass ) ) {
			console.log( `Type not found: "${type}"` )
			return
		}
		const instance = new ElementClass( props )

		instance[ EXPORTABLE ] = true

		// const exportableData = getExportableData( instance )
		// const wholeElement: any = {
		// 	__instance__: instance,
		// 	// ...exportableData
		// }

		// if ( isNil( panelId ) ) {
		// 	this.getters.storeActiveElements.push( wholeElement )
		// }

		// if ( !isNil( panelId ) ) {
		// 	this.getters.getStoreElementsByPanelId( panelId ).push( wholeElement )
		// }

		return instance

		// function getExportableData( instance: any ) {
		// 	let res = {}
		// 	mapValues( instance, resolve )

		// 	function resolve( value, key ) {
		// 		if ( isPlainObject( value ) || isNumber( value ) || isString( value ) || isBoolean( value ) || isDate( value ) || isNil( value ) ) {
		// 			res[ key ] = value
		// 		}
		// 	}
		// 	return res
		// }
	}

	REMOVE_ELEMENT( element: any ) {
		if ( notNil( element ) ) {
			const elements: any[] = this.getters.cellList
			removeElement( elements, element )
		}
	}

	REMOVE_ELEMENTS( elements: any[] ) {
		elements.map( element => element && element.remove() )
		elements.map( this.REMOVE_ELEMENT.bind( this ) )
	}

	ADD_PANEL( name: string ) {
		this.getters.storePanels.push( {
			id      : this.getters.generateUniqueDrawElementId(),
			name,
			elements: []
		} )
	}

	MODIFY_ACTIVE_PANEL_ID( panelId: string ) {
		this.drawStore.activePanelId = panelId
	}

	ADD_ELEMENT_TO_CELL_LIST( cell: Cell ) {
		const { addedToBottom = false } = cell
		! addedToBottom && this.drawStore.cellList.push( cell )
		addedToBottom && this.drawStore.cellList.unshift( cell )
	}

	UPDATE_STORE_ELEMENTS_BY_THEIR_INSTANCES() {
		this.drawStore.panels.map( resolvePanel )

		function resolvePanel( panel, panelIndex ) {
			panel.elements.map( resolveElement( panelIndex ) )
		}

		function resolveElement( panelIndex ) {
			return ( element, elementIndex ) => {
				const { __instance__ } = element
				if ( isNotNil( __instance__ ) ) {
					const instanceFields = Object.keys( __instance__ )
					const intersectionFields = intersection(
						instanceFields,
						storeElementFields
					)
					intersectionFields.map( setField( panelIndex, elementIndex ) )
				}
			}
		}

		function setField( panelIndex, elementIndex ) {
			return function( field ) {
				this.drawStore.panels[ panelIndex ][ "elements" ][ elementIndex ][
					field
				] = this.drawStore.panels[ panelIndex ][ "elements" ][ elementIndex ][
					"__instance__"
				][ field ]
			}
		}
	}

	/**
	 * // Sync store
	 */
	UPDATE_SYNC_STORE_ROOT_ID( rootId: string ) {
		this.drawStore.syncStore.rootId = rootId
	}

	REFRESH_SYNC_STORE_ROOT_ID() {
		const { rootId } = this.drawStore
		this.UPDATE_SYNC_STORE_ROOT_ID( rootId )
	}

	UPDATE_SYNC_STORE_ELEMENTS( elements: SyncStoreElement[] ) {
		this.drawStore.syncStore.elements = elements
	}

	REFRESH_SYNC_STORE_ELEMENTS() {
		const { cellList } = this.drawStore
		let elements:SyncStoreElement[] = []

		cellList.filter( cell => cell[ EXPORTABLE ] ).map( cell => {
			let element: SyncStoreElement = {
				__instance__: null,
				data        : null
			}
			// element.__instance__ = element
			element.data = filterJsonDataType( cell )
			elements.push( element )
			return element
		} )
		

		this.UPDATE_SYNC_STORE_ELEMENTS( elements )

		function filterJsonDataType( object ) {
			let res = {}

			mapValues( object, ( value, key ) => {
				if( isBasicJsonDataType( value ) ) {
					res[ key ] = value
				}
			} )

			return res
		}
	}

	/**
	 * // CEll
	 */
	START_DRAG_MOST_TOP_CELL_FOCUSED( event ) {
		const point: Point2DInitial = this.getters.getInitialPoint( event )
		const cell = this.getters.getTopCell( point )
		this.sharedActions.startDragCell( cell, event )
	}

	START_DRAG_CELLS_SHOULD_SELECT( event ) {
		const self = this

		this.getters.cellsShouldSelect.map( startDrag )

		function startDrag( cell ) {
			self.sharedActions.startDragCell( cell, event )
		}
	}

	DRAGGING_CELLS_SHOULD_DRAG( event ) {
		const self = this

		this.getters.cellsShouldDrag.map( dragging )

		function dragging( cell ) {
			self.sharedActions.draggingCell( cell, event )
		}
	}

	STOP_DRAG_CELLS_SHOULD_DRAG( event ) {
		const self = this

		this.getters.cellsShouldDrag.map( stopDrag )

		function stopDrag( cell ) {
			self.sharedActions.stopDragCell( cell, event )
		}
	}

	CLICK_MOST_TOP_CELL_FOCUSED( event ) {
		const point: Point2DInitial = this.getters.getInitialPoint( event )
		const cell = this.getters.getTopCell( point )
		isNotNil( cell ) && this.sharedActions.clickCell( cell, event )
	}

	DOUBLE_CLICK_MOST_TOP_CELL_FOCUSED( event ) {
		const point: Point2DInitial = this.getters.getInitialPoint( event )
		const cell = this.getters.getTopCell( point )
		isNotNil( cell ) && this.sharedActions.doubleClickCell( cell, event )
	}

	HOVER_MOST_TOP_CELL_FOCUSED( event, interaction: Interaction ) {
		const point: Point2DInitial = this.getters.getInitialPoint( event )
		const cell = this.getters.getTopCell( point )

		const { prevHovingDsElement } = interaction

		if ( cell && cell !== prevHovingDsElement ) {
			this.sharedActions.mouseInCell( cell, event )
		}

		if ( prevHovingDsElement && cell !== prevHovingDsElement ) {
			this.sharedActions.mouseOutCell( prevHovingDsElement, event )
		}

		notNil( cell ) && this.sharedActions.mouseMoveCell( cell, event )

		interaction.updatePrevHovingDsElement( cell )
	}

	MOUSE_UP_TOP_CELL_FOCUSED( event ) {
		const point: Point2DInitial = this.getters.getInitialPoint( event )
		const cell = this.getters.getTopCell( point )
		notNil( cell ) && this.sharedActions.mouseUpCell( cell, event )
	}

	RIGHT_CLICK_TOP_CELL_FOCUSED( event ) {
		const point: Point2DInitial = this.getters.getInitialPoint( event )
		const cell = this.getters.getTopCell( point )
		notNil( cell ) && this.sharedActions.rightClickCell( cell, event )
	}

	/**
	 * // Select
	 */
	DESELECT_ALL_CELLS() {
		this.getters.selectedCells.map( this.sharedActions.deselectCell )
	}

	SELECT_MOST_TOP_CELL_FOCUSED( point: Point2D ) {
		const mostTopCell = this.getters.getTopCell( point )
		this.sharedActions.selectCell( mostTopCell )
	}

	SELECT_CELLS_IN_SELECTOR_RIGION() {
		this.getters.cellsInSelectorRigion.map( this.sharedActions.selectCell )
	}

	/**
	 * // Text input
	 */
	APPEND_TEXT_INPUT_TO_DOCUMENT_BODY() {
		const textInput = this.getters.textInput
		if ( notNil( textInput ) ) {
			const { input } = textInput
			notNil( input ) && document.body.appendChild( input )
		}
	}
}
