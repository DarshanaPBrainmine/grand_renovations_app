import frappe

def on_submit(doc, method=None):
    """
    Sales Order submitted → Lead = Closed Won
    Fetch Lead via Quotation
    """

    # Get Quotation from Sales Order Item
    quotation = None
    for item in doc.items:
        if item.prevdoc_docname:
            quotation = item.prevdoc_docname
            break

    if not quotation:
        return

    # Get Lead from Quotation
    lead = frappe.db.get_value("Quotation", quotation, "lead")
    if not lead:
        return

    frappe.db.set_value("Lead", lead, "custom_stage", "Closed Won")
