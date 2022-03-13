const queries = require('../db/queries');
const {InlineKeyboard} = require('node-telegram-keyboard-wrapper');
const messenger = require('../messenger');
const  {bot_name} = require('../config');
const sprintf = require("sprintf-js").sprintf;

const alreadyQueuedMsg = "Error: you're already in a queue for %s. You may use /leavequeue to leave the current queue.";

module.exports.init = async function (msg) {
    if (msg.from.id !== msg.chat.id) {
        const text = "This command should be used by participants as a direct message to me at @" + bot_name;
        messenger.send(msg.chat.id, text);
        return;
    }
    try {
        const currStationID = await queries.getUserStationID(msg.from.id);
        if (currStationID !== null) {
            const stationName = await queries.getStationName(currStationID);
            const str = sprintf(alreadyQueuedMsg, stationName)
            messenger.send(msg.from.id, str);
            return;
        }
        if(currStationID === "0") {
            console.Warn("Warning: in joinQueue, participant with ID " + msg.from.id + " has invalid stationID");
        }

        const stationIDs = await queries.getStationIDs();
        //TODO: convert to method that returns all stations
        const stationNamePromises = stationIDs.map(st => queries.getStationName(st));

        const ik = new InlineKeyboard();
        for (let i = 0; i < stationIDs.length; i++) {
            let data = {c: "join", s: stationIDs[i]}
            ik.addRow({text: await stationNamePromises[i], callback_data: JSON.stringify(data)})
        }
        ik.addRow({text: 'Cancel', callback_data: JSON.stringify({c: "cancel"})});
        //TODO: send list of stations and wait time
        const text = ' If you have signed up for tCarnival using eventbrite, there is no need to sign up again using the bot! Which timeslot would you like to register for?';
        messenger.send(msg.from.id, text, ik.build());
    } catch (e) {
        console.log(e);
    }
}

module.exports.callback = async function (query) {
    try {
        const currStationId = await queries.getUserStationID(query.from.id);
        if (currStationId !== null) {
            const stationName = await queries.getStationName(currStationId);
            const str = sprintf(alreadyQueuedMsg, stationName)
            messenger.edit(
                query.message.chat.id,
                query.message.message_id,
                null,
                str,
                null);
            return;
        }
        const data = JSON.parse(query.data);
        const stationID = data.s;
        const stationName = await queries.getStationName(stationID);
        const queueLength = await queries.getQueueLength(stationID);
        const maxQueueLength = await queries.getMaxQueueLengthInt(stationID);
        if (maxQueueLength !== null && queueLength >= maxQueueLength) {
            messenger.edit(
                query.message.chat.id,
                query.message.message_id,
                null,
                "Error: the queue for " + stationName + " is too full. Try again later, or queue for another timeslot.",
                null);
        } else {
            try {
                await queries.enqueue(query.from.id, stationID);
                messenger.edit(
                    query.message.chat.id,
                    query.message.message_id,
                    null,
                    `Successfully added to queue for ${stationName}`,
                    null);
            } catch (e) {
                messenger.edit(
                    query.message.chat.id,
                    query.message.message_id,
                    null,
                    "An error occurred while joining the queue",
                    null);
            }
        }
    } catch (e) {
        console.log(e);
    }
}