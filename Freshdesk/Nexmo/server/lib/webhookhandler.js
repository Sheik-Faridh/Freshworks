const {Request,DB} = require('./FD');
const {newTicketTemplate,
      openTicketTemplate,
      notATicketIdTemplate,
      noTicketFoundTemplate,
      restrictTicketAccessTemplate,
      noNexmoTicketTemplate,
      ticketStatusTemplate,
      noOpenTicketTemplate,
      notANexmoTicketTemplate,
      noMatchKeywordTemplate,
      notValidCommandTemplate,
      switchConfirmationTemplate,
      noteConfirmationTemplate} = require('./templates');
const {buildBodyForTextContent} = require('./helper');
const Nexmo = require('./nexmo')
const getFirstWord = message => message.split(' ')[0];

const createNewTicket = (webhook_data,iparams) => {
    const messages = webhook_data.message.content.text.trim().split(' ');
    messages.shift();
    const subject = messages.join(' ').trim();
    const truncateSubject = subject.length > 27 ? subject.substring(0, 27) + "..." : subject;
    const body ={
        unique_external_id: webhook_data.from.number,
        subject: truncateSubject,
        description: subject,
        source: 7,
        name:webhook_data.from.number,
        phone: webhook_data.from.number,
        status:2,
        priority:1
    };
    if(iparams.tags) body.tags = iparams.tags.split(",").map(t => t.trim())
    return Request.postorupdate(`api/v2/tickets`,body,'post');
}

const sendMessageToEndUser = (message,webhook_data) => {
    const body = buildBodyForTextContent(message,webhook_data);
    return Nexmo.sendMessage(body);
}

const saveNexmoUsersInDB = (id,requester_id,webhook_data) => Promise.all([DB.set(`t:${id}`,{r:requester_id,w:webhook_data.from.number,n:webhook_data.to.number,type:webhook_data.from.type}),DB.set(`w:${webhook_data.from.number}`,{t:id,r:requester_id,n:webhook_data.to.number,type:webhook_data.from.type})])

const newKeywordHandler = async (webhook_data,iparams) => {
    try{
        const {response} = await createNewTicket(webhook_data,iparams);
        const {id,subject,requester_id} = response;
        const textMessage = newTicketTemplate(id,subject);
        await saveNexmoUsersInDB(id,requester_id,webhook_data);
        return sendMessageToEndUser(textMessage,webhook_data);
    }catch(e){
        console.error('Error on New Ticket Handler');
        throw e;
    }
}

const getRequesterInfo = async index => {
    try{
        const db_data = await DB.get(index);
        return {status:200,db_data};
    }catch(e){
        if(/404/.test(e.status)){
            console.log(e);
            return e;
        }else{
            throw e;
        }
    }
}

const getAllUserOpenTickets = async requester_id => {
    let keepGoing = true,page =1;
    const tickets = [];
    try{
        while(keepGoing){
            const api_url = `api/v2/tickets?requester_id=${requester_id}&order_by=status&order_type=asc&per_page=100&page=${page}`;
            const {response} = await Request.getordelete(api_url,'get');
            const ticket_response = /string/i.test(typeof response) ? JSON.parse(response) : response;
            if(ticket_response.length){
                const openTickets = ticket_response.filter(ticket=> ticket.status === 2);
                tickets.push(...openTickets);
                const isLastTicketOpen = ticket_response.length === 100 && ticket_response[ticket_response.length - 1].status === 2;
                if(isLastTicketOpen)
                    ++page;
                else
                    return tickets;
            }else
                return [];
        }
    }catch(e){
        throw e;
    }
}

const buildOpenTickets = tickets => tickets.reduce((message,ticket) => message += `\nTicket ID #${ticket.id}, titled as ${ticket.subject}`,'');

