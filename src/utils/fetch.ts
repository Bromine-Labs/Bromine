import { BareClient, BareWebSocket } from "@mercuryworkshop/bare-mux";

const client = new BareClient();

export const fetch = async (
  input: string | Request | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  return client.fetch(url, init);
};

export const createWebSocket = (url: string): BareWebSocket => {
  return client.createWebSocket(url);
};

export default client;
