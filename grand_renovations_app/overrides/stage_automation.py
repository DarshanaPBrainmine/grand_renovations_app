# # File: grand_renovations_app/grand_renovations_app/overrides/stage_automation.py

# import frappe
# from frappe import _


# # ============================================
# # LEAD: Set Initial Stage to "New"
# # ============================================
# def set_lead_initial_stage(doc, method=None):
#     """
#     When a Lead is created, set initial stage to 'New'
#     """
#     if not doc.custom_stage:
#         doc.custom_stage = "New"
#         doc.save(ignore_permissions=True)
#         frappe.db.commit()


# # ============================================
# # LEAD → OPPORTUNITY: Update Stage to "Contacted"
# # ============================================
# def update_lead_stage_on_opportunity(doc, method=None):
#     """
#     When an Opportunity is created from a Lead,
#     update the Lead's custom_stage to 'Contacted'
#     """
#     if doc.opportunity_from == "Lead" and doc.party_name:
#         try:
#             lead = frappe.get_doc("Lead", doc.party_name)
            
#             # Update to Contacted
#             lead.custom_stage = "Contacted"
#             lead.save(ignore_permissions=True)
#             frappe.db.commit()
            
#             # Also set Opportunity stage to Contacted
#             doc.custom_stage = "Contacted"
#             doc.save(ignore_permissions=True)
#             frappe.db.commit()
            
#             frappe.msgprint(
#                 f"Lead stage updated to 'Contacted'",
#                 alert=True,
#                 indicator="blue"
#             )
#         except Exception as e:
#             frappe.log_error(
#                 title="Lead Stage Update Failed",
#                 message=f"Error updating lead {doc.party_name}: {str(e)}"
#             )


# # ============================================
# # OPPORTUNITY → SURVEY: Update Stage to "Survey Booked"
# # ============================================
# def update_opportunity_stage_on_survey(doc, method=None):
#     """
#     When a Survey is created from an Opportunity,
#     update the Opportunity's custom_stage to 'Survey Booked'
#     """
#     if doc.opportunity:
#         try:
#             opportunity = frappe.get_doc("Opportunity", doc.opportunity)
            
#             # Update opportunity stage
#             opportunity.custom_stage = "Survey Booked"
#             opportunity.save(ignore_permissions=True)
#             frappe.db.commit()
            
#             # Set survey stage to Survey Booked
#             doc.custom_stage = "Survey Booked"
#             doc.save(ignore_permissions=True)
#             frappe.db.commit()
            
#             frappe.msgprint(
#                 f"Opportunity stage updated to 'Survey Booked'",
#                 alert=True,
#                 indicator="blue"
#             )
            
#             # ALSO update the Lead if exists
#             if opportunity.opportunity_from == "Lead" and opportunity.party_name:
#                 lead = frappe.get_doc("Lead", opportunity.party_name)
#                 lead.custom_stage = "Survey Booked"
#                 lead.save(ignore_permissions=True)
#                 frappe.db.commit()
                
#         except Exception as e:
#             frappe.log_error(
#                 title="Opportunity Stage Update Failed",
#                 message=f"Error updating opportunity {doc.opportunity}: {str(e)}"
#             )


# # ============================================
# # SURVEY → QUOTATION: Update Stage to "Quoted"
# # ============================================
# def update_survey_stage_on_quotation(doc, method=None):
#     """
#     When a Quotation is submitted,
#     update stages for Survey, Opportunity, and Lead to 'Quoted'
#     """
#     survey_name = None
#     opportunity_name = None
    
#     # Find survey link (check both standard and custom fields)
#     if hasattr(doc, 'survey') and doc.survey:
#         survey_name = doc.survey
#     elif hasattr(doc, 'custom_survey') and doc.custom_survey:
#         survey_name = doc.custom_survey
    
#     # Get opportunity from quotation or survey
#     if hasattr(doc, 'opportunity') and doc.opportunity:
#         opportunity_name = doc.opportunity
#     elif survey_name:
#         opportunity_name = frappe.db.get_value("Survey", survey_name, "opportunity")
    
