// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('csv')
      .test(/\.csv$/)
      .use('csv-loader')
      .loader('csv-loader')
      .options({ dynamicTyping: true, header: true, skipEmptyLines: true });
  },
  publicPath: '/', // ← 关键：部署在根路径
};
