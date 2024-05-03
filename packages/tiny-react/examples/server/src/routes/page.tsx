import { ClientComponent, InterleaveComponent } from "./_client";

export default async function Page() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return (
    <div>
      <h4>Hello Server Component</h4>
      <pre>server time: {new Date().toISOString()}</pre>
      <pre>typeof window: {typeof window}</pre>
      <ClientComponent />
      <InterleaveComponent
        serverNode={
          // @ts-expect-error
          <ServerNode />
        }
      />
    </div>
  );
}

async function ServerNode() {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return <span>Hi Server</span>;
}
