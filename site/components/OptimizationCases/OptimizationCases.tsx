import React from "react"
import MassiveRange from "../../examplex/MassiveRangeCase"
import DynamicMeasurement from "../../examplex/DynamicMeasurementCase"
import AnchorMutation from "../../examplex/AnchorMutationCase"
import GroupedProductShell from "../../examplex/GroupedProductShellCase"
import { caseTw } from "../ExampleSupport/tailwind"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"

function OptimizationCases({ copy = DEFAULT_EXAMPLE_COPY }: { copy?: ExampleCopy }) {
	return (
		<div className={ `optimization-cases-grid ${ caseTw.grid }` }>
			<MassiveRange copy={copy}/>
			<DynamicMeasurement copy={copy}/>
			<AnchorMutation copy={copy}/>
			<GroupedProductShell copy={copy}/>
		</div>
	)
}

export default OptimizationCases
