module.exports = {
  publicPath: "",
  devServer: {
    port: 10111, // 端口号
    open: false //配置自动启动浏览器
  },
  lintOnSave: false,
  productionSourceMap: false,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(frag|vert|glsl|json)$/i,
          use: "raw-loader"
        }
      ]
    }
  }
};
