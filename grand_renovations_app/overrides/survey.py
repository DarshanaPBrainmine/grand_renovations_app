
# File: grand_renovations_app/grand_renovations_app/overrides/survey.py

import frappe
from frappe import _

def get_dashboard_data(data=None):
    """
    Add Quotation link in Survey's Connections tab
    """
    return {
        "fieldname": "survey",
        "non_standard_fieldnames": {},
        "transactions": [
            {
                "label": _("Related Documents"),
                "items": ["Quotation"]
            }
        ]
    }

@frappe.whitelist()
def debug_quotation_fields():
    """
    Debug helper to see what fields exist in Quotation
    """
    quotation_meta = frappe.get_meta("Quotation")
    fields = {}
    
    for field in quotation_meta.fields:
        fields[field.fieldname] = {
            'label': field.label,
            'fieldtype': field.fieldtype
        }
    
    return fields

@frappe.whitelist()
def create_quotation_from_survey(survey_name):
    """
    Create a Quotation from Survey with all relevant data pre-filled
    """
    try:
        survey = frappe.get_doc("Survey", survey_name)
        quotation = frappe.new_doc("Quotation")

        # Log survey data for debugging
        frappe.logger().info(f"Creating quotation from survey: {survey_name}")
        frappe.logger().info(f"Survey data: {survey.as_dict()}")

        # -----------------------------
        # CUSTOMER / LEAD HANDLING
        # -----------------------------
        customer = None

        # Try to get customer from lead
        if hasattr(survey, 'lead') and survey.lead:
            customer = frappe.db.get_value("Customer", {"lead_name": survey.lead}, "name")
            if not customer:
                customer = create_customer_from_lead(survey.lead)
                frappe.msgprint(_("Created new Customer from Lead: {0}").format(customer))

        # Try to get customer from opportunity
        elif hasattr(survey, 'opportunity') and survey.opportunity:
            opportunity = frappe.get_doc("Opportunity", survey.opportunity)
            if hasattr(opportunity, 'opportunity_from') and opportunity.opportunity_from == "Customer":
                customer = opportunity.party_name
            elif hasattr(opportunity, 'party_type') and opportunity.party_type == "Customer":
                customer = opportunity.party_name

        # Try to get customer directly from survey
        elif hasattr(survey, 'customer') and survey.customer:
            customer = survey.customer

        if not customer:
            frappe.throw(_("Cannot create Quotation: No Customer found. Please link a Customer, Lead, or Opportunity first."))

        # Set customer in quotation
        quotation.quotation_to = "Customer"
        quotation.party_name = customer
        
        # Get customer name
        if customer:
            customer_doc = frappe.get_doc("Customer", customer)
            quotation.customer_name = customer_doc.customer_name

        # -----------------------------
        # LINK DOCUMENTS
        # -----------------------------
        # Standard fields
        if hasattr(survey, 'opportunity') and survey.opportunity:
            quotation.opportunity = survey.opportunity
        
        # Custom survey field
        if hasattr(quotation, 'survey'):
            quotation.survey = survey.name
        elif hasattr(quotation, 'custom_survey'):
            quotation.custom_survey = survey.name

        # Lead field
        if hasattr(survey, 'lead') and survey.lead:
            if hasattr(quotation, 'lead'):
                quotation.lead = survey.lead

        # -----------------------------
        # PROJECT FIELDS
        # -----------------------------
        # Try both standard and custom_ prefixed fields
        project_fields = [
            ('project_type', ['project_type', 'custom_project_type']),
            ('property_type', ['property_type', 'custom_property_type']),
            ('postcode', ['postcode', 'custom_postcode']),
            ('marketing_channel', ['marketing_channel', 'custom_marketing_channel']),
        ]
        
        for survey_field, possible_quotation_fields in project_fields:
            if hasattr(survey, survey_field):
                value = getattr(survey, survey_field)
                if value:
                    # Try each possible field name
                    for quot_field in possible_quotation_fields:
                        if hasattr(quotation, quot_field):
                            setattr(quotation, quot_field, value)
                            frappe.logger().info(f"Set {quot_field} = {value}")
                            break

        # -----------------------------
        # ADDRESS / SITE ADDRESS
        # -----------------------------
        site_address_fields = ['site_address', 'custom_site_address', 'project_site_address']
        
        # Build address from survey
        address_parts = []
        if hasattr(survey, 'address_display') and survey.address_display:
            address_parts.append(survey.address_display)
        else:
            if hasattr(survey, 'city') and survey.city:
                address_parts.append(survey.city)
            if hasattr(survey, 'state') and survey.state:
                address_parts.append(survey.state)
            if hasattr(survey, 'country') and survey.country:
                address_parts.append(survey.country)
        
        if address_parts:
            full_address = ", ".join(address_parts)
            for field_name in site_address_fields:
                if hasattr(quotation, field_name):
                    setattr(quotation, field_name, full_address)
                    frappe.logger().info(f"Set {field_name} = {full_address}")
                    break

        # -----------------------------
        # MEASUREMENTS
        # -----------------------------
        measurement_mapping = [
            ('length_m', ['length_m', 'custom_length_m', 'custom_length']),
            ('width_m', ['width_m', 'custom_width_m', 'custom_width']),
            ('height_m', ['height_m', 'custom_height_m', 'custom_height']),
        ]
        
        for survey_field, possible_quot_fields in measurement_mapping:
            if hasattr(survey, survey_field):
                value = getattr(survey, survey_field)
                if value:
                    for quot_field in possible_quot_fields:
                        if hasattr(quotation, quot_field):
                            setattr(quotation, quot_field, value)
                            frappe.logger().info(f"Set {quot_field} = {value}")
                            break

        # -----------------------------
        # PROJECT SUMMARY / NOTES
        # -----------------------------
        summary_fields = ['project_summary', 'custom_project_summary', 'description']
        
        summary = ""
        if hasattr(survey, 'recommendations') and survey.recommendations:
            summary = survey.recommendations
        elif hasattr(survey, 'notes') and survey.notes:
            summary = survey.notes
        elif hasattr(survey, 'survey_notes') and survey.survey_notes:
            summary = survey.survey_notes
        
        if summary:
            for field_name in summary_fields:
                if hasattr(quotation, field_name):
                    setattr(quotation, field_name, summary)
                    frappe.logger().info(f"Set {field_name} = {summary[:50]}...")
                    break

        # -----------------------------
        # CONTACT INFO
        # -----------------------------
        contact_mapping = [
            ('contact_person', ['contact_person', 'custom_contact_person']),
            ('contact_email', ['contact_email', 'custom_contact_email']),
            ('contact_mobile', ['contact_mobile', 'custom_contact_mobile']),
        ]
        
        for survey_field, possible_quot_fields in contact_mapping:
            if hasattr(survey, survey_field):
                value = getattr(survey, survey_field)
                if value:
                    for quot_field in possible_quot_fields:
                        if hasattr(quotation, quot_field):
                            setattr(quotation, quot_field, value)
                            break

        # -----------------------------
        # ITEM (sample)
        # -----------------------------
        project_type = getattr(survey, 'project_type', 'Survey Project')
        description = summary or 'Survey based renovation project'
        
        quotation.append("items", {
            "item_code": None,
            "item_name": f"Renovation - {project_type}",
            "description": description,
            "qty": 1,
            "rate": 0,
            "uom": "Nos"
        })

        frappe.logger().info(f"Quotation created successfully: {quotation.as_dict()}")

        # Return the quotation as dict (don't save yet)
        return quotation.as_dict()

    except Exception as e:
        error_msg = f"Error creating quotation from survey {survey_name}: {str(e)}"
        frappe.log_error(
            title="Quotation Creation Error",
            message=f"{error_msg}\n\nTraceback:\n{frappe.get_traceback()}"
        )
        frappe.throw(_(error_msg))


