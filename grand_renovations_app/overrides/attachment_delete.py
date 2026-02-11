import frappe

@frappe.whitelist()
def delete_attachment_everywhere(file_url):
    """
    Delete all File records sharing same file_url
    """

    files = frappe.get_all(
        "File",
        filters={"file_url": file_url},
        fields=["name"]
    )

    if not files:
        return {"success": False}

    for f in files:
        frappe.delete_doc(
            "File",
            f.name,
            ignore_permissions=True,
            force=True
        )

    return {
        "success": True,
        "count": len(files)
    }
