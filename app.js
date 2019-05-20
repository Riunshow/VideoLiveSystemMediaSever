const { NodeMediaServer } = require('node-media-server')
const axios = require('axios');
const serverAddr = 'localhost:7001'
let streamArr = [];
// 设置配置信息
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
  },
  trans: {
    ffmpeg: '/Users/zhubotai/Documents/class/school/ffmpeg/ffmpeg',
    tasks: [{
      app: 'live',
      ac: 'aac',
      hls: true,
      hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      dash: true,
      dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
      mp4: true,
      mp4Flags: '[movflags=faststart]',
    }]
  }
}; 

var nms = new NodeMediaServer(config)
nms.run();

// 推流开始
nms.on('postPublish', (id, StreamPath, args) => {
  let token = StreamPath.split('/')[2]

  axios.post(`http://${serverAddr}/api/live/getRoomIdByToken`, {
    token
  }).then(res => {
    let roomID = res.data.data.roomID
    streamArr[id] = roomID;
  
    axios.get(`http://${serverAddr}/api/live/start/${roomID}`).then((res ) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    })

  }).catch((err) => {
    console.log(err);
  })
});
// 推流结束
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