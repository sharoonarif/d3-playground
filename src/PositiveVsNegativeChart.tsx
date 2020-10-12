import React, { useEffect, useRef, useMemo, useState } from "react";
import { useElementSize } from "./useElementSize";
import { select, scaleLinear, interpolateRgb, BaseType, Selection, format, event } from "d3";
import { fadeOutOnExit } from "./d3Utils";
import { orderBy } from "lodash";

export type PvNData<T> = {
	value: number;
	rawValue: T;
}

export type PvNHover<T> = {
	top: number;
	left: number;
	data?: T;
};

export type PvNRow<T> = {
	label: string;
	data: PvNData<T>[];
}

export type PvNChartProps<T> = {
	rows: PvNRow<T>[];
	barHeight?: number;
	rowPadding?: number;
	transitionDelay?: number;
	labelSize?: number;
	Tooltip?: React.ComponentType<T>;
}

type ChartData<T> = {
	value: number;
	startValue: number;
	rawValue: T;
};

type ChartRow<T> = {
	orderedPositiveData: ChartData<T>[];
	orderedNegativeData: ChartData<T>[];
}

const mapChartRow = (row: PvNData<any>[]): ChartData<any>[] => {
	const mappedRow: ChartData<any>[] = [];
	row.reduce((prevCumulative, data) => {
		mappedRow.push({
			...data,
			startValue: prevCumulative
		});

		return prevCumulative + data.value;
	}, 0);

	return mappedRow;
}

const interpolatePositive = interpolateRgb("#003002", "#09E810");
const interpolateNegative = interpolateRgb("#650000", "#FF4A4A");
const formatWithSIPrefix = format(".2s");

