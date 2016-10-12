'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})
// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] ===VERIFY_TOKEN) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id

        if (event.message && event.message.text) {
            let text = event.message.text
            launchResponseByReservedWord(sender, text.substring(0,200))
            continue
        }
        if (event.postback) {
            //responseGenericMessage(sender)
            let text = JSON.stringify(event.postback)
            responseTextMessage(sender, "Postback received: "+text.substring(0, 200))
            continue
        }
    }
    res.sendStatus(200)
})

const token = process.env.PAGE_ACCESS_TOKEN

function launchResponseByReservedWord(sender,text){
    let message;
        switch(text){
            case 'municipio':
                message = getTemplateMunicipio();
                break;
            case 'novedades':
                break;
            case 'ambiente':
                break;
            case 'transito':
                break;
            case 'empleo':
                break;
            default:
        }
        sendMessage(sender, message)
}

function responseTextMessage(sender, text) {
    let messageData = { text:text }
    sendMessage(sender,messageData);
}


function getTemplateMunicipio() {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Municipios",
                    "subtitle": "Municipios",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "Direcciones"
                    }, {
                        "type": "postback",
                        "title": "Horarios de Atención",
                        "payload": "Lista de horarios de Atención",
                    }],
                }]
            }
        }
    }
    return messageData;
}

function sendMessage(sender,messageData){
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
