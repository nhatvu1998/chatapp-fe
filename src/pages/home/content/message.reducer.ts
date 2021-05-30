import {
  GET_CONVERSATION_LIST,
  GET_MESSAGE_LIST,
  SELECTED_CONVERSATION,
  LOAD_MORE_MESSAGE,
} from "../../../constants/types";
import { NEW_MESSAGE } from "../queries/message";

const INTIAL_STATE = {
  data: [],
};

export default (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case GET_MESSAGE_LIST:
      return { ...state, data: action.payload };
    case LOAD_MORE_MESSAGE:
      return { ...state, data: [...action.payload, ...state.data] };
    case NEW_MESSAGE:
        return { ...state, data: [...state.data, action.payload] };
    // case EDIT_PROFILE:
    //     return { ...state, profile: action.payload};
    // // case GET_USER_ONLINE:
    // //     return { ...state, totalOnline: action.payload}
    default:
      return state;
  }
};