const openKeywordHandler = async webhook_data => {
    try{
        let textMessage = '';
        const data = await getRequesterInfo(`w:${webhook_data.from.number}`);
        const {status} = data;
        if(/404/.test(status)){
           textMessage = noNexmoTicketTemplate();
        }else{
           const {r} = data.db_data;
           const openTickets = await getAllUserOpenTickets(r);
           if(openTickets.length){
                const openTicketText  = buildOpenTickets(openTickets);
                textMessage = openTicketTemplate(openTicketText);
           }else{
               textMessage = noOpenTicketTemplate();
           }
        }
        return sendMessageToEndUser(textMessage,webhook_data);
    }catch(e){
        console.error('Error on Open Ticket Handler');
        throw e;
    }
}

const getTicket = async id => {
    try{
        const {response} = await Request.getordelete(`api/v2/tickets/${id}`,'get');
        const ticket_response = /string/i.test(typeof response) ? JSON.parse(response) : response; 
        return {status:200,ticket_response};
    }catch(e){
        if(/404/i.test(e.status))
            return e;
        else
            throw e; 
    }
}

const getTicketFields = async () => {
    try{
       const {response} =  await Request.getordelete('api/v2/ticket_fields?per_page=100','get');
       return /string/i.test(typeof response) ? JSON.parse(response) : response; 
    }catch(e){
        throw e;
    }
}

const getStatusName = async status => {
    try{
       const ticket_fields_response = await getTicketFields();
       const choices = ticket_fields_response.find(ticket_field => ticket_field.name === 'status').choices;
       return choices[status][0];
    }catch(e){
        throw e;
    }
}

const validateUserRequestedTicket = async (id,webhook_data) => {
    try{
        let textMessage = '';
        const data = await getRequesterInfo(`t:${id}`);
        const {status:recordStatus} = data;
        if(/404/i.test(recordStatus)){
            textMessage = notANexmoTicketTemplate(id);
        }else{
            const {w} = data.db_data;
            if(w === webhook_data.from.number){
                const ticket_data = await getTicket(id);
                const {status:ticketStatus} = ticket_data;
                if(/404/.test(ticketStatus)){
                    textMessage = noTicketFoundTemplate(id);
                }else{
                    const {ticket_response} = ticket_data;
                    const {subject,status} = ticket_response;
                    const status_name = await getStatusName(status);
                    textMessage = ticketStatusTemplate(id,subject,status_name);
                }
            }else{
                textMessage = restrictTicketAccessTemplate(id);
            }
        }
        return sendMessageToEndUser(textMessage,webhook_data)   
    }catch(e){
        throw e;
    }
}

const statusKeywordhandler = async webhook_data => {
    const messages = webhook_data.message.content.text.trim().split(' ');
    messages.shift();
    const ticketId = Number(messages.join(' ').trim());
    try{
        if(isNaN(ticketId)){
            const message = notATicketIdTemplate();
            return sendMessageToEndUser(message,webhook_data)
        }else{
           return validateUserRequestedTicket(ticketId,webhook_data);
        }
    }catch(e){
        console.error('Error on Ticket Status handler');
        throw e;
    }
}

const isSwitchValidCommand = wordsArray => {
    const ticketWord =  wordsArray[2].startsWith('#') && !isNaN(wordsArray[2].substring(1));
    if(/to/i.test(wordsArray[1]) && ticketWord)
        return true;
    else
        return false;
}

const switchKeywordHandler = async webhook_data => {
    try{
        const wordsSplit = webhook_data.message.content.text.split(' ');
        let textMessage = '';
        if(wordsSplit.length === 3 && isSwitchValidCommand(wordsSplit)){
            const ticketId = parseInt(wordsSplit[2].substring(1));
            const [user_data,ticket_data] = await Promise.all([getRequesterInfo(`w:${webhook_data.from.number}`),getRequesterInfo(`t:${ticketId}`)]);
            const {status:userStatus} = user_data;
            const {status:ticketStatus} = ticket_data;
            if(/404/.test(userStatus)){
                textMessage = noNexmoTicketTemplate();
            }else if(/404/.test(ticketStatus)){
                textMessage = notANexmoTicketTemplate(ticketId);
            }else if(ticket_data.db_data.w !== webhook_data.from.number){
                textMessage = restrictTicketAccessTemplate(ticketId);
            }else{
                await DB.update(`w:${webhook_data.from.number}`,'set',{t:ticketId});
                textMessage = switchConfirmationTemplate(ticketId);
            }
        }else{
            textMessage = notValidCommandTemplate();
        }
        return sendMessageToEndUser(textMessage,webhook_data);
    }catch(e){
        console.error('Error on Switch Keyword handler');
        throw e;
    }
}

