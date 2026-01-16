import venom from '../dist/index.mjs';
import ffmpeg from 'fluent-ffmpeg';

venom
  .create({
    session: 'sessionname', //name of session
    headless: false,
    logQR: true,
    options: {
      browserPathExecutable:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
  })
  .then((client) => {
    start(client);
  });

async function start(client) {
  const f = await client.getHostDevice();
  console.log(await client.getWAVersion());
  //console.log(f);
  client.onMessage(async (message) => {
    console.log(message);
  });

  /*let inputPath = 'test.mp3';
  let out = 'test.ogg';
  ffmpeg(inputPath)
    .audioCodec('libopus')
    .audioChannels(1)
    .audioFrequency(16000)
    .audioBitrate('16k')
    .format('ogg')
    .outputOptions([
      '-vn', // no video
      '-application',
      'voip', // optimize opus for voice
      '-map_metadata',
      '-1' // remove all metadata
    ])
    .output(out)
    .on('end', async () => {
      await client.sendVoice('000000000000@c.us', out).catch((reason) => {
        console.log(reason);
      });
    })
    .run(); */
  // const allMessages = await client.getAllUnreadMessages();
  // console.log(allMessages);
}
