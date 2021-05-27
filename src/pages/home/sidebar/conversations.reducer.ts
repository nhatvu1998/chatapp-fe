import { GET_CONVERSATION_LIST, SELECTED_CONVERSATION, CREATE_NEW_CONVERSATION, SET_CURRENT_TAB } from "../../../constants/types";

const INTIAL_STATE = {
  data: [],
  currentConversation: null,
  currentTab: "message",
};

export default (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case GET_CONVERSATION_LIST:
      return { ...state, data: action.payload };
    case SELECTED_CONVERSATION:
      return { ...state, currentConversation: action.payload };
    case CREATE_NEW_CONVERSATION:
      return { ...state, data: [action.payload, ...state.data] };
    case SET_CURRENT_TAB:
        return { ...state, currentTab: action.payload };
    // // case EDIT_PROFILE:
    // //     return { ...state, profile: action.payload};
    // // case GET_USER_ONLINE:
    // //     return { ...state, totalOnline: action.payload}
    default:
      return state;
  }
};
