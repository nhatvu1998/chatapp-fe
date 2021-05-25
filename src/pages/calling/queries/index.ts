// @ts-ignore
import { gql } from "@apollo/client";

const START_CALL = gql`
  mutation startCall($data: JSON!, $userId: String!, $peerId: String!) {
    startCall(data: $data, userId: $userId, peerId: $peerId)
  }
`;

const START_CALL_USER = gql`
  subscription startCallUser {
    startCallUser {
      type
      sdp
    }
  }
`;

const ACCEPT_CALL = gql`
  mutation acceptCall($data: JSON!) {
    acceptCall(data: $data)
  }
`;

const ACCEPT_CALL_USER = gql`
  subscription acceptCallUser {
    acceptCallUser {
      renegotiate
      type
      sdp
    }
  }
`;

export { START_CALL, START_CALL_USER, ACCEPT_CALL, ACCEPT_CALL_USER };