export const PvNChart = ({ rows, barHeight = 22, rowPadding = 8, labelSize = 16, transitionDelay = 14, Tooltip }: PvNChartProps<any>) => {
	const chartRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [width] = useElementSize(chartRef);
	const container = select(chartRef.current);
	const scale = scaleLinear();
	const totalBarHeight = barHeight + (rowPadding * 2);
	const height = (rows.length * totalBarHeight) || 200;
	const centerY = height / 2;
	const centerX = width / 2;
	const [tooltipData, setTooltipData] = useState<PvNHover<any>>({ top: 0, left: 0 });

	const mappedChartRows: ChartRow<any>[] = useMemo(() => {
		return rows.map(r => {
			const orderedByValue = orderBy(r.data, d => d.value);
			const positiveValues = [];
			const negativeValues = [];
			for (const item of orderedByValue) {
				item.value < 0 ? negativeValues.push(item) : positiveValues.push(item);
			}

			return {
				orderedPositiveData: mapChartRow(positiveValues),
				orderedNegativeData: mapChartRow(negativeValues.reverse())
			}
		});
	}, [rows]);

	const maxValue = useMemo(() => {
		return Math.max(...rows.map(r => r.data).flat().map(d => Math.abs(d.value)));
	}, [rows]);

	const updateChart = () => {
		const maxTotal = Math.max(...mappedChartRows
			.map(r => {
				const positiveTotal = r.orderedPositiveData.reduce((a, b) => a + b.value, 0);
				const negativeTotal = r.orderedNegativeData.reduce((a, b) => a + b.value, 0);

				return Math.max(positiveTotal, Math.abs(negativeTotal));
			}));

		scale
			.range([0, width])
			.domain([-maxTotal, maxTotal]);

		updateRows();
		updateLabels();
		updateGridlines();
	};

	const updateLabels = () => {
		const labelSelection = select(containerRef.current)
			.select(".labels")
			.selectAll(".label")
			.data(rows);

		const labelsEnter = labelSelection
			.enter()
			.append("div")
			.attr("class", "label")
			.style("font-size", labelSize)
			.style("opacity", 0);

		labelSelection
			.merge(labelsEnter)
			.transition()
			.delay((_, i) => i * transitionDelay)
			.style("opacity", 1)
			.text(d => d.label)
			.style("top", (_, i) => `${(i * totalBarHeight) + (totalBarHeight / 2) - (labelSize / 2)}px`);

		fadeOutOnExit(labelSelection);
	};

	const updateGridlines = () => {
		const ticks = scale.nice().ticks();
		const gridlinesSelection = container
			.select(".gridlines")
			.selectAll(".gridline")
			.data(ticks);

		const gridlinesEnter = gridlinesSelection
			.enter()
			.append("div")
			.attr("class", "gridline")
			.style("left", `${centerX}px`);

		gridlinesSelection
			.merge(gridlinesEnter)
			.transition()
			.style("left", d => `${scale(d)}px`)
			.style("height", `${height}px`);

		fadeOutOnExit(gridlinesSelection);

		const tickLabelsSelection = container.select(".tickLabels")
			.selectAll(".tickLabel")
			.data(ticks);

		const tickLabelEnter = tickLabelsSelection
			.enter()
			.append("div")
			.attr("class", "tickLabel")
			.style("left", `${centerX}px`)
			.style("width", "32px")
			.style("top", `${height + 4}px`);

		tickLabelsSelection
			.merge(tickLabelEnter)
			.transition()
			.style("top", `${height + 4}px`)
			.style("left", d => `${scale(d) - 16}px`)
			.text(d => formatWithSIPrefix(d));

		fadeOutOnExit(tickLabelsSelection);
	}

	const updateRows = () => {
		const rowsSelection = container
			.select(".pvnRows")
			.selectAll(".pvnRow")
			.data(mappedChartRows);

		const rowsEnter = rowsSelection
			.enter()
			.append("div")
			.attr("class", "pvnRow")
			.style("top", `${centerY}px`)
			.style("left", `${centerX - 100}px`)
			.style("width", "200px")
			.style("height", "10px")
			.style("opacity", 0);

		const mergedRows = rowsSelection
			.merge(rowsEnter);

		mergedRows
			.transition()
			.style("top", (_, i) => `${totalBarHeight * i}px`)
			.style("left", "0px")
			.style("width", `${width}px`)
			.style("height", `${totalBarHeight}px`)
			.style("padding", `${rowPadding}px 0`)
			.style("opacity", 1);

		const positiveBarsSelection = mergedRows
			.selectAll(".positiveBar")
			.data(d => d.orderedPositiveData);

		updateBars(positiveBarsSelection);

		const negativeBarsSelection = mergedRows
			.selectAll(".negativeBar")
			.data(d => d.orderedNegativeData);

		updateBars(negativeBarsSelection);

		rowsSelection
			.exit()
			.transition()
			.style("top", "0")
			.style("height", "10px")
			.style("opacity", 0)
			.remove();
	}

	const updateBars = (selection: Selection<BaseType, ChartData<any>, BaseType, ChartRow<any>>) => {
		const barEnter = selection
			.enter()
			.append("div")
			.attr("class", d => `bar ${d.value < 0 ? "negativeBar" : "positiveBar"}`)
			.style("height", `${barHeight}px`)
			.style("width", "1px")
			.style("left", `${centerX}px`);

		const onMerge = selection
			.merge(barEnter);

		if (Tooltip) {
			onMerge.on("mousemove", d => {
				const { target, offsetX } = event;
				setTooltipData({
					left: target.offsetLeft + offsetX + 10,
					top: target.parentNode.offsetTop - 10,
					data: d.rawValue
				});
			});

			onMerge.on("mouseout", () => {
				setTooltipData(prev => ({
					...prev,
					data: undefined
				}));
			});
		}

		onMerge
			.transition()
			.delay((_, i) => i * transitionDelay)
			.style("left", d => {
				const left = d.value < 0 ?
					scale(d.startValue + d.value) :
					scale(d.startValue);

				return `${left}px`;
			})
			.style("width", d => {
				const width = d.value < 0 ?
					scale(d.startValue) - scale(d.startValue + d.value) :
					scale(d.startValue + d.value) - scale(d.startValue);

				return `${width}px`;
			})
			.style("background-color", (d) => {
				const absoluteValue = Math.abs(d.value);
				const percentageOfMax = absoluteValue / maxValue;
				const interpolator = d.value < 0 ? interpolateNegative : interpolatePositive;

				return interpolator(percentageOfMax);
			});

		selection
			.exit()
			.transition()
			.style("height", `${barHeight}px`)
			.style("width", "1px")
			.style("left", `${centerX}px`)
			.remove();
	}

	useEffect(() => {
		if (chartRef.current && containerRef.current && mappedChartRows.length !== 0) {
			updateChart();
		}
	}, [chartRef, containerRef, width, height, mappedChartRows]);

	const hasRows = rows.length !== 0;
	return (
		<div className="pvnChartContainer" ref={containerRef}>
			{hasRows && <div className="labels"></div>}
			<div className="pvnChart" ref={chartRef} style={{ height }}>
				{
					!hasRows ? <div>No Data</div> :
						<>
							<div className="gridlines"></div>
							<div className="pvnRows"></div>
							<div className="zeroLine" style={{ height }}></div>
							<div className="tickLabels"></div>
							{Tooltip && <Tooltip {...tooltipData} />}
						</>
				}
			</div>
		</div>
	);
}