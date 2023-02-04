# products

- webpack-dev-server - spins up server to serve html files (webpack serve)
- specify in webpack.config.js port to use

```json
// package.json
"dependencies": {
    "faker": "^5.1.0",
    "html-webpack-plugin": "5.5.0",
    "nodemon": "^2.0.15",
    "webpack": "5.68.0",
    "webpack-cli": "4.10.0",
    "webpack-dev-server": "4.7.4"
  }
```

```json
// webpack.config.js
  devServer: {
    port: 8081,
  },
```

## "html-webpack-plugin"

- we use this plugin to specify the html file/template to use
- when you configure webpack.config.js, you specify the template of where to inject/put the compiled webpack js

```js
// webpack.config.js
new HtmlWebpackPlugin({
      template: './public/index.html',
    }),

```

## module federation plugin

1. designate one app as the HOST (CONTAINER) - it makes use of code from another project
2. and one as the Remote (PRODUCTS) - project making code available to other projects

<!-- REMOTE :8081 - products -->

- in the Remote, decide which modules (files) you want to make available to other projects

3. in the Remote, Set up "Module Federation plugin" to expose those files
   note: filename: 'remoteEntry.js', remoteEntry is a file that contains a list of files that are available + tells webpack how to load them.
   note: name: will be used by Host (CONTAINER)
   note: the other files given to us by ModuleFederationPlugin (src_index.js , faker.js) is browser load-in safe (ie. it also includes required dependencies to run independently)

```js
//products/webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  mode: 'development',
  devServer: {
    port: 8081,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: { './ProductsIndex': './src/index' },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

<!------------------------------------------------------------------------------------------------ -->
<!-- HOST :8080  - Container -->

4. in the host, decide which files you want to get from the remote
5. set up module federation plugin to fetch those files
   note: 'products@http://localhost:8081/remoteEntry.js' : the port number is the port of remote.

- in the host, name is not necessary as it is required by the remote (included by convention)

6. in the host, refactor the entry point:

- rename index.js to bootstrap.js
- create a new file index.js `import('./bootstrap');`
- this gives webpack opportunity/realize it (Host) has to fetch some code to from another project (products)

```js
// bootstrap.js
console.log('container');
import 'products/ProductsIndex';
import 'cart/CartShow';
```

7. in the host, import whatever files you need from the remote

- in host, src/bootstrap.js: `import 'products/ProductsIndex';`

  - "products" from above refers to name of module, if it is not found in node_modules, it will look inside module federation plugin and under remote: try find a key called "products"
    `remotes:{products: 'products@'}`
  - 'Products/ProductsIndex' is what the REMOTE exposes eg. in REMOTE: exposes: { './ProductsIndex': './src/index' },

- webpack.config.js
  'products@http://localhost:8081/remoteEntry.js' - "products" must match REMOTE: ModuleFederationPlugin "name"

```js
//container/webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  mode: 'development',
  devServer: {
    port: 8080,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      remotes: {
        products: 'products@http://localhost:8081/remoteEntry.js',
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

<!------------------------------------------------------------------------------------------------ -->

# Container

- to get Container up and running, "Cart" project and "Products" need to both be running
- after adjustments for async import using import() syntax, you can run server on
  : localhost:8000, localhost:8001, localhost:8002
- it takes into account: shared: ['faker'] which shares the library

## but what if there is version conflicts?

(lesson 24)

- if the projects use different versions of library, different copies will be loaded.
- ^ - major versions will be compatible and shared

## 25. singleton loading

- a library (eg. react) can only have a single version - warning message is printed to console.
- make the change in all projects that use the shared library

```js
// webpack.config.js
shared: {
  faker: {
    singleton: true;
  }
}
```

## process.env.NODE_ENV

- how does process.env.NODE_ENV know whether we are in development or production?
  - we set this in webpack.config.js

```js
//webpack.config.js
module.exports = {
  mode: 'development',
  // devServer: {
  //   port: 8081,
  // },
  // plugin:[etc...]
};
```
