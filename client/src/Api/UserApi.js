import apiRequest from './apiRequest';

class UserApi {
    static checkValidToken(token) {
        const url = 'get_valid_token/' + token;
        return apiRequest(url);
    }

    static getStudyProgrammes() {
        return apiRequest('get_all_studyprograms');
    }

    static login(username, password) {
        const payload = {
            username: username,
            password: password
        };
        return apiRequest('login', 'POST', payload);
    }

    static getTermsOfService() {
        return apiRequest('get_terms_of_service');
    }

    static registerMember(userData) {
        return apiRequest('register', 'POST', userData);
    }

    static confirmEmail(confirmationCode) {
        const url = 'confirm_email/' + confirmationCode;
        return apiRequest(url);
    }

    static checkVippsTransactonId(transactionId) {
        const url = 'check_vipps_transaction_id/' + transactionId;
        return apiRequest(url);
    }

    static checkUser(studentEmail) {
        const url = 'validate_member/' + studentEmail;
        return apiRequest(url);
    }
}

export default UserApi;