def create_customer_from_lead(lead_name):
    """
    Create a Customer from a Lead
    """
    try:
        lead = frappe.get_doc("Lead", lead_name)

        customer = frappe.new_doc("Customer")
        customer.customer_name = lead.lead_name or lead.company_name or lead.first_name
        customer.lead_name = lead.name
        customer.customer_type = "Individual" if lead.lead_name else "Company"
        
        # Copy contact details
        if hasattr(lead, 'email_id') and lead.email_id:
            customer.email_id = lead.email_id
        if hasattr(lead, 'mobile_no') and lead.mobile_no:
            customer.mobile_no = lead.mobile_no
        if hasattr(lead, 'phone') and lead.phone:
            customer.phone = lead.phone
        
        customer.flags.ignore_permissions = True
        customer.save()
        frappe.db.commit()

        return customer.name

        

    except Exception as e:
        frappe.log_error(f"Error creating customer from lead: {str(e)}")
        frappe.throw(_("Error creating customer from lead: {0}").format(str(e)))









# import frappe
# from frappe.desk.form.assign_to import add as add_assignment

# def create_calendar_event(doc, method=None):
#     """
#     Create ERPNext Event + sync with ONE shared Google Calendar.
#     Event title is human-readable (no IDs).
#     """

#     # --------------------------------------------------
#     # VALIDATIONS
#     # --------------------------------------------------
#     if not doc.surveyor:
#         return

