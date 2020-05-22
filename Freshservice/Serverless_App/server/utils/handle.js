

const utils = require('./common');

class Handle {

    /**
     * handle the paginations in the api of the freshwork products
     * @param {string} api_url 
     * @param {string} key 
     */
    static async handlePagination(api_url, key) {
        try {
            let keepGoing = true,
                page = 1,
                data = new Array(),
                url, api_res, res_data;
            const common = new utils();
            while (keepGoing) {
                url = `${api_url}?per_page=100&page=${page}`;
                api_res = await common.getResponse(url, 'get');
                res_data = typeof api_res.response === 'string' ? JSON.parse(api_res.response) : api_res.response;
                data.push(...res_data[key]);
                if (api_res.headers.link) page += 1;
                else {
                    keepGoing = false;
                    return data;
                }
            }
        } catch (e) {
            throw e;
        }
    }
}

exports = Handle;