// @ts-ignore
import { gql } from '@apollo/client';

const REGISTER = gql`
    mutation register($userData: RegisterInput!) {
        register(userData: $userData) {
            username
        }
    }
`;

export {REGISTER}
