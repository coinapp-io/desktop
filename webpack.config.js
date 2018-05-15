const path = require('path');

module.exports = {
    entry: './app/js/app.js',
    resolve: {
        modules: [
            "node_modules"
        ]
    },
    externals: [
        'child_process', 'fs', 'net', 'spawn-sync'
    ],
    output: {
        path: path.resolve(__dirname, 'app/js'),
        filename: 'bundle.js'
    }
};