#     try:
#         # Update Survey stage
#         if survey_name:
#             survey = frappe.get_doc("Survey", survey_name)
#             survey.custom_stage = "Quoted"
#             survey.save(ignore_permissions=True)
#             frappe.db.commit()
        
#         # Update Opportunity stage
#         if opportunity_name:
#             opportunity = frappe.get_doc("Opportunity", opportunity_name)
#             opportunity.custom_stage = "Quoted"
#             opportunity.save(ignore_permissions=True)
#             frappe.db.commit()
            
#             # Update Lead stage (if exists)
#             if opportunity.opportunity_from == "Lead" and opportunity.party_name:
#                 lead = frappe.get_doc("Lead", opportunity.party_name)
#                 lead.custom_stage = "Quoted"
#                 lead.save(ignore_permissions=True)
#                 frappe.db.commit()
        
#         frappe.msgprint(
#             f"Stages updated to 'Quoted' across all related documents",
#             alert=True,
#             indicator="green"
#         )
        
#     except Exception as e:
#         frappe.log_error(
#             title="Quotation Stage Update Failed",
#             message=f"Error updating stages: {str(e)}"
#         )


# # ============================================
# # SALES ORDER: Update Stage to "Closed Won"
# # ============================================
# def update_stage_on_sales_order(doc, method=None):
#     """
#     When a Sales Order is submitted,
#     update all related documents to 'Closed Won'
#     """
#     quotation_name = None
    
#     # Get quotation from Sales Order items
#     for item in doc.items:
#         # Check if item has quotation_item field (link to Quotation Item)
#         if hasattr(item, 'quotation_item') and item.quotation_item:
#             # Get quotation name from quotation_item
#             quotation_name = frappe.db.get_value("Quotation Item", item.quotation_item, "parent")
#             if quotation_name:
#                 break
#         # Fallback: check prevdoc_docname (this is the quotation name in Sales Order)
#         elif hasattr(item, 'prevdoc_docname') and item.prevdoc_docname:
#             quotation_name = item.prevdoc_docname
#             if quotation_name:
#                 break
    
#     if not quotation_name:
#         frappe.log_error(
#             title="Sales Order Stage Update",
#             message=f"No quotation found for Sales Order {doc.name}"
#         )
#         return
    
#     try:
#         quotation = frappe.get_doc("Quotation", quotation_name)
        
#         # Get related documents
#         survey_name = None
#         if hasattr(quotation, 'survey') and quotation.survey:
#             survey_name = quotation.survey
#         elif hasattr(quotation, 'custom_survey') and quotation.custom_survey:
#             survey_name = quotation.custom_survey
        
#         opportunity_name = quotation.opportunity if hasattr(quotation, 'opportunity') and quotation.opportunity else None
        
#         # Update Survey
#         if survey_name and frappe.db.exists("Survey", survey_name):
#             survey = frappe.get_doc("Survey", survey_name)
#             survey.custom_stage = "Closed Won"
#             survey.save(ignore_permissions=True)
        
#         # Update Opportunity
#         if opportunity_name and frappe.db.exists("Opportunity", opportunity_name):
#             opportunity = frappe.get_doc("Opportunity", opportunity_name)
#             opportunity.custom_stage = "Closed Won"
#             opportunity.status = "Converted"
#             opportunity.save(ignore_permissions=True)
            
#             # Update Lead
#             if opportunity.opportunity_from == "Lead" and opportunity.party_name:
#                 if frappe.db.exists("Lead", opportunity.party_name):
#                     lead = frappe.get_doc("Lead", opportunity.party_name)
#                     lead.custom_stage = "Closed Won"
#                     lead.status = "Converted"
#                     lead.save(ignore_permissions=True)
        
#         frappe.db.commit()
        
#         frappe.msgprint(
#             f"All stages updated to 'Closed Won'",
#             alert=True,
#             indicator="green"
#         )
        
