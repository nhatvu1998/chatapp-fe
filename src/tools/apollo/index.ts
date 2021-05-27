import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  concat,
  HttpLink,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { createUploadLink } from "apollo-upload-client";
// const domain = window.location.host
// const endPoint = `${process.env.END_POINT}`
import io from "socket.io-client";
const urn = "localhost:3002/graphql";
// const urn = `api.magic-chat.cf/graphql`;

const token = window.localStorage.getItem("token");

const uploadlink = createUploadLink({
  uri: `${window.location.protocol}//${urn}`,
});

const wsClient = new SubscriptionClient(
  `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${urn}`,
  {
    reconnect: true,
    connectionParams: {
      "access-token": window.localStorage.getItem("token")
        ? `${window.localStorage.getItem("token")}`
        : ``,
    },
  }
);

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: window.localStorage.getItem("token")
        ? `${window.localStorage.getItem("token")}`
        : ``,
    },
  }));
  return forward(operation);
});

const Client = new ApolloClient({
  link: concat(authLink, uploadlink),
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

const socket = io.connect(`localhost:3002`, { query: { token } });
console.log(socket);

export { Client, socket };
