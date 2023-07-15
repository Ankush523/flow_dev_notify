const fcl = require("@onflow/fcl");
const TelegramBot = require("node-telegram-bot-api");
const { config } = require("dotenv");
config();

fcl.config({
  "accessNode.api": "https://special-quick-seed.flow-testnet.discover.quiknode.pro/2ddfca1da0a21aa93393838ad401b1de040cf5bd/",
});

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true
});

const flowAddress = "f086a545ce3c552d";
const flowAddress2 = "0x3611ceb748e120df";

let lastCheckedBlockHeight = 110754305;

async function main() {
  try {
    const latestBlock = await fcl.send([fcl.getBlock(true)]).then(fcl.decode);

    // Process blocks one by one starting from the last checked height
    for (let height = lastCheckedBlockHeight + 1; height <= latestBlock.height; height++) {
      const block = await fcl.send([fcl.getBlock(true)]).then(fcl.decode);

      for (let guarantee of block.collectionGuarantees) {
        const collectionId = guarantee.collectionId;
        const collection = await fcl.send([fcl.getCollection(collectionId)]).then(fcl.decode);

        // Process all transactions in the collection
        for (let transactionId of collection.transactionIds) {
            const tx = await fcl.send([fcl.getTransaction(transactionId)]).then(fcl.decode);
            if(transactionId)
            {
              console.log(transactionId)
              const txPayer = tx.payer;
              console.log(`Transaction for ${transactionId} payer is :`, txPayer);
            }
            else{
              console.log("no transaction id")
            }
    
            if(tx.payer === flowAddress)
            {
              let message = `You've made a transaction on flow mainnet. Track the transaction here: https://testnet.flowscan.org/transaction/${transactionId}`
              sendTelegramMessage(1783859653, message)
              console.log("user is payer")
            }
            // else{
            //   console.log("user is not payer")
            // }
          }
      }

      // Update the last checked block height
      lastCheckedBlockHeight = height;
    }
  } catch (err) {
    console.error(err);
  }

  setTimeout(main, 1000);
}

main();

const sendTelegramMessage = async (chatId, text) => {
  bot.sendMessage(chatId, text);
};
