// @ts-ignore
import { gql } from '@apollo/client';

const GET_CONVERSATIONS = gql`
    query getManyConversation($userId: String!) {
        getManyConversation(userId: $userId) {
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

const NEW_MESSAGE = gql`
    mutation newMessage($messageInput: MessageInput!) {
        newMessage(messageInput: $messageInput) {
            _id
            message
            createdAt
        }
    }
`

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
`

const GET_PHOTOS = gql`
    query getPhotos($messageQuery: MessageQuery!) {
        getPhotos(messageQuery: $messageQuery) {
            _id
            files{
                key
                url
                name
            }
        }
    }
`

const GET_PROFILE = gql`
    query getProfile {
        getProfile {
            _id
            username
            fullname
            email
        }
    }
`

const GET_USER_LIST = gql`
    query getUsers {
        getUsers {
            _id
            username
            fullname
            email
        }
    }
`
export {GET_CONVERSATIONS, FIND_ALL_MESSAGE, MESSAGES_SUBSCRIPTION, NEW_MESSAGE, UPLOAD_FILE, GET_PHOTOS, GET_PROFILE, GET_USER_LIST}
