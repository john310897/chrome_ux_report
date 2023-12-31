import axios from 'axios'
const API_URL = 'http://localhost:5000'

export const getPageDefaults = () => {
    return axios.get(API_URL + '/get-defaults')
}

export const getPageUXReport = async (origins = []) => {
    return axios.post(API_URL + '/get-ux-report', origins)
}