// vue.config.js
module.exports = {
  chainWebpack: c => {
    c.module.rule('csv').test(/\.csv$/)
      .use('csv-loader').loader('csv-loader')
      .options({ dynamicTyping: true, header: true, skipEmptyLines: true });
    c.plugin('html').tap(args => {
        args[0].title = 'Trustworthy-Embodied-AI';
        return args;
      });
  },
  publicPath: '/',   // 关键：根路径
};
