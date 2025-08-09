import axios from 'axios';
import constants from '../../constants';

const { baseURL, clientURL } = constants.config;

export const checkAuthStatus = async () => {
    try {
        const response = await axios.get(`${baseURL}${constants.routes.auth.checkStatus}`);
        const { isLoggedIn, login_url } = response.data;
        
        return {
            isLoggedIn,
            login_url: !isLoggedIn ? login_url : undefined
        };
    } catch (error) {
        console.error('Error checking auth status:', error);
        return { serviceUnavailable: true };
    }
};

export const handleLogout = async () => {
    try {
        const response = await axios.get(`${baseURL}${constants.routes.auth.checkStatus}`);
        const { isLoggedIn, login_url } = response.data;
        
        sessionStorage.setItem('isLoggedIn', isLoggedIn);
        sessionStorage.removeItem('allowOfflineAccess');
        
        return {
            isLoggedIn,
            login_url: !isLoggedIn ? login_url : undefined,
            allowOfflineAccess: false
        };
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};

export const setLoginInfo = async () => {
    try {
        const response = await axios.get(`${baseURL}/auth/set-login-info?url=${clientURL}`);
        return response.data;
    } catch (error) {
        console.error('Error setting login info:', error);
        throw error;
    }
};