#     if not doc.survey_start_date or not doc.survey_end_date:
#         return

#     # --------------------------------------------------
#     # BUILD HUMAN-READABLE TITLE
#     # --------------------------------------------------
#     title_parts = []

#     if getattr(doc, "title", None):
#         title_parts.append(doc.title)

#     if getattr(doc, "project_type", None):
#         title_parts.append(doc.project_type)

#     # Fallback (just in case)
#     if not title_parts:
#         title_parts.append("Survey")

#     event_title = "Survey Assigned: " + " – ".join(title_parts)

#     # Prevent duplicate events
#     if frappe.db.exists("Event", {"subject": event_title}):
#         return

#     # --------------------------------------------------
#     # CREATE EVENT
#     # --------------------------------------------------
#     event = frappe.new_doc("Event")
#     event.subject = event_title
#     event.event_type = "Private"
#     event.starts_on = doc.survey_start_date
#     event.ends_on = doc.survey_end_date

#     event.description = f"""
# Survey Title: {doc.title or '—'}
# Project Type: {doc.project_type or '—'}
# Lead: {doc.lead or '—'}
# Opportunity: {doc.opportunity or '—'}
# Notes: {doc.notes or '—'}
#     """

#     # --------------------------------------------------
#     # ASSIGN TO SURVEYOR (ERPNext SIDE)
#     # --------------------------------------------------
#     event.append("event_participants", {
#         "reference_doctype": "User",
#         "reference_docname": doc.surveyor
#     })

#     # --------------------------------------------------
#     # USE SHARED GOOGLE CALENDAR
#     # --------------------------------------------------
#     shared_calendar = frappe.db.get_value(
#         "Google Calendar",
#         {
#             "enable": 1,
#             "push_to_google_calendar": 1,
#             "name": "Grand renovation"  # MUST match exactly
#         },
#         "name"
#     )

#     if not shared_calendar:
#         frappe.throw(
#             "Shared Google Calendar 'Grand renovation' is not configured or not enabled"
#         )

#     event.google_calendar = shared_calendar
#     event.sync_with_google_calendar = 1

#     # --------------------------------------------------
#     # LINK EVENT BACK TO SURVEY
#     # --------------------------------------------------
#     event.append("links", {
#         "link_doctype": "Survey",
#         "link_name": doc.name
#     })

#     # --------------------------------------------------
#     # SAVE EVENT
#     # --------------------------------------------------
#     event.insert(ignore_permissions=True)

#     # --------------------------------------------------
#     # ASSIGN FOR ERPNext NOTIFICATIONS
#     # --------------------------------------------------
#     add_assignment({
#         "assign_to": [doc.surveyor],
#         "doctype": "Event",
#         "name": event.name
#     })



