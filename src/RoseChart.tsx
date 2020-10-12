import React, { useRef, useEffect, useMemo } from "react";
import { useElementSize } from "./useElementSize";
import { select, arc, event } from "d3";
import { fadeOutOnExit } from "./d3Utils";
import { orderBy } from "lodash";

export type RoseChartData<T> = {
	label: string;
	value: number;
	data: T;
	className?: string;
}

export type RoseChartBoundaries = {
	value: number;
	label?: string;
};

export type OnHoverData<T> = {
	offsetX: number;
	offsetY: number;
	clientX: number;
	clientY: number;
	data: T;
};

export type RoseChartProps<T> = {
	data: RoseChartData<T>[];
	boundaries: RoseChartBoundaries[];
	leftRightMargin?: number;
	onHover?: (data: OnHoverData<T>) => void;
	onHoverOut?: () => void;
	slicePadding?: number;
	sliceLineExtension?: number;
	textPadding?: number;
	boundaryLabelClassName?: string;
	boundaryLabelYOffset?: number;
};

export const degToRad = (degrees: number) => degrees * (Math.PI / 180);
export const radToDeg = (radians: number) => radians * (180 / Math.PI);
const arcFn = arc();
const innerRadius = 6;

export const RoseChart = ({ data, boundaries, leftRightMargin = 120, textPadding = 10, sliceLineExtension = 10, slicePadding = 2, onHover, onHoverOut, boundaryLabelClassName, boundaryLabelYOffset = 0 }: RoseChartProps<any>) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, height] = useElementSize(containerRef);
	const centerX = width / 2;
	const centerY = height / 2;
	const slices = data.length;
	const sliceAngle = 360 / slices;
	const halfSliceAngle = sliceAngle / 2;
	const sliceAngleRads = degToRad(sliceAngle);
	const slicePaddingRads = degToRad(slicePadding);
	const radius = Math.min(centerX, centerY) - leftRightMargin;

	const generateSlicePath = (d: RoseChartData<any>, i: number, outerRadius: number) => {
			if (d.value <= 0) {
					return "";
			}

			const startAngle = (i * sliceAngleRads) + slicePaddingRads;
			const endAngle = startAngle + sliceAngleRads - (slicePaddingRads * 2);

			return arcFn({
					startAngle,
					endAngle,
					innerRadius,
					outerRadius
			});
	};

	const svg = select(containerRef.current)
		.select("svg");

	const updateChart = () => {
		if (svg.empty()) {
			return;
		}

		updateBoundaries();
		updateSliceLines();
		updateSlices();
		updateSliceLabels();
	}

	const updateSliceLabels = () => {
		const labelsSelection = select(containerRef.current)
			.select(".sliceLabels")
			.selectAll("div")
			.data(data);

		const labelEnter = labelsSelection
			.enter()
			.append("div")
			.style("left", `${centerX + radius + textPadding}px`)
			.style("top", `${centerY}px`);;

		labelEnter
			.append("span")
			.text(d => d.label)
			.style("max-width", `${leftRightMargin}px`);

		const merged = labelsSelection
			.merge(labelEnter)
			.transition();

		merged
			.select("span")
			.text(d => d.label)
			.attr("title", d => d.label)
			.style("transform", (_, i) => `rotate(${((i * sliceAngle) + halfSliceAngle - 90) * -1}deg)`);
			
		merged
			.style("left", `${centerX + radius + textPadding}px`)
			.style("top", `${centerY}px`)
			.style("transform-origin", `${-(radius + textPadding)}px 0px`)
			.style("transform", (_, i) => `rotate(${(i * sliceAngle) + halfSliceAngle - 90}deg)`);
		
		fadeOutOnExit(labelsSelection);
	}

	const updateBoundaries = () => {
		const boundariesSelection = svg.select(".boundaries")
			.selectAll("circle")
			.data(boundaries)
			
		const boundariesEnter = boundariesSelection
			.enter()
			.append("circle")
			.attr("cx", centerX)
			.attr("cy", centerY);
		
		boundariesSelection
			.merge(boundariesEnter)
			.transition()
			.attr("cx", centerX)
			.attr("cy", centerY)
			.attr("r", d => radius * d.value);

		boundariesSelection.exit().remove();

		const boundaryLabelSelection = select(containerRef.current)
			.select(".boundaryLabels")
			.selectAll("div")
			.data(boundaries);

		const boundaryLabelsEnter = boundaryLabelSelection
			.enter()
			.append("div")
			.style("top", `${centerY}px`);

		boundaryLabelsEnter
			.append("span");

		const onMerge = boundaryLabelSelection
			.merge(boundaryLabelsEnter)
			.transition();

		onMerge
			.style("top", d => `${centerY - (radius * d.value) - boundaryLabelYOffset}px`);

		onMerge
			.select("span")
			.text(d => d.label || d.value);

		fadeOutOnExit(boundaryLabelSelection);
	}

	const updateSliceLines = () => {
		const linesSelection = svg.select(".sliceSections")
			.selectAll("line")
			.data(data)

		const linesEnter = linesSelection
			.enter()
			.append("line")
			.attr("x1", centerX)
			.attr("y1", centerY)
			.attr("x2", centerX)
			.attr("y2", centerY - radius - sliceLineExtension);

		linesSelection
			.merge(linesEnter)
			.transition()
			.attr("transform", (_, i) => `rotate(${i * sliceAngle})`)
			.attr("transform-origin", `${centerX} ${centerY}`)
			.attr("x1", centerX)
			.attr("y1", centerY)
			.attr("x2", centerX)
			.attr("y2", centerY - radius - sliceLineExtension);
		
		linesSelection
			.exit()
			.transition()
			.attr("transform", "rotate(0)")
			.remove();
	};

	const updateSlices = () => {
		const slicesSelection = svg.select(".slices")
			.selectAll("path")
			.data(data)

		const slicesEnter = slicesSelection
			.enter()
			.append("path")
			.attr("transform", `translate(${centerX}, ${centerY})`)
			.attr("d", (d, i) => generateSlicePath(d, i, innerRadius + 1));;

		const onMerge = slicesSelection
			.merge(slicesEnter);
			
			if (onHover) {
				onMerge.on("mouseover", d => {
						onHover({
								clientX: event.clientX,
								clientY: event.clientY,
								offsetX: event.offsetX,
								offsetY: event.offsetY,
								data: d.data
						});
				});
		}

		if (onHoverOut) {
				onMerge.on("mouseout", onHoverOut);
		}

		onMerge
			.transition()
			.attr("transform", `translate(${centerX}, ${centerY})`)
			.attr("class", d => d.className || null)
			.attr("d", (d, i) => generateSlicePath(d, i, radius * d.value));

		slicesSelection
			.exit()
			.transition()
			.attr("d", (d: RoseChartData<any>, i) => generateSlicePath(d, i, innerRadius + 1))
			.remove();
	}

	useEffect(() => {
		if (containerRef.current) {
			updateChart();
		}
	}, [data, boundaries, containerRef.current, width, height]);

	return (
		<div className="roseChartContainer" ref={containerRef}>
			<svg width={width} height={height}>
				<g className="boundaries"></g>
				<g className="sliceSections"></g>
				<g className="slices"></g>
			</svg>
			<div className="sliceLabels"></div>
			<div className="boundaryLabels"></div>
		</div>
	)
};