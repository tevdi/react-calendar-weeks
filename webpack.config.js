var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin');

module.exports = ( env, argv ) => {
const basename = '/'
const api_rest_basename = ''
return({
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[hash].js',
    },
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
            loader: "babel-loader"
            }
        },
        {
            test: /\.html$/,
            use: [
            {
                loader: "html-loader"
            }
            ]
        },
        {
            test: /\.css$/,
            use: [
            'style-loader',
            'css-loader'
            ]
        },
        {
            test: /\.s(a|c)ss$/,
            exclude: /\.module.(s(a|c)ss)$/,
            loader: [MiniCssExtractPlugin.loader,
            {
                loader: 'css-loader',
            },
            {
                loader: 'sass-loader',
            }
            ]
        },
        { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader',
            options: { limit: 10000, mimetype: 'application/font-woff' }
        },        
        ]
    },
    plugins: [
        ...(argv.mode == 'production' ? [new CleanWebpackPlugin()] : []),
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new BaseHrefWebpackPlugin({ baseHref: basename }),
	new webpack.ProvidePlugin({
            _: 'lodash',
	}),
        new webpack.DefinePlugin({
        process: {
            env: {
                ROUTER_BASENAME: JSON.stringify(basename),
                API_REST_BASENAME: JSON.stringify(api_rest_basename)
            }
        }
        }),
        new CopyPlugin([
        {
            from: 'src/*.json',
            flatten: true,
        },
        {
            from: 'src/*.ico',
            flatten: true,              
        },
        ]),
        new MiniCssExtractPlugin({
            filename: '[hash].css',
            chunkFilename: '[hash].css'
        }),
    ],
    devServer: {
        host: 'localhost',
        port: 8080,
        historyApiFallback: true,
    },
})
}
