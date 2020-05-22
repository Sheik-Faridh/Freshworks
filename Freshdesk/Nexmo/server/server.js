const APP_REGISTRATION_FAILURE = 'App Installation failed';
const {Request,DB} = require('./lib/FD');
const {webhookHandlers} = require('./lib/webhookhandler');
const {sendConversationsToRequester,
       getConversationAttachments} = require('./lib/conversationhandler');
exports = {
  events: [
    {
      event:'onAppInstall', 
      callback:'onAppInstallHandler'
    },
    {
      event: 'onConversationCreate',
      callback: 'onConversationCreateHandler'
    },
    {
      event:'onExternalEvent',
      callback:'onExternalEventHandler'
    }
  ],
   
  onAppInstallHandler: async function(){
    try{
      const hook_url = await generateTargetUrl();
      console.info(hook_url);
      await DB.set('hook_url',{url:hook_url})
      renderData();
    }catch(e){
      console.error('Error on App Installation')
      console.error(JSON.stringify(e));
      renderData({message:APP_REGISTRATION_FAILURE})
    }
  },

  onConversationCreateHandler: async function(args) {
    const {ticket_id,id,body_text,source,attachments,incoming,private} = args.data.conversation;
    if(source === 2 && !private && !incoming){
      try{
        const {w,n,type} = await DB.get(`t:${ticket_id}`);
        const attachment_objects = attachments.length ? await getConversationAttachments(ticket_id,id) : attachments;
        await sendConversationsToRequester({ticket_id,private,w,n,type,body_text,attachment_objects});
        console.info(`Sucessfully posted the conversation of the ticket Id ${ticket_id} to the whatsapp number ${w}`)
      }catch(e){
        console.error('Error on Conversation create');
        console.error(JSON.stringify(e));
      }
    }else{
      console.info(`onConversationCreate: Recd a conversation for ticket ID ${ticket_id} which is not a public note. Ignoring`)
    }
  },
  
  onExternalEventHandler: function(args){
    webhookHandlers(args)
  }
};

