export function InnerOther(props: { value: number }) {
  const add = 100;
  return (
    <pre>
      InnerOther: counter + {add} = {props.value + add}
    </pre>
  );
}
