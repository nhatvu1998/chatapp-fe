// @ts-ignore
import { gql } from "@apollo/client";

const GET_CONVERSATIONS = gql`
    query getManyConversation($userId: String!) {
        getManyConversation(userId: $userId) {
            _id
            title
            updatedAt
            participants {
                _id
                fullname
            }
            firstMessage {
                message
                senderId
            }
            type
        }
    }
`;

const FIND_ALL_MESSAGE = gql`
  query findAllMessage($messageQuery: MessageQuery!) {
    findAllMessage(messageQuery: $messageQuery) {
      _id
      message
      senderId
      type
      files {
        key
        name
        url
      }
      createdAt
    }
  }
`;

const SEARCH_MESSAGE = gql`
  query searchMessage($messageQuery: MessageQuery!) {
    searchMessage(messageQuery: $messageQuery) {
      _id
      message
      senderId
      createdAt
    }
  }
`;

const NEW_MESSAGE = gql`
  mutation newMessage($messageInput: MessageInput!) {
    newMessage(messageInput: $messageInput) {
      _id
      message
      createdAt
    }
  }
`;

const MESSAGES_SUBSCRIPTION = gql`
  subscription messageAdded {
    messageAdded {
      _id
      createdAt
      conversationId
      senderId
      type
      message
      files {
        key
        name
        url
      }
    }
  }
`;

const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!, $fileInfo: FileInfo!) {
    uploadFile(file: $file, fileInfo: $fileInfo) {
      _id
    }
  }
`;

const GET_PHOTOS = gql`
  query getPhotos($messageQuery: MessageQuery!) {
    getPhotos(messageQuery: $messageQuery) {
      _id
      type
      files {
        key
        url
        name
      }
    }
  }
`;

const GET_PROFILE = gql`
  query getProfile {
    getProfile {
      _id
      username
      fullname
      email
      avatarFile {
        key
        url
        name
      }
    }
  }
`;

const GET_USER = gql`
  query getUser($id: String!) {
    getUser(id: $id) {
      _id
      username
      fullname
      email
      avatarFile {
        key
        url
        name
      }
    }
  }
`;

const GET_USER_LIST = gql`
  query getUsers {
    getUsers {
      _id
      username
      fullname
      email
    }
  }
`;

const REMOVE_MESSAGE = gql`
  mutation removeMessage($messageId: String!) {
    removeMessage(messageId: $messageId)
  }
`;

const CREATE_CONVERSATION = gql`
    mutation createConversation($conversationInput: ConversationInput!) {
        createConversation(conversationInput: $conversationInput) {
            _id
            title
            updatedAt
            firstMessage {
                message
                senderId
            }
        }
    }
`;


const DELETE_CONVERSATION = gql`
  mutation deleteConversation($conversationId: String!) {
    deleteConversation(conversationId: $conversationId)
  }
`;

const UPDATE_USER = gql`
  mutation updateUser($avatarFile: Upload!, $userData: UpdateUserInput!) {
    updateUser(avatarFile: $avatarFile, userData: $userData) {
      _id
    }
  }
`;

export {
  GET_CONVERSATIONS,
  FIND_ALL_MESSAGE,
  MESSAGES_SUBSCRIPTION,
  NEW_MESSAGE,
  UPLOAD_FILE,
  GET_PHOTOS,
  GET_PROFILE,
  GET_USER,
  GET_USER_LIST,
  SEARCH_MESSAGE,
  REMOVE_MESSAGE,
  CREATE_CONVERSATION,
  UPDATE_USER,
  DELETE_CONVERSATION,
};
