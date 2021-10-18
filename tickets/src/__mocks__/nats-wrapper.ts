export const natsWrapper = {
  client: {
    publish: jest
    .fn()
    .mockImplementation(
      (subject: string, data: string, callback: () => void) => {
      callback()
    })
  }
};
// fake implementation of NATS for teting services