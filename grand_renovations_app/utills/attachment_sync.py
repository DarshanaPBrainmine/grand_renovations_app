# import frappe


# def sync_attachments_across_chain(file_doc, method=None):
#     """
#     Whenever a file is attached to any CRM document,
#     sync it across Lead → Opportunity → Survey → Quotation → Sales Order
#     """

#     if not file_doc.attached_to_doctype or not file_doc.attached_to_name:
#         return

#     source_doctype = file_doc.attached_to_doctype
#     source_name = file_doc.attached_to_name

#     chain = get_related_documents(source_doctype, source_name)

#     for doctype, name in chain:
#         if doctype == source_doctype and name == source_name:
#             continue

#         exists = frappe.db.exists(
#             "File",
#             {
#                 "attached_to_doctype": doctype,
#                 "attached_to_name": name,
#                 "file_url": file_doc.file_url,
#             },
#         )

#         if not exists:
#             frappe.get_doc(
#                 {
#                     "doctype": "File",
#                     "file_name": file_doc.file_name,
#                     "file_url": file_doc.file_url,
#                     "is_private": file_doc.is_private,
#                     "attached_to_doctype": doctype,
#                     "attached_to_name": name,
#                 }
#             ).insert(ignore_permissions=True)


# def get_related_documents(doctype, name):
#     """
#     Returns all related documents in the CRM chain
#     """
#     docs = []

#     if doctype == "Lead":
#         docs.append(("Lead", name))

#         opportunities = frappe.get_all(
#             "Opportunity",
#             filters={"opportunity_from": "Lead", "party_name": name},
#             pluck="name",
#         )

#         for opp in opportunities:
#             docs.append(("Opportunity", opp))
#             docs.extend(_from_opportunity(opp))

#     elif doctype == "Opportunity":
#         docs.append(("Opportunity", name))
#         docs.extend(_from_opportunity(name))

#     elif doctype == "Survey":
#         survey = frappe.get_doc("Survey", name)
#         docs.append(("Survey", name))

#         if survey.opportunity:
#             docs.append(("Opportunity", survey.opportunity))
#             docs.extend(_from_opportunity(survey.opportunity))

#     elif doctype == "Quotation":
#         quotation = frappe.get_doc("Quotation", name)
#         docs.append(("Quotation", name))

#         if quotation.opportunity:
#             docs.append(("Opportunity", quotation.opportunity))
#             docs.extend(_from_opportunity(quotation.opportunity))

#     elif doctype == "Sales Order":
#         docs.append(("Sales Order", name))

#     return list(set(docs))


# def _from_opportunity(opportunity):
#     result = []

#     surveys = frappe.get_all("Survey", filters={"opportunity": opportunity}, pluck="name")
#     for s in surveys:
#         result.append(("Survey", s))

#     quotations = frappe.get_all("Quotation", filters={"opportunity": opportunity}, pluck="name")
#     for q in quotations:
#         result.append(("Quotation", q))

#     sales_orders = frappe.get_all(
#         "Sales Order",
#         filters={"items.prevdoc_docname": opportunity},
#         pluck="name",
#     )
#     for so in sales_orders:
#         result.append(("Sales Order", so))

#     return result