# # def after_insert(doc, method=None):
# #     """
# #     Survey created → Lead = Survey Booked
# #     """
# #     if doc.lead:
# #         frappe.db.set_value(
# #             "Lead",
# #             doc.lead,
# #             "custom_stage",
# #             "Survey Booked"
# #         )





# import frappe
# from frappe.desk.form.assign_to import add as add_assignment
# from urllib.parse import quote_plus


# # --------------------------------------------------
# # Build Google Maps postcode link (UK ONLY)
# # --------------------------------------------------
# def build_postcode_lookup_link(postcode):
#     if not postcode:
#         return ""

#     # Force UK context
#     query = f"{postcode}, United Kingdom"
#     return f"https://www.google.com/maps/search/?api=1&query={quote_plus(query)}"


# # --------------------------------------------------
# # Create / Update Calendar Event
# # --------------------------------------------------
# def create_calendar_event(doc, method=None):

#     # -----------------------------
#     # BASIC VALIDATIONS
#     # -----------------------------
#     if not doc.surveyor:
#         return

#     if not doc.survey_start_date or not doc.survey_end_date:
#         return

#     # -----------------------------
#     # BUILD EVENT TITLE
#     # -----------------------------
#     title_parts = []

#     if getattr(doc, "title", None):
#         title_parts.append(doc.title)

#     if getattr(doc, "project_type", None):
#         title_parts.append(doc.project_type)

#     if not title_parts:
#         title_parts.append("Survey")

#     event_title = "Survey Assigned: " + " – ".join(title_parts)

#     # -----------------------------
#     # FIND EXISTING EVENT (OR CREATE)
#     # -----------------------------
#     existing_event_name = frappe.db.get_value(
#         "Event",
#         {"subject": event_title},
#         "name"
#     )

#     if existing_event_name:
#         event = frappe.get_doc("Event", existing_event_name)
#     else:
#         event = frappe.new_doc("Event")
#         event.subject = event_title
#         event.event_type = "Private"

#     # Always update timings
#     event.starts_on = doc.survey_start_date
#     event.ends_on = doc.survey_end_date

#     # -----------------------------
#     # BUILD DESCRIPTION
#     # -----------------------------
#     description = f"""
# Survey Title: {doc.title or '—'}
# Project Type: {doc.project_type or '—'}
# Lead: {doc.lead or '—'}
# Opportunity: {doc.opportunity or '—'}
# Notes: {doc.notes or '—'}
# """

#     # -----------------------------
#     # POSTCODE MAP LINK (UK ONLY)
#     # -----------------------------
#     postcode_value = (
#         getattr(doc, "postcode", None)
#         or getattr(doc, "custom_postcode", None)
#     )

#     postcode_link = build_postcode_lookup_link(postcode_value)

#     if postcode_link:
#         description += f"""

# 📍 View properties at this UK postcode:
# {postcode_link}
# """

#     event.description = description.strip()

#     # -----------------------------
#     # EVENT PARTICIPANT
#     # -----------------------------
#     if not event.get("event_participants"):
#         event.append("event_participants", {
#             "reference_doctype": "User",
#             "reference_docname": doc.surveyor
#         })

#     # -----------------------------
#     # GOOGLE CALENDAR CONFIG
#     # -----------------------------
#     shared_calendar = frappe.db.get_value(
#         "Google Calendar",
#         {
#             "enable": 1,
#             "push_to_google_calendar": 1,
#             "name": "Grand renovation"
#         },
#         "name"
#     )

#     if not shared_calendar:
#         frappe.throw(
#             "Shared Google Calendar 'Grand renovation' is not configured or enabled"
#         )

#     event.google_calendar = shared_calendar
#     event.sync_with_google_calendar = 1

#     # -----------------------------
#     # LINK EVENT BACK TO SURVEY
#     # -----------------------------
#     if not event.get("links"):
#         event.append("links", {
#             "link_doctype": "Survey",
#             "link_name": doc.name
#         })

