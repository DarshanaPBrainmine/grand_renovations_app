# import frappe

# def sync_stage_from_lead(lead, stage):
#     """
#     Mirror Lead.custom_stage to all related documents
#     """

#     # Opportunity
#     frappe.db.set_value(
#         "Opportunity",
#         {"party_name": lead, "opportunity_from": "Lead"},
#         "custom_stage",
#         stage,
#         update_modified=False
#     )

#     # Survey
#     frappe.db.set_value(
#         "Survey",
#         {"lead": lead},
#         "custom_stage",
#         stage,
#         update_modified=False
#     )

#     # Quotation
#     frappe.db.set_value(
#         "Quotation",
#         {"lead": lead},
#         "custom_stage",
#         stage,
#         update_modified=False
#     )
