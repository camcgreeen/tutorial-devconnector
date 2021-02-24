import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

// thunk middleware allows this
export const setAlert = (msg, alertType) => (dispatch) => {
  // uuid package generates random universal id
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });
};
