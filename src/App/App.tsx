import React, { useState } from "react";
import { RoseChart, RoseChartData, OnHoverData } from "../RoseChart";
import { PvNChart, PvNData, PvNRow, PvNHover } from "../PositiveVsNegativeChart";
import { orderBy } from "lodash";
import { format } from "d3";

type Test = {
	value: number;
	stringValue: string;
	somethingElse: boolean;
}

type PnLData = {
	pL: number;
	size: number;
	return: number;
	ticker: string;
	direction: "Overall" | "L" | "S";
	policy: string;
	strategy: string;
	subStrategy: string;
}

const boundaries = [
	{ value: 0.1, label: "10%" },
	{ value: 0.2, label: "20%" },
	{ value: 0.3, label: "30%" },
	{ value: 0.4, label: "40%" },
	{ value: 0.5, label: "50%" },
	{ value: 0.6, label: "60%" },
	{ value: 0.7, label: "70%" },
	{ value: 0.8, label: "80%" },
	{ value: 0.9, label: "90%" },
	{ value: 1, label: "100%" }
];

const formatWithSIPrefix = format(".2s");

const generateHitRateDatum = (label: string): RoseChartData<Test> => {
	const value = Number(Math.random().toFixed(2));
	const stringValue = `(${Math.random().toFixed()}, ${Math.random().toFixed()})`;
	const somethingElse = Math.random() > 0.5 ? true : false;
	const className = "slice";

	return {
		className,
		label,
		value,
		data: {
			somethingElse,
			stringValue,
			value
		}
	};
};

const randomIntFromInterval = (min: number, max: number) => { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min);
}

const generatePVNDatum = (strategy: string): PvNData<PnLData> => {
	const multiplier = Math.random() > 0.5 ? 1 : -1;
	const pL = randomIntFromInterval(10000, 1000000) * multiplier;
	return {
		value: pL,
		rawValue: {
			strategy,
			direction: "Overall",
			pL,
			policy: `${strategy}-policy`,
			return: Math.random(),
			size: randomIntFromInterval(100000, 10000000) * multiplier,
			subStrategy: "Overall",
			ticker: `Ticker-${randomIntFromInterval(1, 300)}`
		}
	};
};

const generateHitRateData = () => {
	return [
		generateHitRateDatum("Tech Shock"),
		generateHitRateDatum("Tech Reversion"),
		generateHitRateDatum("Tech Independance"),
		generateHitRateDatum("Short Term"),
		generateHitRateDatum("Shock/Inflection"),
		generateHitRateDatum("Rights Issue"),
		generateHitRateDatum("Overall"),
		generateHitRateDatum("Tagged"),
		generateHitRateDatum("IPO"),
		generateHitRateDatum("Alternative")
	].sort(() => Math.random() - 0.5)
		.slice(Math.floor(0.5 * Math.random() * 10));
};

const generatePvNRow = (strategy: string) => {
	const dataPointCount = randomIntFromInterval(10, 30);
	const row: PvNRow<PnLData> = {
		label: strategy,
		data: []
	};

	for (let i = 0; i < dataPointCount; i++) {
		row.data.push(generatePVNDatum(strategy));
	}

	return row;
}

const generatePvNData = (): PvNRow<PnLData>[] => {
	return orderBy([
		generatePvNRow("Tech Shock"),
		generatePvNRow("Tech Reversion"),
		generatePvNRow("Tech Independance"),
		generatePvNRow("Short Term"),
		generatePvNRow("Shock/Inflection"),
		generatePvNRow("Rights Issue"),
		generatePvNRow("Overall"),
		generatePvNRow("Tagged"),
		generatePvNRow("IPO"),
		generatePvNRow("Alternative")
	], d => d.label)
		.slice(Math.floor(0.5 * Math.random() * 10));
};

const PNLChartTooltip = React.memo((tooltipData: PvNHover<PnLData>) => {
	const tooltipStyles: React.CSSProperties = {
		position: "absolute",
		transition: "all 0.3s",
		pointerEvents: "none",
		opacity: tooltipData.data ? 1 : 0,
		left: tooltipData.left,
		top: tooltipData.top
	};

	const innerStyles: React.CSSProperties = {

	};

	return (
		<div className="tooltipContainer" style={tooltipStyles}>
			{tooltipData.data &&
				<div className="tooltipInner" style={innerStyles}>
					<div style={{ fontWeight: "bold" }}>{tooltipData.data.ticker}</div>
					<div>Sizing: {formatWithSIPrefix(tooltipData.data.size)}</div>
					<div>PL: {formatWithSIPrefix(tooltipData.data.pL)}</div>
				</div>
			}
		</div>
	)
});

export const App = ({ }) => {
	const [roseChartData, setRoseChartData] = useState<RoseChartData<Test>[]>(generateHitRateData());
	const [pvnChartData, setPvnChartData] = useState<PvNRow<PnLData>[]>(generatePvNData());

	return (
		<div className="app">
			<div className="charts">
				<div className="dummy">
					<button onClick={() => setPvnChartData(generatePvNData())}>Touch me</button>
					{/* <button onClick={() => setRoseChartData(generateHitRateData())}>Touch me</button> */}
				</div>
				<div className="title">Ok Boomer</div>
				<div className="aisha">
					<PvNChart rows={pvnChartData} barHeight={18} Tooltip={PNLChartTooltip} />
				</div>
				{/* <RoseChart data={roseChartData} boundaries={boundaries} onHover={onHover} boundaryLabelYOffset={8} /> */}
			</div>
		</div>
	);
};
