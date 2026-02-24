# import frappe

# def sync_file(doc, method=None):
#     """
#     When a file is attached to Lead / Survey / Quotation,
#     attach it to all related documents automatically.
#     """

#     if not doc.attached_to_doctype or not doc.attached_to_name:
#         return

#     targets = get_targets(doc.attached_to_doctype, doc.attached_to_name)

#     for doctype, name in targets:
#         if frappe.db.exists(
#             "File",
#             {
#                 "file_url": doc.file_url,
#                 "attached_to_doctype": doctype,
#                 "attached_to_name": name,
#             },
#         ):
#             continue

#         frappe.get_doc({
#             "doctype": "File",
#             "file_name": doc.file_name,
#             "file_url": doc.file_url,
#             "is_private": doc.is_private,
#             "attached_to_doctype": doctype,
#             "attached_to_name": name,
#         }).insert(ignore_permissions=True)


# def remove_file_everywhere(doc, method=None):
#     """
#     Remove same file_url from all linked documents
#     """

#     files = frappe.get_all(
#         "File",
#         filters={"file_url": doc.file_url},
#         pluck="name",
#     )

#     for f in files:
#         if f != doc.name:
#             frappe.delete_doc("File", f, ignore_permissions=True)


# def get_targets(doctype, name):
#     targets = []

#     if doctype == "Lead":
#         surveys = frappe.get_all("Survey", filters={"lead": name}, pluck="name")
#         quotations = frappe.get_all("Quotation", filters={"party_name": name}, pluck="name")
#         targets += [("Survey", s) for s in surveys]
#         targets += [("Quotation", q) for q in quotations]

#     elif doctype == "Survey":
#         survey = frappe.get_doc("Survey", name)
#         if survey.lead:
#             targets.append(("Lead", survey.lead))
#         quotations = frappe.get_all("Quotation", filters={"custom_survey": name}, pluck="name")
#         targets += [("Quotation", q) for q in quotations]

#     elif doctype == "Quotation":
#         quotation = frappe.get_doc("Quotation", name)
#         if quotation.party_name:
#             targets.append(("Lead", quotation.party_name))
#         if quotation.custom_survey:
#             targets.append(("Survey", quotation.custom_survey))

#     return targets
