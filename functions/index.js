// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// openai 
const {Configuration, OpenAIApi} = require("openai");

const configuration= new Configuration({
  apiKey:"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"
});
const openai= new OpenAIApi(configuration);

initializeApp();


exports.makeuppercase = onDocumentUpdated("/chat/{documentId}", async(event) => {

  console.log('added new doc!', event.data.after.data());
  const afterData= event.data.after.data();
  const docId= event.params.documentId;
  console.log('doc id: ',docId);
  for(let key in afterData){
    let value= afterData[key]
    let item= value[value.length-1];
    console.log('item: ',value);
    console.log('here1:  ', item)
    console.log('here2:  ', item['content'])
    console.log('here2:  ', item['role'])
    if(value[value.length-1].role=='user'){
        console.log('should say this', key);
        const completion= await openai.createChatCompletion({
          model:"gpt-3.5-turbo",
          messages: [{role:'system', content:'You are a cute anime girl who is here to make friends.'}, ...value]
        })
        console.log(completion.data.choices[0].message)
        afterData[key]=[...value, {role:'system', content:completion.data.choices[0].message.content}]
        console.log(afterData);
        const writeResult= await getFirestore()
          .collection("chat")
          .doc(docId)
          .set(afterData);
    }else{
        console.log('no need to add here! its the server write')
    }
  }
  return 0
});