import { defineConfig } from 'umi';
import path from 'path';
const { ModuleFederationPlugin } = require("webpack").container;

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  dva: {
    immer: true,
    lazyLoad:true,
    skipModelValidate:true,
    disableModelsReExport: true,
    
  },
  // NOTE -  7. 这里时 umi 配置路由的地方, 声明 /preview 直接就是走向 preview/index.tsx的位置 
  // (但注意), 实际的路由有非常多的传参 , 接下来则可以看, 当点击 "预览" 这个按钮时候,会发生什么行为的操作
  routes: [
    { path: '/', component: '@/pages/index' },
    { path: '/preview', component: '@/pages/preview/index' },
  ],
  fastRefresh: {},
  dynamicImport: {},
  devServer: {
    port: 8008,
  },
  webpack5: {},
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
    utils: path.resolve(__dirname, 'src/utils/'),
    assets: path.resolve(__dirname, 'src/assets/'),
  },
//   mfsu: {},
  chainWebpack(memo) {
    memo.output.publicPath('auto');
    memo
      .plugin('mf')
      .use(ModuleFederationPlugin, [{
        name: "dooringUI",
        library: { type: 'umd', name: 'dooringUI' },
        filename: 'remoteEntry.js',
        exposes: {
          "./viewRender": './src/renderer/ViewRender',
          "./loader": './src/renderer/DynamicEngine',
          "./components": './src/ui-component/index',
        },
        shared: { react: { eager: true , requiredVersion: '17.x' }, "react-dom": { eager: true , requiredVersion: '17.x'  } }
      }])
  },
});
