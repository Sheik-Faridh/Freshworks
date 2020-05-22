class Utils{
    /**
     * this class used to enhance the productivity of the developers to handle the apis of the freshwork products
     * data storage and request api
     */
    constructor() {
        this.encodedAPIkey = 'Basic <%= encode(iparam.api_key) %>';
    }

    /**
     * Make the request like get or delete to the freshworks product
     * @param {string} apiUrl
     * @param {string} method
     */
    getResponse(apiUrl, method) {
        return $request[method](apiUrl, {
            headers: {
                Authorization: this.encodedAPIkey
            },
            json: true
        });
    }

    /**
     * Make the request like post or put to the freshworks product
     * @param {string} apiUrl
     * @param {JSON} body
     * @param {string} content_type
     * @param {string} method
     */
    postResponse(apiUrl, body, content_type, method) {
        return $request[method](
            apiUrl,
            this.defineContentType(content_type, body)
        );
    }

    /**
     * get the data in db if exist otherwise create records in db and return it
     * @param {string} key
     * @param {JSON} body
     */
    async getDB(key, body) {
        try {
            return await $db.get(key);
        } catch (e) {
            if (e.message === 'Record not found') return this.setDB(key, body);
            else throw e;
        }
    }

    /**
     * create records in db
     * @param {string} key
     * @param {JSON} body
     */
    async setDB(key, body) {
        try {
            await $db.set(key, body);
            return this.getDB(key);
        } catch (e) {
            throw e;
        }
    }

    /**
     * delete the records in db
     * @param {string} key
     */
    static deleteDB(key) {
        return $db.delete(key);
    }

    /**
     * to define the content type of the post or put request
     * @param {string} content_type
     */
    defineContentType(content_type, body) {
        const authenticationData = {
            headers: {
                Authorization: this.encodedAPIkey
            },
            body
        };
        switch (content_type) {
            case 'application/json':
                authenticationData.json = true;
                return authenticationData;
            case 'multipart/form-data':
                authenticationData.headers['Content-Type'] = 'multipart/form-data';
                return authenticationData;

            default:
                return { body };
        }
    }
}

exports = Utils;