#     # 🔑 FORCE GOOGLE CALENDAR UPDATE
#     event.flags.update({"update_google_calendar": True})

#     # -----------------------------
#     # SAVE EVENT
#     # -----------------------------
#     event.save(ignore_permissions=True)

#     # -----------------------------
#     # ASSIGN SURVEYOR (ONLY ON CREATE)
#     # -----------------------------
#     if not existing_event_name:
#         add_assignment({
#             "assign_to": [doc.surveyor],
#             "doctype": "Event",
#             "name": event.name
#         })




import frappe
from frappe.desk.form.assign_to import add as add_assignment


def create_calendar_event(doc, method=None):

    # -------------------------------------------------
    # FIND EXISTING EVENT LINKED TO SURVEY
    # -------------------------------------------------
    event_name = frappe.db.get_value(
        "Event Link",
        {
            "link_doctype": "Survey",
            "link_name": doc.name
        },
        "parent"
    )

    # -------------------------------------------------
    # HARD REQUIREMENTS
    # -------------------------------------------------
    if not (doc.surveyor and doc.survey_start_date):
        if event_name:
            frappe.delete_doc(
                "Event",
                event_name,
                ignore_permissions=True,
                force=True
            )
        return

    # -------------------------------------------------
    # CREATE OR UPDATE EVENT
    # -------------------------------------------------
    if event_name:
        event = frappe.get_doc("Event", event_name)
        is_new = False
    else:
        event = frappe.new_doc("Event")
        event.event_type = "Private"
        is_new = True

    # -------------------------------------------------
    # SUBJECT
    # -------------------------------------------------
    subject_parts = []
    if doc.title:
        subject_parts.append(doc.title)
    if doc.project_type:
        subject_parts.append(doc.project_type)

    event.subject = "Survey Assigned: " + " – ".join(subject_parts or ["Survey"])

    # -------------------------------------------------
    # DATE LOGIC (NO HOURS)
    # -------------------------------------------------
    event.starts_on = doc.survey_start_date

    if doc.survey_end_date:
        # Timed / multi-day event
        event.ends_on = doc.survey_end_date
        event.all_day = 0
    else:
        # ALL-DAY event (single date)
        event.ends_on = doc.survey_start_date
        event.all_day = 1

    # -------------------------------------------------
    # DESCRIPTION (ONLY LEAD)
    # -------------------------------------------------
    event.description = f"""
Survey Title: {doc.title or '—'}
Project Type: {doc.project_type or '—'}
Lead: {doc.lead or '—'}
Notes: {doc.notes or '—'}
""".strip()

    # -------------------------------------------------
    # PARTICIPANT
    # -------------------------------------------------
    event.event_participants = []
    event.append("event_participants", {
        "reference_doctype": "User",
        "reference_docname": doc.surveyor
    })

    # -------------------------------------------------
    # LINK EVENT TO SURVEY
    # -------------------------------------------------
    event.links = []
    event.append("links", {
        "link_doctype": "Survey",
        "link_name": doc.name
    })

    # -------------------------------------------------
    # GOOGLE CALENDAR
    # -------------------------------------------------
    calendar = frappe.db.get_value(
        "Google Calendar",
        {
            "enable": 1,
            "push_to_google_calendar": 1,
            "name": "Grand renovation"
        },
        "name"
    )

    if calendar:
        event.google_calendar = calendar
        event.sync_with_google_calendar = 1
        event.flags.update({"update_google_calendar": True})

    # -------------------------------------------------
    # SAVE EVENT
    # -------------------------------------------------
    if is_new:
        event.insert(ignore_permissions=True)
    else:
        event.save(ignore_permissions=True)

    # -------------------------------------------------
    # ASSIGN SURVEYOR (ONLY ON CREATE)
    # -------------------------------------------------
    if is_new:
        add_assignment({
            "assign_to": [doc.surveyor],
            "doctype": "Event",
            "name": event.name
        })
