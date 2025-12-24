import axios from 'axios';

const ACT_ORGANIZATION_RETRIEVAL_FOR_DROPDOWN_URL ='http://localhost:8000/app/v1/commons/getActiveOrganizations';

class CommonDataExtraction {
    getActiveOrganizationsForDropdown() {
        return axios.get(ACT_ORGANIZATION_RETRIEVAL_FOR_DROPDOWN_URL);
    }
}

export default new CommonDataExtraction();