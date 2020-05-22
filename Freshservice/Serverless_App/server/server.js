const utils = require('./utils/common');

exports = {

    events: [
        { event: 'onTicketCreate', callback: 'onTicketCreateHandler' }
    ],

    // args is a JSON block containing the payload information.
    // args['iparam'] will contain the installation parameter values.
    onTicketCreateHandler: async function(args) {
        try {
            const res = await utils.deleteDB('sheik');
            console.log(res);
        } catch (e) {
            console.error(e);
        }
    }

};