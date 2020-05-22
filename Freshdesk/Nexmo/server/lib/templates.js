const newTicketTemplate = (id,subject) => `Support: New Ticket is created with Ticket ID #${id} and titled as ${subject}. It will be processed shortly, thanks for your cooperation`
const openTicketTemplate = data => `Your open Tickets:${data}\nNo more open ticket is available`
const notATicketIdTemplate = () => `Please provide the Ticket id`
const noTicketFoundTemplate = id => `Ticket ID #${id} not found in your helpdesk`
const restrictTicketAccessTemplate = id => `You don't have access to ticket ID #${id}`
const noNexmoTicketTemplate = () => `You have not created any tickets through nexmo`
const notANexmoTicketTemplate = id => `This ticket ID #${id} is not created through nexmo`
const ticketStatusTemplate = (id,subject,status) => `Your ticket ID #${id} titled as ${subject} and status is ${status}`
const noOpenTicketTemplate = () => `No open tickets are available` 
const noMatchKeywordTemplate = () => `The Keyword doesn\'t match with anyone.Please try with the valid one`
const notValidCommandTemplate = () => `Invalid command.Please try with the valid one`
const switchConfirmationTemplate = id => `Switched to ticket ID #${id} successfully`
const noteConfirmationTemplate = id => `Note posted successfully to the ticket ID #${id}`

exports = {
    newTicketTemplate,
    openTicketTemplate,
    notATicketIdTemplate,
    noTicketFoundTemplate,
    restrictTicketAccessTemplate,
    noNexmoTicketTemplate,
    ticketStatusTemplate,
    noOpenTicketTemplate,
    notANexmoTicketTemplate,
    noMatchKeywordTemplate,
    notValidCommandTemplate,
    switchConfirmationTemplate,
    noteConfirmationTemplate
}