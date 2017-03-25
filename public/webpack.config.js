/**
 * Copyright 2017 Michael Kurze
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = ( env = {} ) => {

   const publicPath = env.production ? 'dist/' : 'build/';

   return {
      devtool: '#source-map',
      entry: {
         'app': './init.js',
         'vendor': [ 'laxar-vue-adapter', 'vue' ]
      },

      output: {
         path: path.resolve( __dirname, publicPath ),
         publicPath,
         filename: env.production ? '[name].bundle.min.js' : '[name].bundle.js'
      },

      plugins: [
         new webpack.optimize.CommonsChunkPlugin( { name: 'vendor' } ),
         ...( env.production ? [ new ExtractTextPlugin( { filename: '[name].bundle.css' } ) ] : [] )
      ],

      resolve: {
         modules: [ path.resolve( __dirname, 'node_modules' ) ],
         extensions: [ '.js', '.vue' ]
      },

      module: {
         rules: [
            {
               test: /\.js$/,
               exclude: /node_modules/,
               loader: 'babel-loader'
            },
            {
               test: /\.vue$/,
               exclude: /node_modules/,
               loader: 'vue-loader'
            },
            {
               test: /.spec.js$/,
               exclude: /node_modules/,
               loader: 'laxar-mocks/spec-loader'
            },

            {  // load styles, images and fonts with the file-loader
               // (out-of-bundle in build/assets/)
               test: /\.(gif|jpe?g|png|ttf|woff2?|svg|eot|otf)(\?.*)?$/,
               loader: 'file-loader',
               options: {
                  name: env.production ? 'assets/[name]-[sha1:hash:8].[ext]' : 'assets/[name].[ext]'
               }
            },
            {  // ... after optimizing graphics with the image-loader ...
               test: /\.(gif|jpe?g|png|svg)$/,
               loader: 'img-loader?progressive=true'
            },
            {  // ... and resolving CSS url()s with the css loader
               // (extract-loader extracts the CSS string from the JS module returned by the css-loader)
               test: /\.(css|s[ac]ss)$/,
               loader: env.production ?
                  ExtractTextPlugin.extract( { fallback: 'style-loader', use: 'css-loader' } ) :
                  'style-loader!css-loader'
            },
            {  // load scss files by precompiling with the sass-loader
               test: /\/mdlite.theme\/.*\.s[ac]ss$/,
               loader: 'sass-loader',
               options: {
                  includePaths: [
                     path.resolve( __dirname, './application/themes/mdlite.theme/scss' )
                  ]
               }
            }
         ]
      }
   };

};
