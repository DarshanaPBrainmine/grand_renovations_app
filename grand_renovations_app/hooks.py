# app_name = "grand_renovations_app"
# app_title = "Grand Renovations App"
# app_publisher = "Darshana Patil"
# app_description = "Complete CRM, Survey, Quotation & Job Management for Renovation Business"
# app_email = "darshanap01@brainmine.ai"
# app_license = "mit"

# # ------------------------------------------
# # CONNECT Opportunity → Survey
# # ------------------------------------------

# override_doctype_dashboards = {
#     "Opportunity": "grand_renovations_app.overrides.opportunity.get_dashboard_data"
# }

# doc_events = {
#     "Opportunity": {
#         "onload": "grand_renovations_app.overrides.opportunity.onload"
#     }
# }

# doctype_js = {
#     "Opportunity": "public/js/opportunity.js"
# }

# override_doctype_dashboards = {
#     "Survey": "grand_renovations_app.overrides.survey.get_dashboard_data"
# }



# File: grand_renovations_app/grand_renovations_app/hooks.py
# Complete configuration for Opportunity → Survey → Quotation flow

# app_name = "grand_renovations_app"
# app_title = "Grand Renovations App"
# app_publisher = "Darshana Patil"
# app_description = "Complete CRM, Survey, Quotation & Job Management for Renovation Business"
# app_email = "darshanap01@brainmine.ai"
# app_license = "mit"

# app_include_js = [
#     "/assets/grand_renovations_app/js/google_places.js",
#     # "/assets/grand_renovations_app/js/lead_list.js"

# ]


# app_include_css = [
#     "/assets/grand_renovations_app/css/hide_status.css",
    
# ]
# # ---------------------------------------------------------
# # CONNECT Opportunity → Survey AND Survey → Quotation
# # ---------------------------------------------------------

# # Override dashboard data for Connections tab
# # override_doctype_dashboards = {
# #     "Opportunity": "grand_renovations_app.overrides.opportunity.get_dashboard_data",
# #     "Survey": "grand_renovations_app.overrides.survey.get_dashboard_data",
# # }

# # Override dashboard data for Connections tab
# override_doctype_dashboards = {
#     "Lead": "grand_renovations_app.overrides.lead.get_dashboard_data",
#     "Opportunity": "grand_renovations_app.overrides.opportunity.get_dashboard_data",
#     "Survey": "grand_renovations_app.overrides.survey.get_dashboard_data",
# }
# # ---------------------------------------------------------
# # DOCUMENT EVENTS - Complete Workflow Automation
# # ---------------------------------------------------------
# doc_events = {
#     # LEAD EVENTS
#     "Lead": {
#         "after_insert": "grand_renovations_app.overrides.stage_automation.set_lead_initial_stage",

#     },
    
#     # OPPORTUNITY EVENTS
#     "Opportunity": {
#         "onload": "grand_renovations_app.overrides.opportunity.onload",
#         "after_insert": "grand_renovations_app.overrides.stage_automation.update_lead_stage_on_opportunity",
#     },
    
#     # SURVEY EVENTS
#     # "Survey": {
#     #     "after_insert": [
#     #         "grand_renovations_app.overrides.survey.create_calendar_event",
#     #         "grand_renovations_app.overrides.stage_automation.update_opportunity_stage_on_survey",
#     #     ]
#     # },

#     "Survey": {
#     "after_insert": [
#         "grand_renovations_app.overrides.survey.create_calendar_event",
#         "grand_renovations_app.overrides.stage_automation.update_opportunity_stage_on_survey",
#     ],
#     "on_update": [
#         "grand_renovations_app.overrides.survey.create_calendar_event"
#     ]
# },

    
#     # QUOTATION EVENTS
#     "Quotation": {
#         "on_submit": "grand_renovations_app.overrides.stage_automation.update_survey_stage_on_quotation",
#     },
    
