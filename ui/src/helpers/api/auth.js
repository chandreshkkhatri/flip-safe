import axios from 'axios';
import constants from '../../constants'

export const checkAuthStatus = async () => {
    let state = {}
    await axios.get(`http://localhost:3000${constants.routes.auth.check_status}`)
        .then(res => {
            let isLoggedIn = res.data.isLoggedIn;
            let login_url;
            if (res.data.isLoggedIn === false) {
                login_url = res.data.login_url;
            }
            state = { isLoggedIn, login_url }
        })
        .catch(err => {
            state = { serviceUnavailable: true }
        });
    return state
};

export const handleLogout = async () => {
    let state = {};
    await axios.get(`http://localhost:3000${constants.routes.auth.check_status}`)
        .then(res => {
            let isLoggedIn = res.data.isLoggedIn;
            let login_url;
            if (res.data.isLoggedIn === false) { login_url = res.data.login_url; }
            sessionStorage.setItem('isLoggedIn', isLoggedIn)
            state = { isLoggedIn, login_url };
        })
        .catch(err => console.log(err));
    return state
};

export const setLoginInfo = async () => {
    const url = `http://localhost:3098`
    await axios.get(`http://localhost:3000/auth/set-login-info?url=${url}`)
        .then(res => console.log(res.data))
        .catch(err => console.log(err));
};
