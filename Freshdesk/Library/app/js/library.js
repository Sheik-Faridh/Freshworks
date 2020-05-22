const FD = (() => {

    function FD() {
        console.log('Freshworks Library Method Initiaited')
    }

    const _proto_ = FD.prototype;

    _proto_.requestAPI = function requestAPI({method,url,body}) {
        const URL = `https://<%= iparam.subdomain %>.freshdesk.com/${url}`,
            headers = {
                Authorization: 'Basic <%= encode(iparam.apiKey) %>'
            },
            options = !/get|delete/.test(method) && body ? {
            headers,
            body,
            json: true
        } : {
            headers
        };
        return proxy.request[method](URL, options)
            .catch(this.RequestHandleError)
    };

    _proto_.SMI = function invokeAPI(fnName,options){
        return proxy.request.invoke(fnName,options);
    };

    _proto_.customIparamAPI = function customIparamAPI(key) {
        return proxy.iparams.get(key)
            .catch(e => {
                logError(e);
                throw new CustomErrors('Failed to get the custom installation parameters');
            })
    };

    _proto_.DataStoreAPI = function DataStoreAPI(options) {
        const {
            method,
            key
        } = options;
        if (/get|delete/.test(method))
            return proxy.db[method](key).catch(this.DBHandleErrors);
        else if (/set/.test(method))
            return proxy.db[method](key, options.value).catch(this.DBHandleErrors);
        else if (/update/.test(method))
            return proxy.db[method](key, options.action, options.value).catch(this.DBHandleErrors);
        else
            return Promise.reject(CustomErrors('Unsupported method in database'));
    };

    _proto_.DataAPI = function DataAPI(key) {
        if (key)
            return proxy.data.get(key)
                        .catch(e=>{
                            logError(e);
                            throw new CustomErrors(`Failed to get the ${key} data`);
                        })
        else
            return Promise.reject(CustomErrors('Data API doesn\'t support empty values'));
    };

    _proto_.EventAPI = function EventAPI(event_name, eventListeners) {
        if (event_name && /function/i.test(typeof (eventListeners)))
            return proxy.events.on(event_name, eventListeners);
        else
            return Promise.reject(CustomErrors('Events cannot be registered for unsupported types'));
    };

    _proto_.InterfaceAPI = function InterfaceAPI(user_interface_action, data) {
        if (user_interface_action && Object.keys(data).length && /object/i.test(data.constructor))
            return proxy.interface.trigger(user_interface_action, data);
        else
            return Promise.reject(CustomErrors('Unsupported user interface action'));
    };

    _proto_.InstanceAPI = {
        resize: function ({height}) {
            return proxy.instance.resize({height});
        },
        context: function () {
            return proxy.instance.context();
        },
        get: function () {
            return proxy.instance.get();
        },
        send: function (data) {
            return proxy.instance.send(data);
        },
        receive: function (receiveDataFromOneInstance) {
            return proxy.instance.receive(receiveDataFromOneInstance);
        },
        close: function () {
            return proxy.instance.close();
        }
    };

    _proto_.RequestHandleError = function RequestHandleError(e) {
        logError(e);
        const {status} = e;
        const errorMessage = {
            400: 'Request body has invalid json format in Fresdesk',
            401: 'Invalid API Key. Please try with valid credentials',
            403: 'The API Key doesn\'t have the permission to access the requested resource',
            429: 'Request exceeds the thresholds. Please try after sometime',
            500: 'Freshdesk Internal Server error. Please try again',
            502: 'Network error. Please try again',
            503: 'Freshdesk Service is temporarily unavailable. Please try after sometime',
            504: 'Timeout error while processing the request in Freshdesk. Please try again'
        }
        const message = errorMessage[status] || 'Something went wrong. Please try again';
        throw new CustomErrors(message);
    }

    _proto_.DBHandleErrors = function DBHandleErrors(e) {
        logError(e);
        const {status} = e;
        const errorMessage = {
            400: 'Invalid input while fetching the data from db',
            401: 'You don\'t have the access to the db data',
            404: 'Record not found',
            422: 'Incorrect syntax while fetching the data from db',
            429: 'The DB request exceeds the threshold. Please try again',
            500: 'The server encounters an unexpected condition. Please try again',
            502: 'The server cannot process the request due to request overload. Please try after sometime'
        }
        const message = errorMessage[status] || 'Something went wrong. Please try again';
        throw new CustomErrors(message);
    }

    return _proto_;
})();

const extend = (subClass, superClass) => {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass._proto_ = superClass;
}

const CustomErrors = (() => {
    extend(CustomErrors, Error);
    function CustomErrors() {
        let _this;
        _this = Error.call(this, arguments[0]) || this;
        _this.name = this.constructor.name;
        return _this;
    }
    return CustomErrors;
})();
