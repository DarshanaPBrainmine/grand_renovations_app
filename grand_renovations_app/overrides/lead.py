# # import frappe
# # from frappe import _

# # def get_dashboard_data(data=None):
# #     """
# #     Add Survey under Create button in Lead
# #     """
# #     return {
# #         "fieldname": "lead",
# #         "non_standard_fieldnames": {},
# #         "transactions": [
# #             {
# #                 "label": _("Create"),
# #                 "items": ["Survey"]
# #             },
# #             {
# #                 "label": _("Related Documents"),
# #                 "items": ["Quotation"]
# #             }
# #         ]
# #     }




    
# import frappe
# from frappe import _
# from frappe.model.mapper import get_mapped_doc

# def get_dashboard_data(data=None):
#     """
#     Customize Lead dashboard to show only Survey in Create button
#     """
#     return {
#         "fieldname": "lead",
#         "non_standard_fieldnames": {},
#         "transactions": [
#             {
#                 "label": _("Create"),
#                 "items": ["Survey"]
#             }
#         ]
#     }

# @frappe.whitelist()
# def create_survey_from_lead(source_name, target_doc=None):
#     """
#     Create Survey from Lead with proper field mapping
#     """
#     try:
#         lead_doc = frappe.get_doc("Lead", source_name)
        
#         # Create new Survey
#         survey = frappe.new_doc("Survey")
        
#         # Map Lead fields to Survey fields
#         survey.lead = lead_doc.name
        
#         # Map contact information
#         if hasattr(lead_doc, 'lead_name') and lead_doc.lead_name:
#             survey.customer = lead_doc.lead_name
            
#         if hasattr(lead_doc, 'email_id') and lead_doc.email_id:
#             survey.contact_email = lead_doc.email_id
            
#         if hasattr(lead_doc, 'mobile_no') and lead_doc.mobile_no:
#             survey.contact_mobile = lead_doc.mobile_no
            
#         if hasattr(lead_doc, 'company_name') and lead_doc.company_name:
#             survey.company_name = lead_doc.company_name
            
#         if hasattr(lead_doc, 'territory') and lead_doc.territory:
#             survey.territory = lead_doc.territory
            
#         if hasattr(lead_doc, 'source') and lead_doc.source:
#             survey.marketing_channel = lead_doc.source
        
#         # Map custom fields from Lead to Survey
#         custom_field_mapping = {
#             'custom_project_type': 'project_type',
#             'custom_property_type': 'property_type',
#             'custom_postcode': 'postcode',
#             'city': 'city',
#             'state': 'state',
#             'country': 'country'
#         }
        
#         for lead_field, survey_field in custom_field_mapping.items():
#             if hasattr(lead_doc, lead_field) and hasattr(survey, survey_field):
#                 value = getattr(lead_doc, lead_field)
#                 if value:
#                     setattr(survey, survey_field, value)
        
#         # Build address if available
#         address_parts = []
#         for field in ['address_line1', 'address_line2', 'city', 'state', 'country']:
#             if hasattr(lead_doc, field):
#                 value = getattr(lead_doc, field)
#                 if value:
#                     address_parts.append(value)
        
#         if address_parts and hasattr(survey, 'address_display'):
#             survey.address_display = ", ".join(address_parts)
        
#         frappe.logger().info(f"Created survey from lead: {source_name}")
        
#         return survey.as_dict()
        
#     except Exception as e:
#         frappe.log_error(
#             title="Survey Creation from Lead Failed",
#             message=f"Lead: {source_name}\nError: {str(e)}\n{frappe.get_traceback()}"
#         )
#         frappe.throw(_("Error creating survey from lead: {0}").format(str(e)))



import frappe
from frappe import _

def get_dashboard_data(data=None):
    """
    Override Lead dashboard to ONLY show Survey in Create button
    Remove Opportunity, Customer, and Prospect
    """
    return {
        "fieldname": "lead",
        "non_standard_fieldnames": {},
        "transactions": [
            {
                "label": _("Create"),
                "items": ["Survey"]
            }
        ]
    }

@frappe.whitelist()
def create_survey_from_lead(source_name, target_doc=None):
    """
    Create Survey from Lead with proper field mapping
    """
    try:
        lead_doc = frappe.get_doc("Lead", source_name)
        
        # Create new Survey
        survey = frappe.new_doc("Survey")
        
        # MUST set lead field
        survey.lead = lead_doc.name
        
        # Map contact information
        if hasattr(lead_doc, 'lead_name') and lead_doc.lead_name:
            survey.customer = lead_doc.lead_name
            
        if hasattr(lead_doc, 'email_id') and lead_doc.email_id:
            survey.contact_email = lead_doc.email_id
            
        if hasattr(lead_doc, 'mobile_no') and lead_doc.mobile_no:
            survey.contact_mobile = lead_doc.mobile_no
            
        if hasattr(lead_doc, 'company_name') and lead_doc.company_name:
            survey.company_name = lead_doc.company_name
            
        if hasattr(lead_doc, 'territory') and lead_doc.territory:
            survey.territory = lead_doc.territory
            
        if hasattr(lead_doc, 'source') and lead_doc.source:
            survey.marketing_channel = lead_doc.source
        
        # Map custom fields
        custom_field_mapping = {
            'custom_project_type': 'project_type',
            'custom_property_type': 'property_type',
            'custom_postcode': 'postcode',
        }
        
        for lead_field, survey_field in custom_field_mapping.items():
            if hasattr(lead_doc, lead_field) and hasattr(survey, survey_field):
                value = getattr(lead_doc, lead_field)
                if value:
                    setattr(survey, survey_field, value)
        
        frappe.logger().info(f"Survey created from Lead: {source_name}")
        
        return survey.as_dict()
        
    except Exception as e:
        frappe.log_error(
            title="Survey Creation from Lead Failed",
            message=f"Lead: {source_name}\nError: {str(e)}\n{frappe.get_traceback()}"
        )
        frappe.throw(_("Error creating survey: {0}").format(str(e)))





        # ========================================
# FILE: lead.py
# PATH: grand_renovations_app/overrides/lead.py
# ========================================

import frappe
from frappe import _
from erpnext.crm.doctype.lead.lead import Lead

# Override the default Lead list query
def get_list_context(context):
    """Override list context to exclude status field"""
    context.no_cache = 1

# Patch the Lead doctype's list fields
@frappe.whitelist()
def override_lead_list_fields():
    """Remove status from Lead's default list fields"""
    try:
        # Method 1: Update DocType meta
        doc = frappe.get_doc("DocType", "Lead")
        
        # Find and remove status from default list fields
        for field in doc.fields:
            if field.fieldname == "status":
                field.in_list_view = 0
                field.in_standard_filter = 0
        
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        
        print("✓ Status field removed from Lead list view")
        return {"success": True, "message": "Status field hidden successfully"}
        
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Lead Status Hide Error")
        return {"success": False, "message": str(e)}