import apiRequest from './apiRequest';

class AdminApi {
    static getMembers() {
        return apiRequest('allusers');
    }

    static postToggleActive(userId, active) {
        const payload = {
            userId: userId,
            active: active
        };
        return apiRequest('toggle_active', 'POST', payload);
    }

    static deleteMember(userId) {
        const payload = {userId: userId};
        return apiRequest('delete_member', 'DELETE', payload);
    }

    static updateMember(userData) {
        return apiRequest('update_member', 'PUT', userData);
    }

    static checkVippsTransactonId(transactionId, userId) {
        const url = 'check_vipps_transaction_id/' + transactionId + '?user_id=' + userId;
        return apiRequest(url);
    }

    static getEmailList(isNewsletter = false) {
        const url = !isNewsletter ? 'get_email' : 'get_newsletter_email';
        return apiRequest(url);
    }

    static updateTermsOfService(newTermsOfService) {
        const payload = {
            termsOfService: newTermsOfService
        };
        return apiRequest('update_terms_of_service', 'PUT', payload);
    }

    static bulkActivate(csvFile) {
        const headers = {
            'Accept': 'application/csv',
            'Content-Type': 'application/csv',
            'X-CSRF-Token': sessionStorage.getItem('token')
        };
        return apiRequest('csv_activate', 'POST', csvFile, headers);
    }

    static checkAmountOfUsersToActivate(csvFile) {
        const headers = {
            'Accept': 'application/csv',
            'Content-Type': 'application/csv',
            'X-CSRF-Token': sessionStorage.getItem('token')
        };
        return apiRequest('check_vipps_rows', 'POST', csvFile, headers);
    }

    static resendVerificationEmail(studentEmail) {
        const url = 'send_new_email_verification_code';
        const payload = {
            studentEmail: studentEmail
        };
        return apiRequest(url, 'POST', payload);
    }
}

export default AdminApi;