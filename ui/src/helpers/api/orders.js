import axios from 'axios'

const endpoint = 'http://localhost:3000'

export const createOrder = (variety, params) => {
    let payload = { variety, params }
    let request = axios.post(`${endpoint}/orders/create-order`, payload)
    return request
}

export const exitOrder = (variety, order_id) => {
    let payload = { variety, order_id }
    let request = axios.post(`${endpoint}/orders/exit-order`, payload)
    return request
}

export const createExitTrigger = (variety, order_id, tradingsymbol, transaction_type, trigger_price) => {
    let payload = { variety, order_id, tradingsymbol, transaction_type, trigger_price }
    let request = axios.post(`${endpoint}/orders/create-exit-trigger`, payload)
    return request
}

export const createOrderTrigger = (variety, params, transaction_type, trigger_price) => {
    let payload = { variety, params, transaction_type, trigger_price }
    let request = axios.post(`${endpoint}/orders/create-exit-trigger`, payload)
    return request
}

export const modifyOrder = () => {
    
}