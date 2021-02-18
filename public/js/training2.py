import os
from azure.core.exceptions import ResourceNotFoundError
from azure.ai.formrecognizer import FormRecognizerClient
from azure.ai.formrecognizer import FormTrainingClient
from azure.core.credentials import AzureKeyCredential


class RecognizeCustomForms(object):

    def recognize_custom_forms(self):
        path_to_sample_forms = os.path.join('receipt.pdf')
        # [START recognize_custom_forms]
        from azure.core.credentials import AzureKeyCredential
        from azure.ai.formrecognizer import FormRecognizerClient

        endpoint = 'https://gsdp-formrecog.cognitiveservices.azure.com/'
        key = '0176c0aa83a0451ea4aa8c0ae6845aa3'
        model_id = 'b131c408-ad86-424b-aa01-388b98a48d9d'

        form_recognizer_client = FormRecognizerClient(
            endpoint=endpoint, credential=AzureKeyCredential(key)
        )

        # Make sure your form's type is included in the list of form types the custom model can recognize
        with open(path_to_sample_forms, "rb") as f:
            poller = form_recognizer_client.begin_recognize_custom_forms(
                model_id=model_id, form=f
            )
        forms = poller.result()
        # we will eventually use confidence scores to decide whether to reject/accept customer data
        #90%/0.9 threshold for 'good' - subject to change
        #potentially anything below 70% and customer is asked to try again

        for idx, form in enumerate(forms):
            print("--------Recognizing Form #{}--------".format(idx+1))
            # clinicName = receipt.fields.get("clinic name")
            #     if clinicName:
            #     print("The clinic name is: {}" .format(clinicName.value))
            print("Form has type {}".format(form.form_type))
            # print("Form has form type confidence {}".format(form.form_type_confidence))
            # print("Form was analyzed with model with ID {}".format(form.model_id))
            clinic_address = form.fields.get("clinic address")
            if clinic_address:
                print("Clinic address: {}".format(clinic_address.value))
            
            clinicName = form.fields.get("clinic name")
            if clinicName:
                print("Clinic name: {}" .format(clinicName.value))

            items = form.fields.get("item-names")
            # items_string = items.value
            # split = items_string.split()
            # items: fixing this later (afternoon) to split into individual;s, waiting on Elanco

            # can we access the split parts individually? possible solution
            if items:
                print("\t - Item Name: {}".format(items.value))
            prices = form.fields.get("prices")
            # prices_string = prices.value
            # prices_split = prices_string.split()
            #accessing individual values here? split by space, assign to decimal array
            
            if prices:
                print("\t - Price: {}".format(prices.value))
            invoiceDate = form.fields.get("invoice date")
            if invoiceDate:
                print("\t - Invoice Date: {}".format(invoiceDate.value))
                patientName = form.fields.get("patientName")
            if patientName:
                print("\t - Patient Name: {}".format(patientName.value))
                
            microchip = form.fields.get("microchip")
            customerName = form.fields.get("customer name")
            if customerName:
                print("\t - Customer Name: {}".format(customerName.value))
                
                
            transactionNo = form.fields.get("transaction no")
            if transactionNo:
                print("Transaction number: {}".format(transactionNo.value))
            quantity = form.fields.get("quantity")
            if quantity:
                print("quantity: {}".format(quantity.value))
            # for name, field in form.fields.items():
            #     # each field is of type FormField
            #     # label_data is populated if you are using a model trained without labels,
            #     # since the service needs to make predictions for labels if not explicitly given to it.
        


            #     # if items:
            #     #     for idx, item in enumerate(form.fields.get("item names").value):
            #     #         print("\tItem #{}".format(idx+1))
            #     #         item_name = form.fields.get("item names")
            #     #         if item_name:
            #     #             print("\t - Name: {}".format(items.value))
            #     #         item_price = form.fields.get("price")
            #     #         if item_price:
            #     #             print("\t- Price: {}".format(item_price.value))
                




            #     if field.label_data:
            #         print("...Field '{}' has label '{}' with a confidence score of {}".format(
            #             name,
            #             field.label_data.text,
            #             field.confidence
            #         ))

            #     print("...Label '{}' has value '{}' with a confidence score of {}".format(
            #         field.label_data.text if field.label_data else name, field.value, field.confidence
            #     ))

            # print("-----------------------------------")
        # [END recognize_custom_forms]


if __name__ == '__main__':
    sample = RecognizeCustomForms()
    sample.recognize_custom_forms()