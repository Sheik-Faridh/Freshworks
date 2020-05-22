class Nexmo{
    static getAuth(){
        return {
            Authorization:'Bearer <%= iparam.nexmo_jwttoken %>',
            Accept:'application/json'
        }
    }

    static sendMessage(body){
        const api_url = `https://sandbox.nexmodemo.com/v0.1/messages/`;
        const headers = Nexmo.getAuth();
        const options = {
            headers,
            body,
            json:true
        }
        return $request.post(api_url,options);
    }
}

exports = Nexmo
