class Request{
    constructor(){
        this.url = `https://<%= iparam.sub_domain %>.freshdesk.com`;
        this.options = this.constructor.getAuth();
    }

    static getAuth(){
        return {
            headers:{
                Authorization:'Basic <%= encode(iparam.freshdesk_apikey) %>'
            }
        }
    }

    getordelete(url,method) {
        return $request[method](`${this.url}/${url}`,this.options);
    }

    postorupdate (url,body,method) {
        this.options.body = body;
        this.options.json = true;
        return $request[method](`${this.url}/${url}`,this.options);
    }
}

class DB{
    static get(name) {
        return $db.get(name);
    }

    static set(name,body) {
        return $db.set(name,body);
    }

    static update(name,action,body) {
        return $db.update(name,action,body);
    }

    static delete(name) {
        return $db.delete(name);
    }
}

exports = {
    Request: new Request(),
    DB
}