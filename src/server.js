const fcl = require("@onflow/fcl");
const TelegramBot = require("node-telegram-bot-api");
import { config } from "dotenv";
config();

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
});

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {
  polling: true
})

const flowAddress = "0x4042ddc846191c0b";

const flowAddress2 = "0x9411fe8c4d130ba2";

async function main() {
  try{
    const latestSealedBlock = await fcl.send([fcl.getBlock(true)]).then(fcl.decode);
    const collectionGuarantees = latestSealedBlock.collectionGuarantees;
    
    for (let guarantee of collectionGuarantees) {
      const collectionId = guarantee.collectionId;
      const collection = await fcl.send([fcl.getCollection(collectionId)]).then(fcl.decode);
    
      // Loop through the transaction IDs in the collection
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

        if(txPayer === flowAddress || txPayer === flowAddress2)
        {
          let message = `You've made a transaction on flow mainnet. Track the transaction here: https://flowscan.org/transaction/${transactionId}`
          sendTelegramMessage(1783859653, message)
          console.log("user is payer")
        }
        else{
          console.log("user is not payer")
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  console.log("done");
  setTimeout(main, 1000);
}
main();

const sendTelegramMessage = async (chatId, text) => {
  bot.sendMessage(chatId, text)
}