const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    return {
        mode: 'production',
        target: 'webworker',
        entry: {
            main: './src/index.tsx',
            background: './src/background/index.ts',
            content: './src/content-script/index.ts',
            // injected: './src/content-script/injected.ts'
            injected: './src/content-script/pageProvider/index.ts'
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: '[name].js',
            assetModuleFilename: 'media/[name][ext]',
            clean: true,
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
            mainFields: ['browser', 'module', 'main'],
            conditionNames: ['browser', 'import', 'default'],
            alias: {
                '@': path.resolve(__dirname, 'src/'),
                '@kasplex': path.resolve(__dirname, 'node_modules/@kasplex')
            },
            fallback: {
                "path": require.resolve("path-browserify"),
                "url": false
            }
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: path.resolve(__dirname, 'src'),
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 15 * 1024,
                        },
                    },
                    generator: {
                        filename: 'media/[name][ext]'
                    }
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'media/[name][ext]'
                    }
                }
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: './index.html',
                filename: 'index.html',
                inject: 'body',
                chunks: ['main'],
                minify: {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                }
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            }),

            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: './manifest.json',
                        to: './manifest.json'
                    },
                    {
                        from: 'src/assets/images/icon16.png',
                        to: 'media/icon16.png'
                    },
                    {
                        from: 'src/assets/images/icon48.png',
                        to: 'media/icon48.png'
                    },
                    {
                        from: 'src/assets/images/icon128.png',
                        to: 'media/icon128.png'
                    }
                ]
            })
        ],
        devServer: {
            static: [
                {
                    directory: path.join(__dirname, 'build'),
                    publicPath: '/'
                }
            ],
            client: {
                overlay: {
                    runtimeErrors: (error => {
                        if (error.message.includes('Content Security Policy')) {
                            return false;
                        }
                        return true;
                    })
                }

            },
            compress: true,
            port: 5678,
            historyApiFallback: true,
            hot: true,
            open: true,
            devMiddleware: {
                writeToDisk: true
            }
        },
        optimization: {
            minimize: true,
            splitChunks: false,
            runtimeChunk: false,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        mangle: false,
                        // compress: {
                        // drop_console: true
                        // }
                    },
                    extractComments: false,
                })
            ]
        },
        experiments: {
            asyncWebAssembly: true,
        },
        performance: {
            hints: false
        },
        ignoreWarnings: [
            warning =>
                typeof warning.message === "string" &&
                warning.message.includes("conflicting star exports for the name '__esModule'"),
        ],
    }
}
