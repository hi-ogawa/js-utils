import { ClientComponent } from "./_client";

export default async function Page() {
  return (
    <div>
      <h4>Hello Server Component</h4>
      {0 && <ClientComponent />}
    </div>
  );
}
