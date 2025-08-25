// vue.config.js
module.exports = {
  chainWebpack: c => {
    c.module.rule('csv').test(/\.csv$/)
      .use('csv-loader').loader('csv-loader')
      .options({ dynamicTyping: true, header: true, skipEmptyLines: true });
  },
  publicPath: '/',   // 关键：根路径
};
