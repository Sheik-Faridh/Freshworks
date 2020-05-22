const buildBodyForTextContent = (message,webhook_data) => ({
    from:{
        type: webhook_data.to.type,
        number:webhook_data.to.number
    },
    to:{
        type: webhook_data.from.type,
        number:webhook_data.from.number
    },
    message:{
        content:{
            type:'text',
            text:message
        }
    }
})

const buildBodyforImageContent = (url,name,webhook_data) => ({
    from:{
        type: webhook_data.to.type,
        number:webhook_data.to.number
    },
    to:{
        type: webhook_data.from.type,
        number:webhook_data.from.number
    },
    message:{
        content:{
            type:'image',
            image:{
                url,
                caption:name
            }
        }
    }
})

const buildBodyforFileContent = (url,name,webhook_data) => ({
    from:{
        type: webhook_data.to.type,
        number:webhook_data.to.number
    },
    to:{
        type: webhook_data.from.type,
        number:webhook_data.from.number
    },
    message:{
        content:{
            type:'file',
            file:{
                url,
                caption:name
            }
        }
    }
})

const buildBodyforAudioContent = (url,webhook_data) => ({
    from:{
        type: webhook_data.to.type,
        number:webhook_data.to.number
    },
    to:{
        type: webhook_data.from.type,
        number:webhook_data.from.number
    },
    message:{
        content:{
            type:'audio',
            audio:{
                url
            }
        }
    }
})

exports ={
    buildBodyForTextContent,
    buildBodyforImageContent,
    buildBodyforFileContent,
    buildBodyforAudioContent
}