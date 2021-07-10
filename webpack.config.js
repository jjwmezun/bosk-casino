const path = require( `path` );

module.exports = {
    mode: `production`,
	watch: true,
	entry: `./src/index.ts`,
	module: {
		rules: [
            {
				test: /\.tsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-typescript']
					}
                }
			}
		],
	},
	resolve: {
		extensions: [ `.tsx`, `.ts`, `.js` ],
	},
	output: {
		filename: `main.js`,
		path: path.resolve( __dirname, `dist` ),
	},
};