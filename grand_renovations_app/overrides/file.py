# grand_renovations_app/overrides/file.py

def before_insert(doc, method=None):
    # Ensure mandatory fields exist
    if not doc.file_name and doc.file_url:
        doc.file_name = doc.file_url.split("/")[-1]
