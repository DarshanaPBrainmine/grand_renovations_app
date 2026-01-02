# import frappe

# def enable_sidebar_all_doctypes():
#     doctypes = ["Lead", "Opportunity", "Survey", "Quotation", "Sales Order"]

#     for doctype in doctypes:
#         dt = frappe.get_doc("DocType", doctype)

#         if not dt.allow_attach:
#             frappe.db.set_value("DocType", doctype, "allow_attach", 1)

#         if not dt.allow_comments:
#             frappe.db.set_value("DocType", doctype, "allow_comments", 1)

#         if not dt.track_seen:
#             frappe.db.set_value("DocType", doctype, "track_seen", 1)

#     frappe.db.commit()
#     frappe.clear_cache()
