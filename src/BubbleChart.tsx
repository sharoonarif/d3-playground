import React, { useEffect, useRef } from "react";
import { useElementSize } from "./useElementSize";

type BubbleChartProps = {
	data: any;
}

export const BubbleChart = ({ data }: BubbleChartProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, height] = useElementSize(containerRef);

	const updateChart = () => {
		
	};

	useEffect(() => {
		if (containerRef.current) {
			updateChart();
		}
	}, [containerRef, width, height, data]);

	return (
		<div className="bubbleChartContainer" ref={containerRef}>
			<svg>

			</svg>
		</div>
	)
}