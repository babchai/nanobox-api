var net = require('net');
var url = require('url');
var _ = require('lodash');

var JsonSocket = require('json-socket');

var port = 9838;
var server = net.createServer();
server.listen(port);
var sockets = [];
// {"code":0,"msg":"","data":{"dev_name":"test1","num":16}}
// {"code": 0,"msg":"","data":{"dev_name":"test2","num": 16}}

server.on('connection', function(socket) { //This is a standard net.Socket
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    //sockets.push(socket);

    console.log("incoming")
  // console.log("incoming sockets " , sockets);
    socket.on('data', data=>{
        try{
            let dataJson = JSON.parse(data.toString())
            console.log("incoming data ==> " , dataJson.data)
            //console.log("dataJson ==> " , dataJson.data.dev_name)
            var successResp = { "code":0,"msg":"connect success","data":{}}
            socket.sendMessage(successResp);
            sockets.push({'soc':socket , 'data' : dataJson.data})
        }catch(e){
            console.log(e);
        }
    })
    
    // sockets.forEach((soc , i) =>  {
    //     console.log("index ==> " , i);
    //     soc.on('data' , (data , i) =>{
    //         console.log("sockets ==> " , data.toString() , i)
    //         dataJson= JSON.parse(data.toString());
    //         soc.sendMessage({C:1,D:2});
    //     })
    // });

    setInterval(function() {  
        //return console.log(cue);
        if(sockets.length > 0)
        {
            let max = sockets.length-1
            let min = 0
            let result = null
            let random = Math.floor(Math.random() * (max - min + 1) + min);
            // result = _.filter(sockets , function(s){
            //     expect = 'test'+random;
            //     return s.data.dev_name == 'test'+random
            // })
            //result[0].soc.sendMessage(openDoor);

            var openDoor = { "code": 0,"msg": "", "data":{"total": 2,"list": [
            {
                "id": 1,
                "num": 12},
            {
                "id": 2,
                "num": 14
            }]}};

            sockets[random].soc.sendMessage(openDoor);
        }
    }, 5000);
    

    // socket.on('data', data => {
        
    //     console.log(data.toString())
    //     socket.sendMessage(data.toString());
    //     //data.sendMessage({C:1,D:2});
    //     //socket.sendMessage({C:1,D:2});

    // });

    // socket.on('connect', function(con) { //Don't send until we're connected
    //     console.log(con);
    //     socket.sendMessage({C:1,D:2});

    // // socket.on('message', function(message) {
    // //     message = JSON.stringify(message);
    // //     console.log('2. The result is: '+message);
    // //     });
    // });

    // socket.on('error', function(err)
    // {
    //     socket.sendMessage("s");
    //     console.log("error", err)
    //    // socket.emit('end');
    // });

    // socket.on('end', function()
    // {
    //     socket.sendMessage("s");

    //     // TODO : fix this part
    //     sockets.slice(sockets.indexOf(socket), 1);
    //     console.log("Il reste " + sockets.length + " clients connectés");
    // });

});