const postPublicNote = (id,body_text) => {
    const api_url = `api/v2/tickets/${id}/notes`,
          body = {
            body:body_text,
            private:false,
            incoming:true
          };
    return Request.postorupdate(api_url,body,'post');
}

const replyKeywordHandler = async webhook_data => {
    try{
        let textMessage = '';
        const data = await getRequesterInfo(`w:${webhook_data.from.number}`);
        const {status} = data;
        if(/404/.test(status)){
            textMessage = noNexmoTicketTemplate()
        }else{
            const body_text = webhook_data.message.content.text.split(' ');
            body_text.shift();
            const content = body_text.join(' ').trim();
            const {t} = data.db_data;
            await postPublicNote(t,content);
            textMessage = noteConfirmationTemplate(t);
        }
        return sendMessageToEndUser(textMessage,webhook_data);
    }catch(e){
        console.error('Error on Reply Keyword Handler');
        throw e;
    }
}

const sendMessageForNoMatch = webhook_data => {
    const textMessage = noMatchKeywordTemplate();
    return sendMessageToEndUser(textMessage,webhook_data);
}

const textContentHandler = (webhook_data,iparams) => {
    const {message} = webhook_data;
    const textContent = message.content.text.trim();
    const firstWord = getFirstWord(textContent);
    switch(true){
        case /new/i.test(firstWord):
            return newKeywordHandler(webhook_data,iparams);
        case /status/i.test(firstWord):
            return statusKeywordhandler(webhook_data);
        case /open/i.test(firstWord):
            return openKeywordHandler(webhook_data);
        case /reply/i.test(firstWord):
            return replyKeywordHandler(webhook_data);
        case /switch/i.test(firstWord):
            return switchKeywordHandler(webhook_data);
        default:
            return sendMessageForNoMatch(webhook_data);
    }
}

const getBody = message => {
    const {type} = message.content;
    switch (type) {
        case 'image':
                return `<img src='${message.content.image.url}'/>`;
        case 'video':
        case 'audio':
        case 'file':
                return `<a href='${message.content.file.url}'>File Attached. Click to view/download.</a>`;
        case 'location':
                return `<a href='https://www.google.com/maps/search/?api=1&query=${message.content.location.lat},${message.content.location.long}'>Click here to view the location</a>`
    }
}

const fileContentHandler = async webhook_data => {
    try{
        let textMessage = '';
        const data = await getRequesterInfo(`w:${webhook_data.from.number}`);
        const {status} = data;
        if(/404/.test(status)){
            textMessage = noNexmoTicketTemplate();
        }else{
           const {t} = data.db_data;
           const body_text = getBody(webhook_data.message);
           await postPublicNote(t,body_text);
           textMessage = noteConfirmationTemplate(t);
        }
        return sendMessageToEndUser(textMessage,webhook_data);
    }catch(e){
        console.error('Error on File Content Handler');
        throw e;
    }
}

const inboundMessageHandler = (webhook_data,iparams) => {
    const {message} = webhook_data;
    const type = message.content.type;
    switch(type){
        case 'text':
            return textContentHandler(webhook_data,iparams);
        case 'image':
        case 'file':
        case 'video':
        case 'audio':
        case 'location':
            return fileContentHandler(webhook_data);
        default:
            console.info('Unexpected file handler', type);
            return;
    }
}

const getPriorityName = (priority,priority_value) => {
    for(let [key,value] of Object.entries(priority)){
        if(value === parseInt(priority_value))
            return key;
    }
}

