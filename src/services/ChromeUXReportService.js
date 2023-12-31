import axios from 'axios'
const API_URL = 'https://chrome-ux-report.onrender.com'

export const getPageDefaults = () => {
    return axios.get(API_URL + '/get-defaults')
}

export const getPageUXReport = async (origins = []) => {
    return axios.post(API_URL + '/get-ux-report', origins)
}