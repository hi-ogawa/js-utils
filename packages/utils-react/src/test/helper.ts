import reactTestRenderer from "react-test-renderer";

export function renderToJson(el: React.ReactElement) {
  return reactTestRenderer.create(el).toJSON();
}
