// vue.config.js
module.exports = {
  // 开发环境用 '/'，生产（打包给 GitHub Pages）用仓库子路径
  publicPath: process.env.NODE_ENV === 'production'
    ? '/Awesome-Trustworthy-Embodied-AI/'
    : '/',

  chainWebpack: (c) => {
    // 你原有的配置保留
    c.module
      .rule('csv')
      .test(/\.csv$/)
      .use('csv-loader')
      .loader('csv-loader')
      .options({ dynamicTyping: true, header: true, skipEmptyLines: true });

    c.plugin('html').tap((args) => {
      args[0].title = 'Trustworthy-Embodied-AI';
      return args;
    });
  },
};
