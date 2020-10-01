import { ApolloClient, InMemoryCache, ApolloLink, split, concat, HttpLink } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { getMainDefinition } from '@apollo/client/utilities';
import {createUploadLink} from 'apollo-upload-client';
// const domain = window.location.host
// const endPoint = `${process.env.END_POINT}`

// const urn = process.env.REACT_APP_GRAPHQL_URN || `${domain}/${endPoint}`
const urn = `${window.location.hostname}:4000/graphql`;

const httpLink = new HttpLink({
  uri: `${window.location.protocol}//${urn}`
})

const uploadlink = createUploadLink({
  uri: `${window.location.protocol}//${urn}`,
})

const wsClient = new SubscriptionClient(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${urn}`,{
  reconnect: true,
  connectionParams: {
    'access-token': window.localStorage.getItem('token') ? `${window.localStorage.getItem('token')}` : ``
  }
})
const wsLink = new WebSocketLink(wsClient)
const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'Authorization': window.localStorage.getItem('token') ? `${window.localStorage.getItem('token')}` : ``
    }
  }))
  return forward(operation)
})
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  }, wsLink, uploadlink
)
const Client = new ApolloClient({
  link: concat(authLink, link),
  cache: new InMemoryCache({
    addTypename: false,
  }),
})

export { Client }