#     # SALES ORDER EVENTS
#     "Sales Order": {
#         "on_submit": "grand_renovations_app.overrides.stage_automation.update_stage_on_sales_order",
#     },
#    "File": {
#         "before_insert": "grand_renovations_app.overrides.file.before_insert"
#     },

# #    "File": {
# #         "after_insert": "grand_renovations_app.utils.attachment_sync.sync_attachments_across_chain"
# #     }

# }
# # doctype_js = {
# #     "Survey": "public/js/survey.js"
# # }


# # Include JavaScript files for custom forms
# doctype_js = {
#     "Opportunity": "public/js/opportunity.js",
#     "Survey": "public/js/survey.js",
#     "Quotation": "public/js/quotation.js",
#     "Lead": "public/js/lead.js",
    



 
# }




# File: grand_renovations_app/grand_renovations_app/hooks.py
# Complete configuration for Lead → Survey → Quotation → Sales Order → Sales Invoice flow

app_name = "grand_renovations_app"
app_title = "Grand Renovations App"
app_publisher = "Darshana Patil"
app_description = "Complete CRM, Survey, Quotation & Job Management for Renovation Business"
app_email = "darshanap01@brainmine.ai"
app_license = "mit"

app_include_js = [
    "/assets/grand_renovations_app/js/google_places.js",
]

app_include_css = [
    "/assets/grand_renovations_app/css/hide_status.css",
]

list_view_settings = {
    "Lead": "grand_renovations_app.overrides.lead_list"
}



fixtures = [
    "Custom Field",
    "Property Setter",
    "Client Script",
    "Workflow",
    "Print Format",
    "DocType"
]



# ---------------------------------------------------------
# CONNECT Lead → Survey AND Survey → Quotation
# Override dashboard data for Connections tab
# ---------------------------------------------------------
override_doctype_dashboards = {
    "Lead": "grand_renovations_app.overrides.lead.get_dashboard_data",
    "Survey": "grand_renovations_app.overrides.survey.get_dashboard_data",
}

# ---------------------------------------------------------
# DOCUMENT EVENTS - Complete Workflow Automation
# Stage Flow: Lead → Survey → Quotation → Sales Order → Sales Invoice
# ---------------------------------------------------------
doc_events = {
    # LEAD EVENTS
    "Lead": {
        "after_insert": "grand_renovations_app.overrides.stage_automation.set_lead_initial_stage",
    },
    
    # # SURVEY EVENTS
    # "Survey": {
    #     "after_insert": [
    #         "grand_renovations_app.overrides.survey.create_calendar_event",
    #         "grand_renovations_app.overrides.stage_automation.update_lead_stage_on_survey",
    #     ],
    #     "on_update": [
    #         "grand_renovations_app.overrides.survey.create_calendar_event"
    #     ]
    # },

#    # SURVEY EVENTS - FIXED VERSION
   "Survey": {
        "on_change": [
            "grand_renovations_app.overrides.survey.create_calendar_event",
        ],
        "after_insert": [
            "grand_renovations_app.overrides.stage_automation.update_lead_stage_on_survey",
        ]
    },

    
    # QUOTATION EVENTS
    "Quotation": {
        "on_submit": "grand_renovations_app.overrides.stage_automation.update_stage_on_quotation",
    },
    
    # SALES ORDER EVENTS
    "Sales Order": {
        "on_submit": "grand_renovations_app.overrides.stage_automation.update_stage_on_sales_order",
    },
    
    # SALES INVOICE EVENTS
    "Sales Invoice": {
        "on_submit": "grand_renovations_app.overrides.stage_automation.update_stage_on_sales_invoice",
    },
    
    # FILE EVENTS
    "File": {
        "before_insert": "grand_renovations_app.overrides.file.before_insert"
    },
}

# Include JavaScript files for custom forms
doctype_js = {
    "Lead": "public/js/lead.js",
    "Survey": "public/js/survey.js",
    "Quotation": "public/js/quotation.js",
}