#     except Exception as e:
#         frappe.log_error(
#             title="Sales Order Stage Update Failed",
#             message=f"Error updating stages for Sales Order {doc.name}: {str(e)}\n\n{frappe.get_traceback()}"
#         )


# # ============================================
# # UTILITY: Manually Set Stage to "Closed Lost"
# # ============================================
# @frappe.whitelist()
# def set_stage_closed_lost(doctype, docname):
#     """
#     Manually set stage to 'Closed Lost' for any document
#     Can be called from custom buttons
#     """
#     try:
#         doc = frappe.get_doc(doctype, docname)
#         doc.custom_stage = "Closed Lost"
        
#         if doctype == "Opportunity":
#             doc.status = "Lost"
#         elif doctype == "Lead":
#             doc.status = "Do Not Contact"
        
#         doc.save(ignore_permissions=True)
#         frappe.db.commit()
        
#         frappe.msgprint(
#             f"{doctype} marked as 'Closed Lost'",
#             alert=True,
#             indicator="red"
#         )
        
#         return {"success": True}
        
#     except Exception as e:
#         frappe.log_error(
#             title="Closed Lost Update Failed",
#             message=f"Error updating {doctype} {docname}: {str(e)}"
#         )
#         return {"success": False, "error": str(e)}

#         setup_list_view_customizations.py













# # File: grand_renovations_app/grand_renovations_app/overrides/stage_automation.py

# import frappe


# # =================================================
# # LEAD: Initial Stage = New (ONLY ON CREATION)
# # =================================================
# def set_lead_initial_stage(doc, method=None):
#     """
#     Set Lead stage to 'New' ONLY when Lead is first created
#     """
#     if doc.is_new():
#         frappe.db.set_value("Lead", doc.name, "custom_stage", "New")


# # =================================================
# # LEAD → SURVEY: Survey Booked
# # =================================================
# def update_lead_stage_on_survey(doc, method=None):
#     """
#     When Survey is created from Lead
#     """
#     if not doc.lead:
#         return

#     frappe.db.set_value("Survey", doc.name, "custom_stage", "Survey Booked")
#     frappe.db.set_value("Lead", doc.lead, "custom_stage", "Survey Booked")


# # =================================================
# # SURVEY → QUOTATION: Quoted
# # =================================================
# def update_stage_on_quotation(doc, method=None):
#     """
#     When Quotation is submitted
#     """
#     if doc.docstatus != 1:
#         return

#     # 1️⃣ Update Quotation itself
#     frappe.db.set_value("Quotation", doc.name, "custom_stage", "Quoted")

#     # 2️⃣ Get Survey
#     survey_name = doc.get("survey") or doc.get("custom_survey")
#     if survey_name and frappe.db.exists("Survey", survey_name):
#         frappe.db.set_value("Survey", survey_name, "custom_stage", "Quoted")

#     # 3️⃣ Get Lead
#     lead_name = None
#     if doc.quotation_to == "Lead" and doc.party_name:
#         lead_name = doc.party_name
#     elif survey_name:
#         lead_name = frappe.db.get_value("Survey", survey_name, "lead")

#     if lead_name and frappe.db.exists("Lead", lead_name):
#         frappe.db.set_value("Lead", lead_name, "custom_stage", "Quoted")


# # =================================================
# # QUOTATION → SALES ORDER: Order Confirmed
# # =================================================
# def update_stage_on_sales_order(doc, method=None):
#     """
#     When Sales Order is submitted
#     """
#     if doc.docstatus != 1:
#         return

#     quotation_name = None
#     for item in doc.items:
#         if item.prevdoc_docname:
#             quotation_name = item.prevdoc_docname
#             break

#     if not quotation_name:
#         return

#     # 1️⃣ Update Quotation
#     frappe.db.set_value("Quotation", quotation_name, "custom_stage", "Order Confirmed")

#     quotation = frappe.get_doc("Quotation", quotation_name)

