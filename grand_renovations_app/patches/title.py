import frappe

def execute():
    frappe.db.set_value("DocType", "Survey", "title_field", "title")
    frappe.db.commit()
