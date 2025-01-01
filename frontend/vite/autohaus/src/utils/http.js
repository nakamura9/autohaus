import axios from 'axios'

const authAxiosInstance = axios.create({})

authAxiosInstance.interceptors.request.use( config =>{
    let prefix = 'Token '
    // TODO reduce requests using local storage cache and cache invalidation
    const token = localStorage.getItem('user_token')
    if(!token) 
        return config;
    config.headers.Authorization = prefix + token
    return config
})

export default authAxiosInstance