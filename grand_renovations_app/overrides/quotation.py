import frappe

def after_insert(doc, method=None):
    """
    Quotation created → Lead = Quoted
    """
    if doc.lead:
        frappe.db.set_value(
            "Lead",
            doc.lead,
            "custom_stage",
            "Quoted"
        )
