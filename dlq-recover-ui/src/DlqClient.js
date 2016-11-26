import axios from "axios";

//const path = 'http://localhost:10109';
const path = '';

class DlqClient {

    fetch() {
        return axios.get(path + '/dlqs').then(x => x.data);
    }


    delete(uuid) {
        return axios.delete(path + '/dlqs/' + uuid);
    }

    redeliver(uuid) {
        return axios.post(path + '/redeliver', {
            uuid: uuid
        });
    }
}

export default new DlqClient();