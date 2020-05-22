const logError = e => {
    if (/object/.test(typeof e))
        console.log('%cError', 'background-color:#f00;color:#fff', JSON.stringify(e));
    else
        console.log('%cError', 'background-color:#f00;color:#fff', e);
}

const extend = (subClass, superClass) => {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass._proto_ = superClass;
}

const CustomErrors = (error => {
    extend(CustomErrors, error);
    function CustomErrors() {
        let _this;
        _this = error.call(this, arguments[0]) || this;
        _this.name = this.constructor.name;
        return _this;
    }
    return CustomErrors;
})(Error);

const dbErrorHandler = error => {
    logError(error);
    const {status} = error;
    switch (status) {
        case 400:
            throw new CustomErrors('Invalid input while fetching the data from db');
        case 401:
            throw new CustomErrors('Unauthorized request to fetch the data from db');
        case 404:
            throw new CustomErrors('Record not found in db');
        case 422:
            throw new CustomErrors('Incorrect syntax while fetching the data from db');
        case 429:
            throw new CustomErrors('The DB request exceeds the threshold....Please try again');
        case 500:
            throw new CustomErrors('The server encounters an unexpected condition...Please try again');
        case 502:
            throw new CustomErrors('The server cannot process the request due to request overload...Please try after some times');
        default:
            throw new CustomErrors('Failed to get the db data');
    }
}

const getHook = () =>  proxy.db.get('hook_url')
                            .catch(dbErrorHandler)

const showErrorMessage = e => proxy.interface.trigger('showNotify', {
        title: 'Nexmo',
        type: 'danger',
        message:e.message
    })

const copyToClipboard = function() {
    this.classList.add('open');
    const webhookURL = document.getElementById('webhook_url').value;
    const copiedURL = document.createElement('input');
    copiedURL.value = webhookURL;
    document.body.appendChild(copiedURL);
    copiedURL.select();
    document.execCommand('copy');
    document.body.removeChild(copiedURL);
    setTimeout(()=>this.classList.remove('open'),3000);
}

const showHookURL = ({url}) => {
    $('.webhooks').html(`<div class="webhook-settings">
                            <div id="webhook_div">
                                <div class="form">
                                    <label><strong></strong>Webhook URL</strong>
                                    </label>
                                    <div class="control-group control-table">
                                        <input type="text" id="webhook_url" value="${url}" readonly>
                                        <button id="copy_btn" class="btn btn-info input-group-addon" tooltip="Copied!">Copy</button>
                                    </div>
                                    <p class="help-block">Copy and paste the webhook URL in your Nexmo account.</p>
                                </div>
                            </div>
                        </div>`);
    $('#copy_btn').on('click',copyToClipboard);
}

const hideLoader = () => $('#loader').hide()

const getWebhookURL = function(){
    $('#loader').show();
    getHook()
       .then(showHookURL)
       .catch(showErrorMessage)
       .finally(hideLoader)
}

const onAppActivated = () => {
    $('.webhooks').html(`<div class="webhook-sections"><button class="btn btn-primary" id="get-hook-url">Get Webhook URL</button></div>`);
    $('#get-hook-url').on('click', getWebhookURL);
}

const initializedHandler = _client => {
    window.proxy = _client;
    proxy.events.on('app.activated', onAppActivated);
}

const docReadyFn = () => {
    app.initialized()
        .then(initializedHandler)
        .catch(logError)
}

document.addEventListener('DOMContentLoaded',docReadyFn);
