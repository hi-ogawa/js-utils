import type { JSX } from "@hiogawa/tiny-react/jsx-runtime";
import { Hydrated, Link } from "./_client";

export default function Layout(props: JSX.ElementChildrenAttribute) {
  return (
    <div>
      <h4>Hello Server Component</h4>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/test">Test</Link>
        </li>
        <li>
          <Link href="/not-found">Not found</Link>
        </li>
      </ul>
      <div>
        <input placeholder="test-input" />
        <Hydrated />
      </div>
      {props.children}
    </div>
  );
}
