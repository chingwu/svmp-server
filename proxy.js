/*
 * Copyright 2013 The MITRE Corporation, All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this work except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * author Dave Bryson
 *
 */
'use strict';

var net = require('net'),
    tls = require('tls'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('./config/config').settings,
    proxy = require('./lib/proxy'),
    auth = require('./lib/authentication');

if(config.tls_proxy) {
    var tls_options = {
    	key: fs.readFileSync('./tls/private-key.pem'),
    	cert: fs.readFileSync('./tls/public-cert.pem')
    };
}

mongoose.connect(config.db);

/**
 * Example authentication callback function
 * User for testing
 */
function testAuth(reqObj,callback) {
    var un = reqObj.username;
    var pw = reqObj.password;
    if(un === 'dave' && pw === 'dave') {
        callback(undefined,{username: un});
    } else {
        callback('Login failure');
    }
}


function onConnection(proxySocket) {
    var gateGuard = new auth.Authentication(testAuth);
    proxy.proxyConnection(proxySocket,gateGuard);
}

var server = config.tls_proxy ? tls.createServer(tls_options, onConnection) : net.createServer(onConnection);
server.listen(config.port);
console.log("Proxy running on port", config.port, " Using TLS? : ", config.tls_proxy);

