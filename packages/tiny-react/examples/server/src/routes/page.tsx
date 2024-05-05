import type { JSX } from "@hiogawa/tiny-react/jsx-runtime";
import { ClientComponent, ClientNode, InterleaveComponent } from "./_client";

export default async function Page() {
  await new Promise((resolve) => setTimeout(resolve));
  return (
    <div>
      <pre>server time: {new Date().toISOString()}</pre>
      <pre>typeof window: {typeof window}</pre>
      <ClientComponent />
      <InterleaveComponent
        serverNode={
          <ServerNode clientNode={<ClientNode serverNode={<ServerNode />} />} />
        }
      />
    </div>
  );
}

async function ServerNode(props: { clientNode?: JSX.Element }) {
  await new Promise((resolve) => setTimeout(resolve));
  return <span>[props.clientNode: {props.clientNode}]</span>;
}
