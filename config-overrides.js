const {override, fixBabelImports, addLessLoader} = require('customize-cra');
const lessVars = require('./less-vars.config');

module.exports = override(
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: lessVars,
    }),
);