#     # 2️⃣ Survey
#     survey_name = quotation.get("survey") or quotation.get("custom_survey")
#     if survey_name:
#         frappe.db.set_value("Survey", survey_name, "custom_stage", "Order Confirmed")

#     # 3️⃣ Lead
#     lead_name = None
#     if quotation.quotation_to == "Lead" and quotation.party_name:
#         lead_name = quotation.party_name
#     elif survey_name:
#         lead_name = frappe.db.get_value("Survey", survey_name, "lead")

#     if lead_name:
#         frappe.db.set_value("Lead", lead_name, "custom_stage", "Order Confirmed")


# # =================================================
# # SALES ORDER → SALES INVOICE: Closed Won
# # =================================================
# def update_stage_on_sales_invoice(doc, method=None):
#     """
#     When Sales Invoice is submitted
#     """
#     if doc.docstatus != 1:
#         return

#     sales_order_name = None
#     for item in doc.items:
#         if item.sales_order:
#             sales_order_name = item.sales_order
#             break

#     if not sales_order_name:
#         return

#     sales_order = frappe.get_doc("Sales Order", sales_order_name)

#     quotation_name = None
#     for item in sales_order.items:
#         if item.prevdoc_docname:
#             quotation_name = item.prevdoc_docname
#             break

#     if not quotation_name:
#         return

#     # 1️⃣ Update Quotation
#     frappe.db.set_value("Quotation", quotation_name, "custom_stage", "Closed Won")

#     quotation = frappe.get_doc("Quotation", quotation_name)

#     # 2️⃣ Survey
#     survey_name = quotation.get("survey") or quotation.get("custom_survey")
#     if survey_name:
#         frappe.db.set_value("Survey", survey_name, "custom_stage", "Closed Won")

#     # 3️⃣ Lead
#     lead_name = None
#     if quotation.quotation_to == "Lead" and quotation.party_name:
#         lead_name = quotation.party_name
#     elif survey_name:
#         lead_name = frappe.db.get_value("Survey", survey_name, "lead")

#     if lead_name:
#         frappe.db.set_value("Lead", lead_name, "custom_stage", "Closed Won")
#         frappe.db.set_value("Lead", lead_name, "status", "Converted")


# # =================================================
# # MANUAL: Closed Lost
# # =================================================
# @frappe.whitelist()
# def set_stage_closed_lost(doctype, docname):
#     """
#     Manually mark any document as Closed Lost
#     """
#     frappe.db.set_value(doctype, docname, "custom_stage", "Closed Lost")

#     if doctype == "Lead":
#         frappe.db.set_value("Lead", docname, "status", "Do Not Contact")

#     return {"success": True}






import frappe


# =================================================
# LEAD: Initial Stage = New (ONLY ON CREATION)
# =================================================
def set_lead_initial_stage(doc, method=None):
    """
    Set Lead stage to 'New' ONLY when Lead is first created
    """
    if doc.is_new():
        frappe.db.set_value("Lead", doc.name, "custom_stage", "New")


# =================================================
# LEAD → SURVEY: Survey Booked
# =================================================
def update_lead_stage_on_survey(doc, method=None):
    """
    When Survey is created from Lead
    """
    if not doc.lead:
        return

    # Survey
    frappe.db.set_value("Survey", doc.name, "custom_stage", "Survey Booked")

    # Lead
    frappe.db.set_value("Lead", doc.lead, "custom_stage", "Survey Booked")


# =================================================
# SURVEY → QUOTATION: Quoted
# =================================================
def update_stage_on_quotation(doc, method=None):
    """
    When Quotation is submitted
    """
    if doc.docstatus != 1:
        return

    # 1️⃣ Quotation itself
    frappe.db.set_value("Quotation", doc.name, "custom_stage", "Quoted")

    # 2️⃣ Survey
    survey_name = doc.get("survey") or doc.get("custom_survey")
    if survey_name and frappe.db.exists("Survey", survey_name):
        frappe.db.set_value("Survey", survey_name, "custom_stage", "Quoted")

    # 3️⃣ Lead
    lead_name = None
    if doc.quotation_to == "Lead" and doc.party_name:
        lead_name = doc.party_name
    elif survey_name:
        lead_name = frappe.db.get_value("Survey", survey_name, "lead")

    if lead_name and frappe.db.exists("Lead", lead_name):
        frappe.db.set_value("Lead", lead_name, "custom_stage", "Quoted")


