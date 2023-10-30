const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');


module.exports = {
    module: {
      rules: [
        { test: /\.(d\.ts)$/, loader: 'raw-loader' },
        {
          test: /\.ttf$/,
          use: ['file-loader']
        }
      ]
    },
    "resolve": {
      "alias": {
        'vscode': require.resolve('monaco-languageclient/vscode-compatibility')
      },
      "fallback":{
        "path":false
      }
    },
    plugins: [new MonacoWebpackPlugin({
      languages:["typescript","javascript","markdown","html","css","python","yaml"],
      customLanguages: [
        {
          label: 'yaml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker',
          },
        },
      ]
    })] 
  };