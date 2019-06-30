var net = require('net');
var url = require('url');
var _ = require('lodash');
const hex2ascii = require('hex2ascii')
var conv = require('binstring');


const arrayBufferToHex = require('array-buffer-to-hex')

var JsonSocket = require('json-socket');

var port = 9838;
var server = net.createServer();
server.listen(port);
var sockets = [];
// {"code":0,"msg":"","data":{"dev_name":"test1","num":16}}
// {"code": 0,"msg":"","data":{"dev_name":"test2","num": 16}}
console.log("engine started");
server.on('connection', function(socket) { //This is a standard net.Socket

    
    console.log("incoming")
    socket.on('data', data=>{

        try{
            console.log("incoming buffer ==>", data);
            var hex = arrayBufferToHex(data)
            console.log("incoming Hex before substr(4) ==> " , hex)

            //socket.sendMessage(hex);

            hex = hex.substr(8)
            console.log("incoming Hex ==> " , hex)

            var ascii =   hex2ascii(hex);
            console.log("incoming ascii ==> " , ascii);
            //j = JSON.parse(ascii);
            let dataJson = JSON.stringify(ascii);
            console.log("json stringify ==> " , dataJson);
            
            var successResp = { "code":0,"msg":"connect success","data":{}}
            var length = Object.keys(successResp).length +2;
            console.log(length);
            var body = '{"code":0,"msg":"connect success","data":{}}'
            
            var newBuff = new Buffer(4)
            var b = Buffer.from(body , 'utf-8');
            var len2 = body.length+2;
            

            //var newLen = Buffer.from(len2.toString(16), 'hex');
            newBuff[0] =0x00
            newBuff[1] = '0x'+len2.toString(16)
            newBuff[2] = '0x00'
            newBuff[3] = '0x01'

            var buff = Buffer.concat([ newBuff , b]);
            console.log("send back bin" , buff );
            socket.write(buff);

            sockets.push({'soc':socket , 'data' : dataJson.data})

        }catch(e){
            console.log("error : " , e);

            var body = { "code":0,"msg":"connect failed","data":{}}
            var length = JSON.stringify(body).length.toString()
            socket.sendMessage(length+" "+"01"+" "+JSON.stringify(body));

            var bodyBuff = Buffer.from(JSON.stringify(body));
            var type = Buffer.from('01');
            var length = Buffer.from((JSON.stringify(body).length+2).toString());
            var b = Buffer.concat([type , bodyBuff],length);
            console.log("send back " , b );
            socket.sendMessage(b);

        }

    })
    
   
    function splitNumber(number){
        sNumber = number.toString();
        output = [];

        for (var i = 0, len = sNumber.length; i < len; i += 1) {
            output.push(+sNumber.charAt(i));
        }
        return output;
    }

    function bin2String(array) {
        var result = "";
        //console.log(array);
        for (var i = 0; i < array.length; i++) {
          result += String.fromCharCode(parseInt(array[i], 2));
          //console.log(array[i] , result);
        }
        console.log("bin2String ==> " , result);
        return result;
      }

    setInterval(function() {  
        //return console.log(cue);
        if(sockets.length > 0)
        {
            let max = sockets.length-1
            let min = 0
            let result = null
            let random = Math.floor(Math.random() * (max - min + 1) + min);
            console.log("randon number ==> " , random);
            // result = _.filter(sockets , function(s){
            //     expect = 'test'+random;
            //     return s.data.dev_name == 'test'+random
            // })
            //result[0].soc.sendMessage(openDoor);

            var openDoor = '{ "code": 0,"msg": "", "data":{"total": 2,"list": [{"id": 1,"num": 12},{"id": 2,"num": 14}]}}';

            var b = Buffer.from(openDoor , 'utf-8');

            var newBuff = new Buffer(4);
            var len2 = openDoor.length+2;
            newBuff[0] =0x00
            newBuff[1] = '0x'+len2.toString(16)
            newBuff[2] = '0x00'
            newBuff[3] = '0x03'

            var buff = Buffer.concat([ newBuff , b]);
            console.log("send back bin" , buff );
            //socket.write(buff);
            sockets[random].soc.write(buff)


            //console.log("send Message " , openDoor);
            //sockets[random].soc.sendMessage(openDoor);
        }
    }, 5000);
    

 

    socket.on('error', function(err)
    {
        socket.sendMessage("s");
        console.log("error", err)
       // socket.emit('end');
    });

   

});
