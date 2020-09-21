import { combineReducers } from "redux";
import loginReducer from "../pages/login/login.reducer";
import conversationReducer from "../pages/home/sidebar/conversations.reducer";
import messageReducer from "../pages/home/content/message.reducer";
import callingReducer from '../pages/calling/calling.reducer';

import { SIGN_OUT } from "../constants/types";

const appReducer = combineReducers({
  auth: loginReducer,
  conversation: conversationReducer,
  message: messageReducer,
  calling: callingReducer,
});

const rootReducer = (state, action) => {
  if (action.type === SIGN_OUT) state = undefined;
  return appReducer(state, action);
};

export default rootReducer;
