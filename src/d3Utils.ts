import { BaseType, Selection } from "d3";

export type BaseSelection = Selection<BaseType, any, BaseType, unknown>;

export const fadeOutOnExit = (selection: BaseSelection) => {
	selection
			.exit()
			.transition()
			.style("opacity", 0)
			.remove();
};