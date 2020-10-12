export type ChartProps<T> = {
	height: number;
	width: number;
	data: T[];
	options: ChartOptions;
};

export type ChartOptions = {
	xAxisLabel?: string;
	xAxisLabelClass?: string;
	yAxisLabel?: string;
	yAxisLabelClass?: string;
	drawRegressionLine?: boolean;
	regressionLineClass?: string;
};