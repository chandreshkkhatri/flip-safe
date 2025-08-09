import axios from 'axios'

export const createAlert = (tradingsymbol, trigger_price, trigger_type) => {
  return axios.get(`http://localhost:3000/alerts/create-alert?tradingsymbol=${tradingsymbol}&trigger_price=${trigger_price}&trigger_type=${trigger_type}`)
}

export const updateAlert = (alert_id, trigger_price) => {
  return axios.get(`http://localhost:3000/alerts/create-alert?alert_id=${alert_id}&trigger_price=${trigger_price}`)
}

export const cancelAlert = (alert_id) => {
  return axios.get(`http://localhost:3000/alerts/cancel-alert?alert_id=${alert_id}`)
}
export const getAlerts = () => {
  return axios.get(`http://localhost:3000/alerts/get-alerts`)
}