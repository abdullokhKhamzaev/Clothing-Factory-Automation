import axios from 'axios'
axios.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken')
  config.headers["Content-Type"] = 'application/ld+json'

  if (config.method.toUpperCase() === 'PATCH') {
    config.headers['Content-Type'] = 'application/merge-patch+json'
  }

  config.baseURL = import.meta.env.VITE_API_DOMEN + '/api/'

  return config
});

export { axios as client }
