const {Request,DB,Schedule} = require('../lib/FD');
const s3Client = require('../lib/S3');

//mechanism of the cron
const cronmechanism = async (args) =>{
    try{
        await getAndStoreAllContactEmailsInDB(args.data); //get all the contacts email and store them in db
        await getAndStoreAllAgentEmailsInDB(args.data); //get all the agents email and store them in db
        await uploadJSONToS3(args); //upload the contacts and agents email in db to S3
        await setCRONJOBAfterOneHour(); //this makes the CRON to run after the one hour and delete the records in db
    }catch(e){
        throw e;
    }
}

const getAndStoreAllContactEmailsInDB = async ({getAllContactEmailsCompleted,getAllAgentEmailsCompleted,is_json_uploaded_to_s3}) => {
    if(!JSON.parse(getAllContactEmailsCompleted)){
        try{
            await paginateDataAndStoreEmailsInDB({record_name:'contact_records',key:'contacts',getEmails:getContactEmails});
            await updateSchedule({getAllContactEmailsCompleted:true,getAllAgentEmailsCompleted,is_json_uploaded_to_s3});
            console.info('Got all contact emails');
        }catch(e){
            console.error('Error on Fetching the contact emails');
            throw e;
        }
    }
}

const getAndStoreAllAgentEmailsInDB = async ({getAllContactEmailsCompleted,getAllAgentEmailsCompleted,is_json_uploaded_to_s3}) => {
    if(!JSON.parse(getAllAgentEmailsCompleted)){
        try{
            await paginateDataAndStoreEmailsInDB({record_name:'agent_records',key:'agents',getEmails:getAgentEmails});
            await updateSchedule({getAllContactEmailsCompleted,getAllAgentEmailsCompleted:true,is_json_uploaded_to_s3});
            console.info('Got all agent emails');
        }catch(e){
            console.error('Error on Fetching the agent emails');
            throw e;
        }
    }
}

const parseResponse = (api_response) => typeof api_response.response === 'string' ? JSON.parse(api_response.response) : api_response.response;

const getContactEmails = (email,contact_data) => {
    if(contact_data.email)
            email.push(contact_data.email);
    return email;
}

const getAgentEmails = (email,agent_data) => {
    if(agent_data.contact.email)
            email.push(agent_data.contact.email);
    return email;
}

const getData = (page,key) => {
    const url = `api/v2/${key}?per_page=100&page=${page}`;
    return Request.getordelete(url,'get');
}

const paginateDataAndStoreEmailsInDB = async ({record_name,key,getEmails}) => {
    try{
        let {page} = await DB.get(record_name);
        let keepGoing = true;
        while(keepGoing){
            const response = await getData(page,key);
            const response_data = parseResponse(response);
            keepGoing = response.headers.link ? true : false;
            page+=1;
            await Promise.all([DB.update(record_name,'append',{emails:[...response_data.reduce(getEmails,[])]}),DB.update(record_name,'increment',{page:1})]);
        }
    }catch(e){
        throw e;
    }
}

const uploadJSONToS3 = async (args) => {
    const {is_json_uploaded_to_s3} = args.data;
    const {accessKeyId,secretAccessKey,bucket_name:Bucket,region} = args.iparams;
    try{
        if(!JSON.parse(is_json_uploaded_to_s3)){
            const data = await Promise.all([DB.get('contact_records'),DB.get('agent_records')]);
            const [{emails:contacts},{emails:agents}] = data;
            const emails = [...contacts,...agents];
            const unique_emails = [...new Set(emails)];
            const s3 = new s3Client({accessKeyId,secretAccessKey,region});
            const response = await s3.isBucketExist(Bucket);
            console.info(`The Bucket ${Bucket} exists `,response);
            !response && await s3.createBucket({Bucket,region});
            const params = {Bucket,Key:'listofemail.json',Body:JSON.stringify({emails:unique_emails})};
            await s3.sendJSON(params);
            console.info('JSON uploaded to S3');
        }
    }catch(e){
        console.error('Failed to upload the JSON to S3');
        throw e;
    }
}

const updateSchedule = async (data,Interval = 6) => {
    return Schedule.update({
        name: 'get_Email',
        data,
        repeat: {
            time_unit: 'minutes',
            frequency: 5
        }
    },Interval);  
}

const setCRONJOBAfterOneHour = () => {
    const data = {
        getAllContactEmailsCompleted: false,
        getAllAgentEmailsCompleted:false,
        is_json_uploaded_to_s3:false
    };
    return Promise.all([updateSchedule(data,60),setDBEmpty()]);
}

// const getCRONRunningTimeInSeconds = (date) => date.getSeconds();

const setDBEmpty = () => Promise.all([DB.update('contact_records','set',{emails:[],page:1}),DB.update('agent_records','set',{emails:[],page:1})]);

exports = {
    cronmechanism
}