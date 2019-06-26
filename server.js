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
//    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket

  //  socket2 = new socket(socket);
    //sockets.push(socket);
    
    console.log("incoming")
  // console.log("incoming sockets " , sockets);
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
            

            //console.log("dataJson ==> " , dataJson.data.dev_name)
            var successResp = { "code":0,"msg":"connect success","data":{}}
            var length = Object.keys(successResp).length +2;
            console.log(length);

            var body = '{ "code":0,"msg":"connect success","data":{}}'

            var bodyBuff = new Buffer(255);
            var len1 = splitNumber(length)[0].toString();
            var len2 = splitNumber(length)[0].toString();


            bodyBuff.write(len1) //length
            bodyBuff.write(len2) //length

            bodyBuff.write('0'); //type
            bodyBuff.write('1'); //type

            bodyBuff.write(body);

             //var bodyBuff = Buffer.from(body);

            var body = '{"code":0,"msg":"connect success","data":{}}'
            
          
           var newHex =  Buffer.from(body, 'utf8').toString('hex');

          // var newBin = conv(body, { out:'bytes' })

           // socket.sendMessage(newHex);
           var b = Buffer.from(body , 'utf-8');
            var len  = splitNumber(body.length+2);
            var buffLen1 = Buffer.from(len[0].toString() , 'utf-8');
            var buffLen2 = Buffer.from(len[1].toString() , 'utf-8');

            var buffType1 = Buffer.from('0' , 'utf-8');
            var buffType2 = Buffer.from('1' , 'utf-8');

            var buff = Buffer.concat([buffLen1 , buffLen2, buffType1 , buffType2 , b]);


            //console.log("send back hex" , newHex );
            //socket.write(newHex);

            console.log("send back bin" , buff );
            socket.write(buff);
           // socket.write(newBin);

            //socket.sendMessage(bodyBuff);

            // var bodyBuff = Buffer.from(JSON.stringify(successResp));

            // var type = Buffer.from('01');
            // var length = Buffer.from(JSON.stringify(body).length.toString());
            // var b = Buffer.concat([bodyBuff], JSON.stringify(body).length+2);
        
            // console.log("send back " , b );

            // socket.sendMessage(b);
           // sockets.push({'soc':socket , 'data' : dataJson.data})

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

           // sockets.push({'soc':socket , 'data' : dataJson.data})
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
            //console.log("send Message " , openDoor);
            //sockets[random].soc.sendMessage(openDoor);
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

    socket.on('error', function(err)
    {
        socket.sendMessage("s");
        console.log("error", err)
       // socket.emit('end');
    });

    // socket.on('end', function()
    // {
    //     socket.sendMessage("s");

    //     // TODO : fix this part
    //     sockets.slice(sockets.indexOf(socket), 1);
    //     console.log("Il reste " + sockets.length + " clients connectés");
    // });

});
