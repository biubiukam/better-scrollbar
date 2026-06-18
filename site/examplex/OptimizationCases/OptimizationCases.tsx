import React from "react"
import MassiveRange from "../MassiveRange"
import DynamicMeasurement from "../DynamicMeasurement"
import AnchorMutation from "../AnchorMutation"
import GroupedProductShell from "../GroupedProductShell"
import { caseTw } from "../tailwind"

function OptimizationCases() {
	return (
		<div className={ `optimization-cases-grid ${ caseTw.grid }` }>
			<MassiveRange/>
			<DynamicMeasurement/>
			<AnchorMutation/>
			<GroupedProductShell/>
		</div>
	)
}

export default OptimizationCases
