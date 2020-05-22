class Database{
    constructor(name){
        this.name = name;
    }

    get(){
        return $db
        .get(this.name)
        .catch(e => {
            if (e.status === 404) return this.create();
            else throw e;
        });
    }

    create(){
        return $db
        .set(this.name, {
            mapped_articles: [],
            processed_articles: [],
            isCreateOrUpdateCompleted: false,
            isDeleteCompleted: false
        })
        .catch(e => {
            throw e;
        });
    }

    update(operation,record){
        return $db
        .update(this.name, operation, record)
        .catch(e => {
            throw e;
        });
    }
}

const DATABASE = new Database('articles');
exports = DATABASE;