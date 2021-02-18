const { FormRecognizerClient, FormTrainingClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const fs = require("fs")
const endpoint = "https://gsdp-formrecog.cognitiveservices.azure.com/";
const apiKey = "0176c0aa83a0451ea4aa8c0ae6845aa3";
const trainingClient = new FormTrainingClient(endpoint, new AzureKeyCredential(apiKey));
const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));

var flag = false;
var wasEmpty = false;
// Variables to hold data extracted from receipt
var user;

var receiptURL;
var clinicName;
var clinicNameConf = false; //1
var clinicAddress;
var clinicAddressConf = false; //2
var invoiceDate;
var invoiceDateConf = false; //3
var patient;
var items = [];
var itemsConf = false; //4

var containsElancoProduct = false;


// Variable to hold schema

const rebateData = require("./models/rebate.js");

const ElancoProducts =[
  "Atopica","cyclosporine capsules",
  "Bronchi-Shield Oral",
  "Clomicalm","clomipramine hydrochloride",
  "Comfortis","spinosad",
  "Credelio","lotilaner",
  "Deramaxx","deracoxib",
  "Duramune",
  "Duramune Lyme",
  "Entyce","capromorelin oral solution",
  "Galliprant","grapiprant tablets",
  "Interceptor","milbemycin oxime",
  "Interceptor Plus","milbemycin oxime/praziquantel",
  "Nocita","bupivacaine liposome injectable suspension",
  "Onsior","robenacoxib",
  "Onsior","robenacoxib injection",
  "Percorten-V","desoxycorticosterone pivalate injectable suspension",
  "Rabvac",
  "Surolan","miconazole nitrate, polymyxin B sulfate, prednisolone acetate",
  "Tanovea-ca1","rabacfosadine for injection",
  "Trifexis","spinosad + milbemycin oxime",
  "Ultra Duramune",
  "Verspon Absorbable Hemostatic Gelatin Sponge",
  "Zobuxa","enrofloxacin",
  "Atopica for Cats","cyclosporine oral solution USP Modified",
  "Cheristin for cats spinetoram",
  "Comfortis","spinosad",
  "Fel-O-Guard",
  "Fel-O-Vax",
  "Interceptor","milbemycin oxime",
  "Itrafungol","itraconazole oral solution",
  "MilbeMite OTIC Solution","0.1% milbemycin oxime",
  "Nocita","bupivacaine liposome injectable suspension",
  "Onsior","robenacoxib",
  "Onsior","robenacoxib injection",
  "Rabvac",
  "Ultra Fel-O-Vax",
  "Ultra Hybrid",
  "UltraNasal",
  "Verspon Absorbable Hemostatic Gelatin Sponge",
  "Zobuxa","enrofloxacin"];
  
  function compareItems(items){
    console.log("in compare items");

    if(items[0] != undefined){     

      //console.log(items[0].split(' '));
      
      for(let i = 0; i < ElancoProducts.length; i++){
        for(let j = 0; j < items.length; j++){
          var splitItems = items[j].split(' ')
          for(let n = 0; n < splitItems.length; n++){
            if(splitItems[n] === ElancoProducts[i]){
                console.log("out of loop.");
                console.log(items);
                return true;
                //this is where we would return pos and item.
            }
          }
        }
      }
        
        console.log("out of loop.");
        return false;
    }
    else{
      return false;
    }
  }


function confidenceAlert(confidence, which)
{
    if(confidence < 0.5){
    console.log("this needs checking.")
    
      switch(which){
          case 1:
              clinicNameConf = true;
          break;    
          case 2:
              clinicAddressConf = true;
          break; 
          case 3:
              invoiceDateConf = true;
          break; 
          case 4:
              itemsConf = true;
          break; 

      }
  }

}

