import {
  GET_CONVERSATION_LIST,
  SELECTED_CONVERSATION,
} from "../../../constants/types";

const INTIAL_STATE = {
  data: null,
  currentConversation: null,
};

export default (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case GET_CONVERSATION_LIST:
      return { ...state, data: action.payload };
    case SELECTED_CONVERSATION:
      return { ...state, currentConversation: action.payload };
    // // case GET_USER:
    // //     return { ...state, profile: action.payload };
    // // case EDIT_PROFILE:
    // //     return { ...state, profile: action.payload};
    // // case GET_USER_ONLINE:
    // //     return { ...state, totalOnline: action.payload}
    default:
      return state;
  }
};
