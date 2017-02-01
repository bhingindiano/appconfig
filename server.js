'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import firebase from 'firebase'
const PORT = process.env.PORT || 5000
const config = {
    apiKey: 'AIzaSyDNhJd9m8efjhg8IHN1oMcejTv95o4Dcbc',
    authDomain: 'appconfig-76b6d.firebaseapp.com',
    databaseURL: 'https://appconfig-76b6d.firebaseio.com',
    storageBucket: 'appconfig-76b6d.appspot.com',
    messagingSenderId: '815368726386'
};

let app = express()

// Initialize Firebase
firebase.initializeApp(config);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.post('/config', (req, res) => {
    if(!req.body.client || typeof req.body.client != 'string' ||
       !req.body.version || typeof req.body.version != 'string' ||
       !req.body.key || typeof req.body.key != 'string' ||
       !req.body.value || typeof req.body.value != 'string') {
        res.status(400).send('400 Bad Request')
    }

    let refPath = `config/${req.body.client}/${req.body.version}`
    firebase.database().ref(refPath).once('value').then(function(snapshot) {
        if (snapshot.exists()) {
            firebase.database().ref(refPath).update({
                modified: True,
                [req.body.key]: req.body.value
            })
            res.status(201).send('Updated')
        } else {
            firebase.database().ref(refPath).set({
                [req.body.key]: req.body.value
            })
            res.status(201).send('Created')
        }
    })

})

app.get('/config/:client/:version', (req, res) => {
    var client = req.params.client
    var version = req.params.version

    firebase.database().ref(`/config/${client}/${version}`).once('value').then(function(snapshot) {
        if (snapshot.val().modified) {
            res.json(snapshot.val())
        } else {
            res.status(304).send('Not Modified')
        }
    });
})

app.listen(PORT, () => console.log('Listening on port %s.', PORT));
