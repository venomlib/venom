import venom from '../dist/index.mjs';

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
  console.log(f);
  client.onMessage(async (message) => {
    console.log(message);
  });
  // const allMessages = await client.getAllUnreadMessages();
  // console.log(allMessages);
}
