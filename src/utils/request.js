import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url

  timeout: 5000 // request timeout
})


service.interceptors.request.use(
  config => {

    console.log(store.getters, 1242342534)
    if (store.getters.token) {

      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {

    console.log(error)
    return Promise.reject(error)
  }
)


service.interceptors.response.use(

  response => {
    const res = response.data

    console.log(res, 1234243);
    if (res.code !== 0) {
      Message({
        message: res.msg || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      // Token失效场景
      if (res.code === -2) {

        MessageBox.confirm('Token失效，请重新登录', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    } else {
      return res
    }
  },
  error => {

    // let message = error.message || "请求失败"
    // if (error.response && error.response.data) {
    //   const { data } = err.response
    //   message = data.msg
    // }
    const { msg } = error.response.data
    console.log(msg, '22243')
    Message({
      message: msg || "请求失败",
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
