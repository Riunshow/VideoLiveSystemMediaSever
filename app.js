const { NodeMediaServer } = require('node-media-server')
const axios = require('axios');
const serverAddr = 'localhost:7001'
let streamArr = [];
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: 9090,
    allow_origin: '*'
  }
};

var nms = new NodeMediaServer(config)
nms.run();


nms.on('postPublish', (id, StreamPath, args) => {
  let roomID = StreamPath.match(/\d+/g);
  streamArr[id] = roomID;
  axios.get(`http://${serverAddr}/api/live/start/${roomID}`).then((res ) => {
    console.log(res.data);
  })
  .catch((err) => {
    console.log(err);
  });
});

nms.on('donePublish', (id, StreamPath, args) => {
  let roomID = streamArr[id];
  
  axios
    .get(`http://${serverAddr}/api/live/shutdown/${roomID}`).then((res ) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
});