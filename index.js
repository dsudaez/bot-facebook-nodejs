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
            responseTextMessage(sender, text.substring(0, 200))
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
                message = getTemplateNovedades();
                break;
            case 'ambiente':
                message = getTemplateAmbiente();
                break;
            case 'transito':
                message = getTemplateTransito();
                break;
            case 'empleo':
                message = getTemplateEmpleo();
                break;
            default:
        }
        sendMessage(sender, message)
}

function responseTextMessage(sender, text) {
    let messageData = { text:text }
    sendMessage(sender,messageData);
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

/*Templates*/
function getTemplateMunicipio() {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Municipios",
                    "subtitle": "Municipios",
                    "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/7f/RIFLE_CITY_COUNCIL_MEETING_-_NARA_-_552618.jpg",
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

function getTemplateAmbiente() {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ambiente",
                    "subtitle": "Ambiente",
                    "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Salomon_van_Ruysdael_-_River_Landscape_-_WGA20566.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Horarios de Recolección",
                        "payload": "Lista de horarios de recolección",
                    }, {
                        "type": "postback",
                        "title": "Puntos verdes",
                        "payload": "Lugares donde tirar residuos específicos",
                    }, {
                        "type": "postback",
                        "title": "Jaque",
                        "payload": "Devuelve horarios de atención",
                    }
                    ],
                }]
            }
        }
    }

    return messageData;
}

function getTemplateTransito() {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Transito",
                    "subtitle": "Transito",
                    "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/06/2008-07-11_Chapel_Hill_bus_passing_South_Building.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "Cómo obtengo mi Carnet"
                    }, {
                        "type": "postback",
                        "title": "Horarios de Atención",
                        "payload": "Lista de horarios de Atención",
                    }, {
                        "type": "postback",
                        "title": "Multas",
                        "payload": "Descripción de Multas",
                    }
                    ],
                }]
            }
        }
    }
    return messageData;
}

function getTemplateEmpleo() {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Empleo",
                    "subtitle": "Empleo",
                    "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Operator_Lapangan.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "¿Sos emprendedor?"
                    }, {
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "¿Buscás empleo?"
                    }]
                }]
            }
        }
    }
    return messageData;
}


function getTemplateNovedades() {
    let messageData = {
        "attachment": {
            "type": "image",
            "payload": {
                "url":"https://upload.wikimedia.org/wikipedia/commons/0/00/Bumblebee_on_Lavender_Blossom.JPG"
            }
        }
    }
    return messageData;
}