const APP_REGERISTRATION_ERR = 'App Registration Failed';
const {DB,Schedule} = require('./lib/FD');
const {cronmechanism} = require('./cron/cron_job');
const APP_DEREGERISTRATION_ERR = 'App De-registration Failed';

exports = {

  events: [
    { event: 'onAppInstall', callback: 'onAppInstallHandler' },
    { event: 'onScheduledEvent', callback: 'onScheduledEventHandler' },
    { event: 'onAppUninstall', callback: 'onAppUninstallHandler' }
  ],

  onAppInstallHandler:async function() {
    try{
      // create the schedule
      await Schedule.create({
        name: 'get_Email',
        data: {
          getAllContactEmailsCompleted:false,
          getAllAgentEmailsCompleted:false,
          is_json_uploaded_to_s3:false
        },
        schedule_at: new Date().toISOString(),
        repeat: {
          time_unit: 'minutes',
          frequency: 5
        }
      });
      //set the object structure in db
      await Promise.all([DB.set('contact_records',{emails:[],page:1}),DB.set('agent_records',{emails:[],page:1})]);
      renderData();
    }catch(e){
      console.error('Error: On App Installation');
      console.error(JSON.stringify(e));
      renderData({message:APP_REGERISTRATION_ERR})
    }
  },

  //CRON execute this functions
  onScheduledEventHandler:async function(args){
     console.info('CRON running....');
     try{
        //run the mechanism
        await cronmechanism(args);
        console.info('CRON completed the process');
     }catch(e){
        console.error('Error: On Schedule Event');
        console.error(JSON.stringify(e));
     }
  },

  //Delet the CRON on app uninstall
  onAppUninstallHandler: async function() {
    try{
      //delete the schedule
      await Schedule.delete('get_Email');
      renderData();
    }catch(e){
      console.error('Error on App Uninstall');
      console.error(JSON.stringify(e));
      renderData({message:APP_DEREGERISTRATION_ERR})
    }
  }
};


