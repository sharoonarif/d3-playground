const isProd = process.env.npm_lifecycle_script.includes("-p");

module.exports = {
	entry: {
		app: "./src/index.tsx"
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader"
			}
		]
	},
	mode: isProd ? "production" : "development",
	devtool: !isProd && "source-map"
};