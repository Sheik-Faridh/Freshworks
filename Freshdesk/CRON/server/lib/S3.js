const AWS = require('aws-sdk');// To set the AWS credentials and region.

class s3Client{
    constructor({accessKeyId,secretAccessKey,region}){
        // update the region given on the custom installation page
        AWS.config.update({region});
        // setting up the client for the S3 services
        //Constructs a service interface object. Each API operation is exposed as a function on service.
       this.s3client = new AWS.S3({accessKeyId,secretAccessKey});
    }
    
    //check whether the bucket exist in S3 or not
    async isBucketExist(Bucket){
        try{
            //this would return the bucket with the name exist or not
            await this.s3client.headBucket({Bucket}).promise();
            return true;
        }catch(e){
            if(e.statusCode === 404)
                return false;
            throw e;
        }
    }

    //create a bucket in S3
    async createBucket({Bucket,region:LocationConstraint}){
        //creating the bucket and making them private for the security reasons
        const params = {
            Bucket,
            ACL:'private',
            CreateBucketConfiguration:{LocationConstraint}
        };
        return this.s3client.createBucket(params).promise();
    }

    //upload the JSON file to the S3 bucket
    async sendJSON(params){
        //uploading the json in the bucket
        return this.s3client.putObject(params).promise();
    }
}

exports = s3Client;