# =================================================
# QUOTATION → SALES ORDER: Order Confirmed
# =================================================
def update_stage_on_sales_order(doc, method=None):
    """
    When Sales Order is submitted
    """
    if doc.docstatus != 1:
        return

    # ✅ 1️⃣ Sales Order itself (THIS WAS MISSING)
    frappe.db.set_value("Sales Order", doc.name, "custom_stage", "Order Confirmed")

    quotation_name = None
    for item in doc.items:
        if item.prevdoc_docname:
            quotation_name = item.prevdoc_docname
            break

    if not quotation_name:
        return

    # 2️⃣ Quotation
    frappe.db.set_value("Quotation", quotation_name, "custom_stage", "Order Confirmed")
    quotation = frappe.get_doc("Quotation", quotation_name)

    # 3️⃣ Survey
    survey_name = quotation.get("survey") or quotation.get("custom_survey")
    if survey_name:
        frappe.db.set_value("Survey", survey_name, "custom_stage", "Order Confirmed")

    # 4️⃣ Lead
    lead_name = None
    if quotation.quotation_to == "Lead" and quotation.party_name:
        lead_name = quotation.party_name
    elif survey_name:
        lead_name = frappe.db.get_value("Survey", survey_name, "lead")

    if lead_name:
        frappe.db.set_value("Lead", lead_name, "custom_stage", "Order Confirmed")


# =================================================
# SALES ORDER → SALES INVOICE: Closed Won
# =================================================
def update_stage_on_sales_invoice(doc, method=None):
    """
    When Sales Invoice is submitted
    """
    if doc.docstatus != 1:
        return

    # ✅ 1️⃣ Sales Invoice itself
    frappe.db.set_value("Sales Invoice", doc.name, "custom_stage", "Closed Won")

    sales_order_name = None
    for item in doc.items:
        if item.sales_order:
            sales_order_name = item.sales_order
            break

    if not sales_order_name:
        return

    # 2️⃣ Sales Order
    frappe.db.set_value("Sales Order", sales_order_name, "custom_stage", "Closed Won")
    sales_order = frappe.get_doc("Sales Order", sales_order_name)

    quotation_name = None
    for item in sales_order.items:
        if item.prevdoc_docname:
            quotation_name = item.prevdoc_docname
            break

    if not quotation_name:
        return

    # 3️⃣ Quotation
    frappe.db.set_value("Quotation", quotation_name, "custom_stage", "Closed Won")
    quotation = frappe.get_doc("Quotation", quotation_name)

    # 4️⃣ Survey
    survey_name = quotation.get("survey") or quotation.get("custom_survey")
    if survey_name:
        frappe.db.set_value("Survey", survey_name, "custom_stage", "Closed Won")

    # 5️⃣ Lead
    lead_name = None
    if quotation.quotation_to == "Lead" and quotation.party_name:
        lead_name = quotation.party_name
    elif survey_name:
        lead_name = frappe.db.get_value("Survey", survey_name, "lead")

    if lead_name:
        frappe.db.set_value("Lead", lead_name, "custom_stage", "Closed Won")
        frappe.db.set_value("Lead", lead_name, "status", "Converted")


# =================================================
# MANUAL: Closed Lost
# =================================================
@frappe.whitelist()
def set_stage_closed_lost(doctype, docname):
    """
    Manually mark any document as Closed Lost
    """
    frappe.db.set_value(doctype, docname, "custom_stage", "Closed Lost")

    if doctype == "Lead":
        frappe.db.set_value("Lead", docname, "status", "Do Not Contact")

    return {"success": True}