const convertIntoValidObjectString = str => {
    let obj = "";
    for(let i = 0; i <= str.length - 1; i++){
        if(str[i] === "{"){
            obj += "{\"";
        }else if(str[i+1] === ":" && str[i+2] === "{"){
            obj += str[i]+ "\"";
        }else if(str[i] === ":" && str[i+1] === "["){
            obj += "\":";
        }else if(str[i] === ":" && str[i+1] !== "{"){
            obj += "\":\"";
        }else if(str[i] === "," && str[i-1] !== "}"){
            obj += "\",\"";
        }else if(str[i] === "," && str[i-1] === "}"){
            obj += ",\"";
        }else if(str[i] === "["){
            obj += str[i] + "\"";
        }else if(str[i] === "]"){
            obj += "\"" + str[i] ;
        }else if(str[i] === "}" && str[i-1] !== "}" && str[i-1] !== "]"){
            obj += "\"}";
        }else{
            obj += str[i];
        }
    }
    return obj;
}

const freshdeskEventHandler = async webhook_data => {
    try{
        const {triggered_event,ticket_id} = webhook_data;
        const data = await getRequesterInfo(`t:${ticket_id}`);
        const {status} = data;
        if(!/404/.test(status)){
            const nexmo_data = {
                from:{
                    type:data.db_data.type,
                    number:data.db_data.w
                },
                to:{
                  type:data.db_data.type,
                  number:data.db_data.n
                }
            };
            let textMessage = '',status,priority;
            const eventActions = /string/i.test(typeof triggered_event) ? JSON.parse(convertIntoValidObjectString(triggered_event)) : triggered_event;
            if('status' in eventActions || 'priority' in eventActions){
                const ticket_fields_response = await getTicketFields();
                status = ticket_fields_response.find(ticket_field => ticket_field.name === 'status').choices;
                priority = ticket_fields_response.find(ticket_field => ticket_field.name === 'priority').choices;
            }
            const promises = [];
            for(let field of Object.keys(eventActions)){
                switch(field){
                    case 'group_id':
                        textMessage = webhook_data.ticket_group_name ? `Your Ticket ID #${ticket_id} was assigned to the new group ${webhook_data.ticket_group_name}` : `Your Ticket ID #${ticket_id} was assigned to no group`;
                        promises.push(sendMessageToEndUser(textMessage,nexmo_data));
                        break;
                    case 'status':
                        textMessage = `Status of ticket ID #${ticket_id} from ${status[parseInt(eventActions.status.from)][0]} to ${status[parseInt(eventActions.status.to)][0]}`; 
                        promises.push(sendMessageToEndUser(textMessage,nexmo_data));
                        break;
                    case 'priority':
                        textMessage = `Priority of ticket ID #${ticket_id} from ${getPriorityName(priority,eventActions.priority.from)} to ${getPriorityName(priority,eventActions.priority.to)}`; 
                        promises.push(sendMessageToEndUser(textMessage,nexmo_data));
                        break;
                    case 'responder_id':
                        textMessage = webhook_data.ticket_agent_name ? `A new agent has been assigned to your ticket ID #${ticket_id},${webhook_data.ticket_agent_name}` : `Your Ticket ID #${ticket_id} was not assisgned to no agent`;
                        promises.push(sendMessageToEndUser(textMessage,nexmo_data));
                        break;
                }
            }
            return Promise.all(promises);
        }else{
            console.info(`The ticket ${webhook_data.ticket_id} was not created through nexmo`);
        }
    }catch(e){
        console.error('Error on Freshdesk Event Handler');
        throw e;
    }
}

const webhookHandlers = async args => {
    console.info('On Webhook handler');
    console.info(JSON.stringify(args.data));
    try{
        if(args.data.freshdesk_webhook){
            await freshdeskEventHandler(args.data.freshdesk_webhook);
            console.info('Freshdesk Event Handled successfully'); 
        }else{
            const {data:webhook_data,iparams} = args;
            const {direction,message_uuid} = webhook_data;
            if(/inbound/i.test(direction)){
                await inboundMessageHandler(webhook_data,iparams);
                console.info('Inbound Messages Handled successfully');
            }else
              console.info('Not an inbound message',message_uuid);
        }
    }catch(e){
        console.error('Error on Webhook Handler');
        console.error(JSON.stringify(e));
    }
}

exports = {
    webhookHandlers
}

