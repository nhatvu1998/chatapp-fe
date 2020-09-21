// @ts-ignore
import { gql } from '@apollo/client';

const LOGIN = gql`
    mutation login($userData: LoginInput!) {
        login(userData: $userData) {
            token
        }
    }
`;

export {LOGIN}
