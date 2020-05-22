const CREATE_SCHEDULE_ERR = 'Failed to create the schedule',
    DELETE_SCHEDULE_ERR = 'Failed to delete the schedule';

class RecurringSchedule{
    constructor(name){
       this.name = name;
    }

    create(data){
        return $schedule
        .create({
          name: this.name,
          data,
          schedule_at: new Date().toISOString(),
          repeat: {
            time_unit: 'minutes',
            frequency: 5
          }
        })
        .catch(e => {
          console.error(JSON.stringify(e));
          throw new error(CREATE_SCHEDULE_ERR);
        });
    }

    update(data,frequency){
        return $schedule
        .update({
          name: this.name,
          data,
          repeat: {
            time_unit: 'minutes',
            frequency
          }
        })
        .catch(e => {
           throw e;
        });
    }

    delete(){
        return $schedule
        .delete({
            name: this.name
        })
        .catch(e => {
            console.error(JSON.stringify(e));
            throw new error(DELETE_SCHEDULE_ERR);
        });
    }
}

const RECURRING_SCHEDULE = new RecurringSchedule('Article Creation');
exports = RECURRING_SCHEDULE;

