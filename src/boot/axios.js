import axios from 'axios'
axios.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer ' + localStorage.getItem('token')
  config.headers["Content-Type"] = 'application/ld+json'
  config.baseURL = import.meta.env.VITE_API_DOMEN + '/api/'

  return config
});

export {axios as client}
