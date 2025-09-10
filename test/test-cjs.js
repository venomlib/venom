const venom = require('../dist/index.cjs');

console.log('Testing CommonJS build...');

venom
  .create({
    session: 'sessionname-cjs', //name of session
    headless: false,
    logQR: true,
    options: {
      browserPathExecutable:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
  })
  .then((client) => {
    console.log('CommonJS client created successfully!');
    start(client);
  })
  .catch((error) => {
    console.error('Error creating CommonJS client:', error);
  });

async function start(client) {
  console.log('Starting CommonJS test...');
  try {
    const f = await client.getHostDevice();
    console.log(await client.getWAVersion());
    console.log(f);
    client.onMessage(async (message) => {
      console.log('CommonJS message received:', message);
    });
  } catch (error) {
    console.error('Error in CommonJS test:', error);
  }
}