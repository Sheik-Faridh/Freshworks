const UTILS = require('./lib/helper');
const SCHEDULE_MECHANISM = require('./controller/schedule_mechanism');
require('dotenv').config();
const SCHEDULE = require('./model/schedule');
const DATABASE = require('./model/database');

exports = {
  events: [
    { event: 'onAppInstall', callback: 'onAppInstallCallback' },
    { event: 'onScheduledEvent', callback: 'onScheduledEventHandler' },
    { event: 'onAppUninstall', callback: 'onAppUninstallCallback' }
  ],

  onAppInstallCallback: async function() {
    try {
      await Promise.all([validateFSCredentials(), validateAccessToken()]);
      await SCHEDULE.create({ update_frequency: false });
      //pre defined function to proceed the app installation
      renderData();
    } catch (e) {
      console.error('On App Installation Error');
      renderData(e.message);
    }
  },

  onAppUninstallCallback: async function() {
    try {
      await SCHEDULE.delete();
      //pre-defined function to proceed the app uninstallation process.
      renderData();
    } catch (e) {
      console.error('On App Uninstallation Error');
      renderData(e.message);
    }
  },

  onScheduledEventHandler: async function(payload) {
    console.info('Schedule Initiated');
    try {
      JSON.parse(payload.data.update_frequency) &&
        //update the recurring schedule frequency to 5 mins
        SCHEDULE.update({ update_frequency: false }, 5);
        //get the articles processed and mapped with created articles in freshservice
      const articleData = await DATABASE.get();
      if (!JSON.parse(articleData.isCreateOrUpdateCompleted))
        // this function is used to update or create the articles in freshservice based on the data in db
        await SCHEDULE_MECHANISM.createOrUpdateArticles(articleData);
      else if (!JSON.parse(articleData.isDeleteCompleted))
        // delete the articles in freshservice
        await SCHEDULE_MECHANISM.deleteArticles(articleData);
      else
         // updates the recurring schedule frequency to next day for a particular time after the CRUD operation done
         await SCHEDULE_MECHANISM.updateScheduleFrequency();
      console.info('Schedule Completed');
    } catch (e) {
      console.error('On Schedule Event Error');
      console.error(JSON.stringify(e));
      console.error('Scheduled Event Failed');
    }
  }
};

function validateFSCredentials() {
  const API_URL = `https://<%= iparam.domain %>.freshservice.com/api/v2/tickets`;
  return $request
    .get(API_URL, UTILS.buildFSRequestHeaders())
    .catch(e => {
      console.error(e);
      const errMessage = UTILS.buildFSErrMessage(e.status);
      throw new Error(errMessage);
    });
}

function validateAccessToken() {
  return $request
    .get(process.env.ARTICLES_API_URL, UTILS.buildFSRequestHeaders())
    .catch(e => {
      console.error(e);
      const errMessage = UTILS.buildUAErrMessage(e.status);
      throw new Error(errMessage);
    });
}
