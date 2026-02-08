import os
import io
from PIL import Image
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

def analyze_receipt_professional(image_path):
    endpoint = ""
    key = ""
    if not os.path.exists(image_path):
        print(f"❌ Το αρχείο {image_path} δεν βρέθηκε.")
        return

    try:
        # 1. Resize/Compress την εικόνα αν είναι μεγάλη
        img = Image.open(image_path)
        img_byte_arr = io.BytesIO()
        
        # Αν η εικόνα είναι τεράστια, την κατεβάζουμε σε λογικά πλαίσια
        if max(img.size) > 4000:
            img.thumbnail((2000, 2000))
        
        # Συμπίεση σε JPEG για να πέσει το Content-Length
        img.save(img_byte_arr, format='JPEG', quality=85)
        img_data = img_byte_arr.getvalue()

        print(f"🤖 Ανάλυση (Μέγεθος: {len(img_data)/1024:.1f} KB)...")
        
        client = DocumentAnalysisClient(endpoint, AzureKeyCredential(key))
        
        # Στέλνουμε τα bytes αντί για το αρχείο απευθείας
        poller = client.begin_analyze_document("prebuilt-receipt", document=img_data)
        result = poller.result()

        print("\n🎯 ΑΚΡΙΒΗ ΑΠΟΤΕΛΕΣΜΑΤΑ:")
        for receipt in result.documents:
            merchant = receipt.fields.get("MerchantName")
            if merchant: print(f"🏪 Κατάστημα: {merchant.value}")

            items = receipt.fields.get("Items")
            if items:
                for item in items.value:
                    name = item.value.get("Description").value if item.value.get("Description") else "Άγνωστο"
                    price = item.value.get("TotalPrice").value if item.value.get("TotalPrice") else 0.0
                    print(f"- {name}: {price}€")

    except Exception as e:
        print(f"❌ Σφάλμα: {e}")

if __name__ == "__main__":
    analyze_receipt_professional("test_api.jpeg")