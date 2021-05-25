import { START_CALLING } from "../../constants/types";

const INTIAL_STATE = {
  data: [],
  receivingCall: false,
};

export default (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case START_CALLING:
      return { ...state, receivingCall: true };
    // case SELECTED_CONVERSATION:
    //   return { ...state, currentConverSation: action.payload };
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
