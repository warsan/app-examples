const path = require('path')

module.exports = {
	mode: 'none', // Тип! скомпилировать в рабочем режиме перед публикацией

	// Тип! Просто удалите не используя файлы, но требуется main.ts
	entry: {
		index: './src/index.ts',
		'bottom-panel': './src/bottom-panel.tsx'
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: 'ts-loader',
					options: {
						transpileOnly: true
					}
				},
				exclude: /node_modules/
			},
			{
				test: /\.less$/,
				use: [{
					loader: "style-loader"
				}, {
					loader: "css-loader"
				}, {
					loader: "less-loader"
				}],
				exclude: /node_modules/
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader'
			}
		]
	},
	resolve: {
		modules: [
			path.resolve('./src'),
			path.resolve('./node_modules')
		],
		extensions: ['.tsx', '.ts', '.js', '.less', '.css']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	}
}
