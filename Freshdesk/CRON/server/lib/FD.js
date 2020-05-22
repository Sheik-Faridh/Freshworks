//Make the request to the Freshdesk's API using the proxy object $request
class Request{
    constructor(){
        //set the base url of the fresdesk sub domain
        this.url = `https://<%= iparam.sub_domain %>.freshdesk.com`;
        //set the authentication for Freshdesk's API
        this.options = this.getAuth();
    }
    
    //get the authentications for all the Fresdesk API 
    getAuth(){
        return {
            headers:{
                Authorization:'Basic <%= encode(iparam.api_key) %>'
            }
        }
    }

    //get or delete methods for Freshdesk API
    getordelete(url,method) {
        return $request[method](`${this.url}/${url}`,this.options);
    }

    //create or update methods for Freshdesk API
    postorupdate (url,body,method) {
        this.options.body = JSON.stringify(body);
        return $request[method](`${this.url}/${url}`,this.options);
    }
}

//store and retrieve the data from the datastore 
class DB{
    //get data from the datastore
    static get(name) {
        return $db.get(name);
    }

    //set the data from the datastore
    static set(name,body) {
        return $db.set(name,body);
    }

    //update the data from the datastore
    static update(name,action,body) {
        return $db.update(name,action,body);
    }

    //delete the data from the datastore
    static delete(name) {
        return $db.delete(name);
    }
}

//CRON JOB
//An app cn create a maximum of 1000 one-time schedules and 1 recurring schedule.
//In this app, we are going to create only one recurring schedule
class Schedule{
    //create the schedule
    create(cron_data){
        return $schedule.create(cron_data)
    }

    //update the schedule
    update(cron_data,interval){
        const updated_data = Schedule.setUpdatedTimeForCRONJob(cron_data,interval);
        return $schedule.update(updated_data);
    }

    //delete the schedule
    delete(name){
        return $schedule.delet({name});
    }

    //set the time at which the CRON should run
    setUpdatedTimeForCRONJob(cron_data,interval){
        const currentTime = new Date();
        currentTime.setMinutes(currentTime.getMinutes() + interval);
        cron_data.schedule_at = currentTime.toISOString();
        return cron_data;
    }
}

exports = {
    Request: new Request(),
    DB,
    Schedule
}