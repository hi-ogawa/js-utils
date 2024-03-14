let counter = 0;

export const rpc = {
  getCounter: async () => counter,
  incrementCounter: async (delta: number) => {
    counter += delta;
    return counter;
  }
};