async function prebuiltRecog(path){
        console.log('in prebuilt.');
        // You will need to set these environment variables or edit the following values
        const fileName = path;
      
        if (!fs.existsSync(fileName)) {
          throw new Error(`Expecting file ${fileName} exists`);
        }
      
        const readStream = fs.createReadStream(fileName);
      
        const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));
        const poller = await client.beginRecognizeReceipts(readStream, {
          contentType: "image/png",
          onProgress: (state) => {
            console.log(`status: ${state.status}`);
          }
        });
      
        const [receipt] = await poller.pollUntilDone();
      
        if (receipt === undefined) {
          throw new Error("Expecting at lease one receipt in analysis result");
        }
      
        // For a list of fields that are contained in the response, please refer to the "Supported fields" section at the following link: https://aka.ms/azsdk/formrecognizer/receiptfields
        const receiptTypeField = receipt.fields["ReceiptType"];
        if (receiptTypeField!=undefined)
        {
          if (receiptTypeField.valueType === "string") {
              console.log(
                `  Receipt Type: '${receiptTypeField.value || "<missing>"}', with confidence of ${
                  receiptTypeField.confidence
                }`
              );
            }
      
        }
        else
        {
            console.log('Unable to obtain receipt type, switching to custom model.')
            flag = true;
        }
      
        const merchantNameField = receipt.fields["MerchantName"];
        if (merchantNameField!=undefined)
        {
          if (merchantNameField.valueType === "string") {
              console.log(
                `  Vet Name: '${merchantNameField.value || "<missing>"}', with confidence of ${
                  merchantNameField.confidence
                }`
              );
              clinicName = merchantNameField.value;
              confidenceAlert(merchantNameField.confidence, 1);
            }
      
        }
        else
        {
            console.log('Unable to obtain vet/clinic name, switching to custom model.')
            flag = true;
        }
        // and then add for low confidence value too
        
      
        const transactionDate = receipt.fields["TransactionDate"];
        if (transactionDate!=undefined)
        {
          if (transactionDate.valueType === "date") {
              console.log(
                `  Transaction Date: '${transactionDate.value || "<missing>"}', with confidence of ${
                  transactionDate.confidence
                }`
              );
              invoiceDate = transactionDate.value;
              console.log("from prebuilt.");
              confidenceAlert(transactionDate.confidence, 3);
            }
      
        }
        else
        {
            console.log('Unable to obtain transaction date, switching to custom model.')
            flag = true;
        }
      
        const itemsField = receipt.fields["Items"];
        if (itemsField!=undefined)
        {
          if (itemsField.valueType === "array") {
              for (const itemField of itemsField.value || []) {
                if (itemField.valueType === "object") {
                  const itemNameField = itemField.value["Name"];
                  if (itemNameField.valueType === "string") {
                    console.log(
                      `    Item Name: '${itemNameField.value || "<missing>"}', with confidence of ${
                        itemNameField.confidence
                      }`
                    );
                    items.push(itemNameField.value);
                    confidenceAlert(itemsField.confidence, 4);
                  }
                  const itemTotalField = itemField.value["TotalPrice"];
                  if(itemTotalField.valueType == "number")
                  {
                      console.log(` Item total: ' ${itemTotalField.value || "<missing>"}', with confidence of ${ itemTotalField.confidence}`);
                  }
                }
              }
          }
          // guard against undefined inside too, as well as not being able to get a name, etc.
          else
          {
              console.log('Unable to obtain items, switching to custom model.')
              flag = true;
            }
          // else { pass through some kind of rejection, because items is not present on the prebuilt
      //then switch to custom model}
      // checklist: have we got items to a degree of confidence we're happy with? same for vet name, vet address and transaction date
      }
      const vetAddressField = receipt.fields["MerchantAddress"]
      if(vetAddressField!= undefined)
      {
          if(vetAddressField.valueType === "string")
          {
            console.log(`    Vet Address: '${vetAddressField.value || "<missing>"}', with confidence of ${
                vetAddressField.confidence
                }`);
            clinicAddress = vetAddressField.value;   
            confidenceAlert(vetAddressField.confidence, 2);
        }
      }
      else
      {
          console.log('Unable to obtain vet address, switching to custom model.')
          flag = true;
        }
        const totalField = receipt.fields["Total"];
        if (totalField!=undefined)
        {
          if (totalField.valueType === "number") {
              console.log(
                `  Total: '${totalField.value || "<missing>"}', with confidence of ${totalField.confidence}`
              );
            }
        }
        else
        {
            console.log('Unable to obtain total, switching to custom model.')
            flag = true;
        }
      
      }

async function recognizeCustom(path) {
    // Model ID from when you trained your model.

    const readStream = fs.createReadStream(path);

    var extractedData;

    const modelId = "88a81d58-91b1-4bf8-92c6-e05e59cf61ee";

    const formUrl = "https://raw.githubusercontent.com/Elanco-Group/ProtoReceiptFunctionality/master/receipt.pdf";


    const poller = await client.beginRecognizeCustomForms(modelId, readStream, {
        onProgress: (state) => { console.log(`status: ${state.status}`); }
    });
    const forms = await poller.pollUntilDone();

    console.log("Forms:");
    for (const form of forms || []) {
        console.log(`${form.formType}, page range: ${form.pageRange}`);

        console.log("Fields:");
        for (const fieldName in form.fields) {
            // each field is of type FormField
            const field = form.fields[fieldName];
            let temp = fieldName;

            if (temp == "Vet Name")
            {
                if(clinicName == null)
                {
                    clinicName = field.value;
                    console.log("Extracted = "+clinicName);
                    confidenceAlert(field.confidence, 1);
                }
            } 
            if (temp == "Vet Address")
            {
                if(clinicAddress == null)
                {
                    clinicAddress = field.value;
                    console.log("Extracted = "+clinicAddress);
                    confidenceAlert(field.confidence, 2);
                }
            } 
            if (temp == "TransactionDate")
            {
                if(invoiceDate == null)
                {
                    invoiceDate = field.value;
                    console.log("Extracted = "+invoiceDate);
                    confidenceAlert(field.confidence, 3);
                }
            }
            if (temp == "PetName")
            {
                if(patient == null)
                {
                    patient = field.value;
                    console.log("Extracted = " + patient);
                    //confidenceAlert(field.confidence);
                }
            }

            if(temp == "Items" || temp == "item-names")
            {
                //if(items.length == 0){
                //    wasEmpty = true;
                //}
                //if(wasEmpty){
                    items.push(field.value);
                    console.log ("Extracted = " + items);
                //}
                confidenceAlert(field.confidence, 4);
            }
               receiptURL = path;

            console.log(
                `Field ${fieldName} has value '${field.value}' with a confidence score of ${field.confidence}`
            );
        }
        
    }

}

async function testFunction(path)
{   

    await prebuiltRecog(path).catch((err) =>{
      console.error("The sample encountered an error:", err);
    });
     await recognizeCustom(path).catch((err) => {
        console.error("The sample encountered an error:", err);
    });

        
    // saves to database
  
    console.log(clinicNameConf);
    console.log(clinicAddressConf);
    console.log(invoiceDateConf);
    console.log(itemsConf);
    
    console.log(items);
    containsElancoProduct= compareItems(items);
    console.log(containsElancoProduct);
    console.log("at elanco products");
    
    
    // variables for exported function to return
    return {
        clinicName,
        clinicAddress,
        invoiceDate,
        patient,
        items,
        receiptURL,
        
        clinicNameConf,
        clinicAddressConf,
        invoiceDateConf,
        itemsConf,
        containsElancoProduct,
    } 
}

// export the function 
module.exports = testFunction