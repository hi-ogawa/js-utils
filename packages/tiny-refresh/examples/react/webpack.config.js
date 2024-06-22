import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default () => {
  /**
   * @type {import("webpack").Configuration}
   */
  const config = {
    mode: "development",
    devtool: "source-map",
    entry: "./src/index.tsx",
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.webpack.html",
      }),
    ],
    output: {
      filename: "[name].js",
      path: path.resolve("./dist"),
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", "..."],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx$/,
          use: "@hiogawa/tiny-refresh/webpack",
        },
        {
          test: /\.(ts|tsx|jsx)$/,
          use: {
            loader: "esbuild-loader",
            options: {
              target: "es2022",
            },
          },
        },
      ],
    },
  };

  return config;
};
