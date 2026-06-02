import http from '../01_axios'
import {
  apiGetNews,
  apiCreateNews,
  apiGetNewsById,
  apiUpdateNews,
  apiDeleteNews,
} from './urls'

const getNews = (params) => http.get(apiGetNews, { params })
const createNews = (body) => http.post(apiCreateNews, body)
const getNewsById = (id) => http.get(apiGetNewsById(id))
const updateNews = (id, body) => http.put(apiUpdateNews(id), body)
const deleteNews = (id) => http.delete(apiDeleteNews(id))

const NewsService = {
  getNews,
  createNews,
  getNewsById,
  updateNews,
  deleteNews,
}

export default NewsService
