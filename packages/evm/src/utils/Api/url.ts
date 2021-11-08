//const BASE_URL_SEARCH_SERVICE = process.env.REACT_APP_SEARCH_SERVICE_URL;
const BASE_URL_SEARCH_SERVICE = 'http://10.227.141.128:8085';

//const BASE_URL_AUTHENTICATION_SERVICE = process.env.REACT_APP_AUTHENTICATION_SERVICE_URL;
const BASE_URL_AUTHENTICATION_SERVICE = 'http://127.0.0.1:8081'
const BASE_URL_USER_SERVICE = process.env.REACT_APP_USER_SERVICE_URL;

export const EVIDENCE_PREDITIVE_URL = `${BASE_URL_SEARCH_SERVICE}/Evidence/predictive`

export const EVIDENCE_GET_URL = `${BASE_URL_SEARCH_SERVICE}/Evidence?Size=500&Page=1`

export const EVIDENCE_SEARCH_VERSION_URL = `${BASE_URL_SEARCH_SERVICE}/Evidence/Version`

export const AUTHENTICATION_NewAccessToken_URL = `http://127.0.0.1:8081/Authentication/GetAccessToken`

export const AUTHENTICATION_LOGIN_URL = `${BASE_URL_AUTHENTICATION_SERVICE}/Authentication/Login/`

export const AUTHENTICATION_CODEVERIFIER_URL = `${BASE_URL_AUTHENTICATION_SERVICE}/Authentication/CodeVerifier`

export const GROUP_GET_URL = `${BASE_URL_USER_SERVICE}/groups?Page=1&Size=100`

export const GROUP_USER_COUNT_GET_URL = `${BASE_URL_USER_SERVICE}/groups/0/users/count?Page=1&Size=100`

export const USER_INFO_GET_URL = `${BASE_URL_USER_SERVICE}/Users/GetAllUsersInfo?Page=1&Size=100`
