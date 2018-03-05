import getters from "../store/draw/getters"
import Cell from "model/Cell"
import selectionExcludingCellTypes from "../store/exclude/selectionExcludingCellTypes"
import { includes } from "lodash"
import { isNotNil, getPointAngleToOrigin } from "util/index"
import Dragger from "../model/tool/Dragger"
import Graph from "../model/Graph"

class SharedGetters {
	// Selector
	pointOnSelectionExcludingCells( point: Point2D ): boolean {
		let res: boolean = false
		const mostTopCell: Cell = getters.getMostTopCellFocused( point )
		if ( isNotNil( mostTopCell ) ) {
			res = includes( selectionExcludingCellTypes, mostTopCell.type )
		}
		return res
	}

	pointOnCellSelected( point: Point2D ): boolean {
		let res: boolean = false
		const mostTopCell: Cell = getters.getMostTopCellFocused( point )
		if ( isNotNil( mostTopCell ) ) {
			const { shouldSelect } = mostTopCell
			res = shouldSelect === true
		}
		return res
	}

	pointOnCellDeselected( point: Point2D ): boolean {
		let res: boolean = false
		const mostTopCell: Cell = getters.getMostTopCellFocused( point )
		if ( isNotNil( mostTopCell ) ) {
			const { shouldSelect } = mostTopCell
			res = shouldSelect === false
		}
		return res
	}
}

export default new SharedGetters()