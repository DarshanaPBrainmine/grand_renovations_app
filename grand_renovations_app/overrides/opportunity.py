import frappe
from frappe import _
from datetime import datetime

# ----------------------------------------
# REQUIRED BY HOOKS
# ----------------------------------------
def onload(doc, method=None):
    pass


# ----------------------------------------
# SHOW SURVEY IN CONNECTIONS TAB
# ----------------------------------------
def get_dashboard_data(data=None):
    return {
        "fieldname": "opportunity",
        "transactions": [
            {"label": _("Related"), "items": ["Quotation", "Supplier Quotation"]},
            {"label": _("Survey"), "items": ["Survey"]},
        ],
    }


# ----------------------------------------
# CREATE SURVEY FROM OPPORTUNITY
# ----------------------------------------
@frappe.whitelist()
def create_survey_from_opportunity(opportunity_name):
    """
    Creates a new Survey doc with all fields fetched from Opportunity
    including Lead, Customer, and all custom fields.
    """
    opp = frappe.get_doc("Opportunity", opportunity_name)
    survey = frappe.new_doc("Survey")

    # BASIC
    survey.opportunity = opp.name              # this becomes a clickable link automatically
    survey.survey_date_time = datetime.now()

    # ----------------------------------------
    # FETCH LEAD (Correct + Clickable automatically)
    # ----------------------------------------
    if opp.opportunity_from == "Lead":
        survey.lead = opp.party_name           # CRM-LEAD-2025-00001
        lead_name = frappe.db.get_value("Lead", opp.party_name, "lead_name")
        survey.customer_name = lead_name if lead_name else opp.party_name

    # ----------------------------------------
    # FETCH CUSTOMER (Correct)
    # ----------------------------------------
    if opp.opportunity_from == "Customer":
        survey.customer = opp.party_name
        customer_name = frappe.db.get_value("Customer", opp.party_name, "customer_name")
        survey.customer_name = customer_name if customer_name else opp.party_name

    # ----------------------------------------
    # PROJECT FIELDS (CUSTOM FIELDS IN YOUR OPPORTUNITY)
    # ----------------------------------------
    survey.project_type = opp.get("custom_project_type")
    survey.property_type = opp.get("custom_property_type")
    survey.marketing_channel = opp.get("custom_marketing_channel")
    survey.postcode = opp.get("custom_postcode")

    # ----------------------------------------
    # MEASUREMENT FIELDS (Optional)
    # ----------------------------------------
    survey.length = opp.get("length")
    survey.width = opp.get("width")
    survey.height = opp.get("height")

    # ----------------------------------------
    # ADDRESS FIELDS
    # ----------------------------------------
    survey.city = opp.get("city")
    survey.state = opp.get("state")
    survey.country = opp.get("country")

    # RETURN DOCUMENT TO JS
    return survey.as_dict()




# import frappe
# from frappe import _
# from datetime import datetime


# # ---------------------------
# # REQUIRED BY HOOKS – keep it
# # ---------------------------
# def onload(doc, method=None):
#     pass


# # ---------------------------
# # Show Survey in Connections
# # ---------------------------
# def get_dashboard_data(data=None):
#     return {
#         "fieldname": "opportunity",
#         "transactions": [
#             {"label": _("Related"), "items": ["Quotation", "Supplier Quotation"]},
#             {"label": _("Survey"), "items": ["Survey"]},
#         ],
#     }


# # ---------------------------
# # Create Survey From Opportunity
# # ---------------------------
# @frappe.whitelist()
# def create_survey_from_opportunity(opportunity_name):
#     opp = frappe.get_doc("Opportunity", opportunity_name)
#     survey = frappe.new_doc("Survey")

#     # BASIC FIELDS
#     survey.opportunity = opp.name
#     survey.survey_date_time = datetime.now()

#     # CUSTOMER / LEAD LOGIC
#     if opp.opportunity_from == "Customer":
#         survey.customer = opp.party_name
#         customer_name = frappe.db.get_value("Customer", opp.party_name, "customer_name")
#         survey.customer_name = customer_name if customer_name else opp.party_name

#     elif opp.opportunity_from == "Lead":
#         survey.customer = opp.party_name
#         lead_name = frappe.db.get_value("Lead", opp.party_name, "lead_name")
#         survey.customer_name = lead_name if lead_name else opp.party_name

#     # PROJECT FIELDS
#     survey.project_type = opp.get("custom_project_type")
#     survey.property_type = opp.get("custom_property_type")
#     survey.marketing_channel = opp.get("custom_marketing_channel")
#     survey.postcode = opp.get("custom_postcode")

#     # MEASUREMENT FIELDS
#     survey.length = opp.get("length")
#     survey.width = opp.get("width")
#     survey.height = opp.get("height")

#     # ADDRESS FIELDS
#     survey.city = opp.get("city")
#     survey.state = opp.get("state")
#     survey.country = opp.get("country")

#     return survey.as_dict()


def after_insert(doc, method=None):
    """
    Opportunity created → Lead = Contacted
    """
    if doc.opportunity_from == "Lead" and doc.party_name:
        frappe.db.set_value(
            "Lead",
            doc.party_name,
            "custom_stage",
            "Contacted"
        )

@frappe.whitelist()
def mark_as_closed_lost(opportunity):
    frappe.db.set_value(
        "Opportunity",
        opportunity,
        "custom_stage",
        "Closed Lost"
    )
