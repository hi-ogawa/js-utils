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
        template: "index.html",
      }),
    ],
    output: {
      filename: "[name].js",
      path: path.resolve("./dist"),
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", "..."],
    },
    module: {
      rules: [
        {
          test: /\.tsx$/,
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
