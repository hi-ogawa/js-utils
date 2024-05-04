import type { JSX } from "@hiogawa/tiny-react/jsx-runtime";

export default function Layout(props: JSX.ElementChildrenAttribute) {
  return (
    <div>
      <h4>Hello Server Component</h4>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/test">Test</a>
        </li>
        <li>
          <a href="/not-found">Not found</a>
        </li>
      </ul>
      {props.children}
    </div>
  );
}
