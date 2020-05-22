
exports = {
  events: [
    {
      event:'onConversationCreate', 
      callback:'onConversationCreateHandler'
    }
  ],
   
  onConversationCreateHandler: async function(args){
    console.info(JSON.stringify(args.data.conversation));
  }
};

