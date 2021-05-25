import { GET_USER, SIGN_IN, SIGN_OUT } from "../../constants/types";

const INTIAL_STATE = {
  isSignedIn: window.localStorage.getItem("token") ? true : false,
  userId: null,
  profile: null,
};

export default (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case SIGN_IN:
      return { ...state, isSignedIn: true };
    case SIGN_OUT:
      return { ...state, isSignedIn: false };
    case GET_USER:
      return { ...state, profile: action.payload };
    // case EDIT_PROFILE:
    //     return { ...state, profile: action.payload};
    // case GET_USER_ONLINE:
    //     return { ...state, totalOnline: action.payload}
    default:
      return state;
  }
};
