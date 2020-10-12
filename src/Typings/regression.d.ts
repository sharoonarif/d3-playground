declare module "regression" {
	export type RegressionOptions = {
		order?: number,
		precision?: number
	};

	export type RegressionResult = {
		string: string;
		predict: (x: number) => [number, number];
		points: [number, number][];
	};

	export const linear: (input: [number, number][]) => RegressionResult;
	export const polynomial: (input: [number, number][], options?: RegressionOptions) => RegressionResult;
}