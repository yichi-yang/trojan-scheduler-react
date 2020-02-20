import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { setUserTokens } from "./actions";

// Creates the function that will be called to refresh authorization
const refreshAuthLogicCreator = store => failedRequest =>
  axios.post("api/token/refresh/").then(tokenRefreshResponse => {
    store.dispatch(setUserTokens(tokenRefreshResponse));
    failedRequest.response.config.headers["Authorization"] =
      "Bearer " + tokenRefreshResponse.access;
    return Promise.resolve();
  });

const isHandlerEnabled = (config = {}) => {
  return config.hasOwnProperty("NoJWT") && config.NoJWT ? false : true;
};

const requestInterceptorCreator = store => request => {
  let { tokens } = store.getState().user;
  if (
    isHandlerEnabled(request) &&
    request.headers["Authorization"] &&
    tokens &&
    tokens.access
  )
    request.headers["Authorization"] = `Bearer ${tokens.access}`;
  return request;
};

export default setupJwtRefresh = store => {
  createAuthRefreshInterceptor(
    axios,
    refreshAuthLogicCreator(store)
  ).interceptors.request.use(requestInterceptorCreator(store));
};
