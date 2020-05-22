const {
    buildBodyForTextContent,
    buildBodyforImageContent,
    buildBodyforFileContent,
    buildBodyforAudioContent
} = require('./helper');
const Nexmo = require('./nexmo');
const {Request} = require('./FD');

const getFileName = name => name.split('.')[0]

const sendAttachmentsToEndUser = (body_text,attachments,webhook_data) => {
    const promises = [];
    if(body_text)
       promises.push(Nexmo.sendMessage(buildBodyForTextContent(body_text,webhook_data)));
    for(let attachment of attachments){
        const {content_type,attachment_url,name} = attachment;
        switch(true){
            case content_type.startsWith('image'):
               promises.push(Nexmo.sendMessage(buildBodyforImageContent(attachment_url,getFileName(name),webhook_data)));
               break;
            case content_type === 'application/pdf':
                promises.push(Nexmo.sendMessage(buildBodyforFileContent(attachment_url,getFileName(name),webhook_data)));
                break;
            case content_type === 'audio/mp3':
                promises.push(Nexmo.sendMessage(buildBodyforAudioContent(attachment_url,webhook_data)));
                break;
        }
    }
    return promises.length ? Promise.all(promises) : Promise.resolve(promises);
}

const sendConversationsToRequester = ({ticket_id,private,w,n,type,body_text,attachment_objects:attachments}) => {
     const webhook_data = {
        from:{
            type,
            number:w
        },
        to:{
            type,
            number:n
        }
    };
    const textMessage = `A ${private ? 'private':'public'} note posted to your ticket ID #${ticket_id} ${body_text ? `as:\n${body_text}` : ''}`;
    if(!attachments.length){
        const body = buildBodyForTextContent(textMessage,webhook_data);
        return Nexmo.sendMessage(body);
    }else{
        return sendAttachmentsToEndUser(textMessage,attachments,webhook_data);
    }
}

const getConversationAttachments = async (ticket_id,conversation_id) => {
    try{
        let keepGoing = true,page = 1;
        while(keepGoing){
            const api_url = `api/v2/tickets/${ticket_id}/conversations?page=${page}&per_page=100`;
            const {response:conversation_response,headers} = await Request.getordelete(api_url,'get');
            const conversations = /string/i.test(typeof conversation_response) ? JSON.parse(conversation_response) : conversation_response;
            const latest_conversations = conversations.find(conversation => conversation.id === conversation_id);
            if(latest_conversations)
                return latest_conversations.attachments;
            else if(headers.link)
                ++page;
            else
                throw new Error(`Not able to find the conversation id ${conversation_id} for the ticket id ${ticket_id}`);
        }
    }catch(e){
        throw e;
    }
}

exports = {
    sendConversationsToRequester,
    getConversationAttachments
}