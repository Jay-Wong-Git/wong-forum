import axios from "axios";
import {ElMessage} from "element-plus";

const authItemName = "authorize"

const accessHeader = () => {
  return {
    'Authorization': `Bearer ${takeAccessToken()}`
  }
}

const defaultError = (error) => {
  console.error(error)
  ElMessage.error('Some error occurred, please contact the admin!')
}

const defaultFailure = (message, status, url) => {
  console.warn(`url: ${url}, code: ${status}, message: ${message}`)
  ElMessage.warning(message)
}

function takeAccessToken() {
  const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
  if (!str) {
    return null
  }
  const authObj = JSON.parse(str)
  if (authObj.expire <= new Date()) {
    deleteAccessToken()
    ElMessage.warning("Login expired, please login again!")
    return null
  }
  return authObj.token
}

function storeAccessToken(remember, token, expire) {
  const authObj = {
    token: token,
    expire: expire
  }
  const str = JSON.stringify(authObj)
  if (remember) {
    localStorage.setItem(authItemName, str)
  } else {
    sessionStorage.setItem(authItemName, str)
  }
}

function deleteAccessToken() {
  localStorage.removeItem(authItemName)
  sessionStorage.removeItem(authItemName)
}

function internalPost(url, data, headers, success, failure, error = defaultError) {
  axios.post(url, data, {headers: headers}).then(({data}) => {
    if (data.code === 200) {
      success(data.data)
    } else {
      failure(data.message, data.code, url)
    }
  }).catch(err => error(err))
}

// function internalGet(url, headers, success, failure, error = defaultError) {
//     axios.get(url, {headers: headers}).then(({data}) => {
//         if (data.code === 200) {
//             success(data.data)
//         } else {
//             failure(data.message, data.code, url)
//         }
//     }).catch(err => error(err))
// }
async function internalGet(url, headers, success, failure, error = defaultError) {
  try {
    const {data} = await axios.get(url, {headers})
    if (data.code === 200) {
      success(data.data)
    } else {
      failure(data.message, data.code, url)
    }
  } catch (e) {
    error(e)
  }
}

function login(username, password, remember, success, failure = defaultFailure) {
  internalPost('/api/auth/login', {
    username: username,
    password: password
  }, {
    'Content-Type': 'application/x-www-form-urlencoded'
  }, (data) => {
    storeAccessToken(remember, data.token, data.expire)
    ElMessage.success(`Login Successfully, ${data.username}, welcome!`)
    success(data)
  }, failure)
}

function logout(success, failure = defaultFailure) {
  get('/api/auth/logout', () => {
    deleteAccessToken()
    ElMessage.success(`Logout Successfully!`)
    success()
  }, failure)
}

function post(url, data, success, failure = defaultFailure) {
  internalPost(url, data, accessHeader(), success, failure)
}

function get(url, success, failure = defaultFailure) {
  internalGet(url, accessHeader(), success, failure)
}

function unauthorized() {
  return !takeAccessToken()
}

export {post, get, login, logout, unauthorized, accessHeader}
