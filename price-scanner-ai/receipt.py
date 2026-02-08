import os
import json
import google.generativeai as genai
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

def run_pipeline(image_path):
    '''Runs the entire pipeline: uploads image, generates receipt data, and saves it.'''

    if not os.path.exists(image_path):
        print(f'Image file {image_path} does not exist.')
        return
    
    try:
        connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        if not connect_str:
            raise ValueError('Azure Storage connection string is not set in environment variables.')
        
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        file_name = os.path.basename(image_path)
        # Χρήση του σωστού container name 'receipts-inbound'
        blob_client = blob_service_client.get_blob_client(container='receipts-inbound', blob=file_name)

        print(f'Uploading {file_name} to Azure..')
        with open(image_path, 'rb') as data:
            blob_client.upload_blob(data, overwrite=True)
        print('Complete.')

        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError('Gemini API key is not set in environment variables.')
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        img = Image.open(image_path)
        prompt = '''
        Analyze the following receipt image and extract the following information in JSON format in GR(Ελληνικά) language.
        The steps to follow are:
        1. Extract the name of every product listed on the receipt.
        2. Extract the price of every product listed on the receipt.(If the price is not listed, return null)
        3. Normalize the product names by removing any extra spaces  and converting them to lowercase.
        4. Normalize to remove any extra spaces, and keep only the title case of the product names and the price.
        We are not intersted in VAT or any other information that is not the name, price and quantity of the products.
        5. Return ONLY a valid JSON array of strings.
        6. Language of the output has to be in Greek ( GR - Ελληνικά).
        '''

        print('Generating receipt data with Gemini...')

        response = model.generate_content([prompt, img])

        raw_text = response.text
        clean_json = raw_text.replace('```json', '').replace('```', '').strip()
        
        product_list = json.loads(clean_json)

        print('Generated receipt data:')
        for idx, product in enumerate(product_list):
            name = product.get('name', 'N/A')
            price = product.get('price', 'N/A')
            print(f'{idx+1}. {name}: {price}€')

        return product_list
    
    except json.JSONDecodeError:
        print('Failed to decode JSON from Gemini response.')
    except Exception as e:
        print(f'An error occurred: {e}')

if __name__ == '__main__':
    image_path = 'receipt.jpg' 
    run_pipeline(image_path)