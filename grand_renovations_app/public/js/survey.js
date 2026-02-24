




frappe.ui.form.on("Survey", {
    refresh(frm) {

        /* ===============================
           CREATE QUOTATION BUTTON
        =============================== */
        if (!frm.is_new()) {
            frm.add_custom_button(__('Quotation'), function () {
                create_quotation_from_survey(frm);
            }, __('Create'));
        }

        /* ===============================
           LOAD LEAD ATTACHMENTS
        =============================== */
        if (!frm.doc.opportunity) return;

        frappe.db.get_value(
            "Opportunity",
            frm.doc.opportunity,
            "party_name"
        ).then(r => {
            if (r.message && r.message.party_name) {
                frm.lead_name = r.message.party_name;
                load_lead_attachments(frm);
            }
        });
    }
});


/* ===============================
   LOAD ATTACHMENTS FROM LEAD
=============================== */
function load_lead_attachments(frm) {

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "File",
            filters: {
                attached_to_doctype: "Lead",
                attached_to_name: frm.lead_name
            },
            fields: ["name", "file_name", "file_url"],
            order_by: "creation desc"
        },
        callback(r) {

            let html = `
                <div style="margin-bottom:10px;">
                    <button class="btn btn-xs btn-primary add-lead-attachment">
                        ➕ Add Attachment
                    </button>
                </div>
            `;

            if (r.message && r.message.length) {
                r.message.forEach(file => {
                    html += `
                        <div style="margin-bottom:6px;">
                            📎 <a href="${file.file_url}" target="_blank">
                                ${file.file_name}
                            </a>
                        </div>
                    `;
                });
            } else {
                html += `<em>No attachments yet.</em>`;
            }

            frm.fields_dict.custom_lead_files_html.$wrapper.html(html);

            frm.fields_dict.custom_lead_files_html.$wrapper
                .find(".add-lead-attachment")
                .on("click", () => upload_to_lead(frm));
        }
    });
}


/* ===============================
   UPLOAD FILE → SAVE ON LEAD
=============================== */
function upload_to_lead(frm) {

    new frappe.ui.FileUploader({
        allow_multiple: true,
        on_success(file) {
            frappe.call({
                method: "frappe.client.set_value",
                args: {
                    doctype: "File",
                    name: file.name,
                    fieldname: {
                        attached_to_doctype: "Lead",
                        attached_to_name: frm.lead_name
                    }
                },
                callback() {
                    load_lead_attachments(frm);
                }
            });
        }
    });
}


frappe.ui.form.on("Survey", {
    onload(frm) {
        if (frm.is_new() && frm.doc.lead) {
            fetch_project_fields(frm);
        }
    },

    lead(frm) {
        if (frm.doc.lead) {
            fetch_project_fields(frm);
        }
    }
});

function fetch_project_fields(frm) {
    frappe.db.get_doc("Lead", frm.doc.lead).then(lead => {

        if (!frm.doc.project_type && lead.custom_project_type) {
            frm.set_value("project_type", lead.custom_project_type);
        }

        if (!frm.doc.property_type && lead.custom_property_type) {
            frm.set_value("property_type", lead.custom_property_type);
        }

        if (!frm.doc.marketing_channel && lead.source) {
            frm.set_value("marketing_channel", lead.source);
        }

        if (!frm.doc.postcode && lead.custom_postcode) {
            frm.set_value("postcode", lead.custom_postcode);
        }

    });
}





// // ========================================
// // SURVEY FORM CUSTOMIZATION
// // ========================================

// frappe.ui.form.on("Survey", {
//     refresh: function(frm) {
//         console.log("=== Survey Refresh ===");
//         console.log("Lead:", frm.doc.lead);
//         console.log("Opportunity:", frm.doc.opportunity);
        
//         // Create Quotation button
//         if (!frm.is_new()) {
//             frm.add_custom_button(__('Quotation'), function () {
//                 create_quotation_from_survey(frm);
//             }, __('Create'));
            
//             // Add View Lead button if lead is linked
//             if (frm.doc.lead) {
//                 frm.add_custom_button(__('View Lead'), function() {
//                     frappe.set_route('Form', 'Lead', frm.doc.lead);
//                 });
//             }
            
//             // Add View Opportunity button if opportunity is linked
//             if (frm.doc.opportunity) {
//                 frm.add_custom_button(__('View Opportunity'), function() {
//                     frappe.set_route('Form', 'Opportunity', frm.doc.opportunity);
//                 });
//             }
//         }

//         // Load attachments based on source
//         load_attachments(frm);
//     },

//     onload: function(frm) {
//         if (frm.is_new() && frm.doc.lead) {
//             fetch_lead_data(frm);
//             fetch_project_fields(frm);
//         }
//     },

//     lead: function(frm) {
//         if (frm.doc.lead) {
//             fetch_lead_data(frm);
//             fetch_project_fields(frm);
//             load_attachments(frm);
//         }
//     },
    
//     opportunity: function(frm) {
//         if (frm.doc.opportunity) {
//             load_attachments(frm);
//         }
//     }
// });

// // ========================================
// // LOAD ATTACHMENTS - UNIFIED FUNCTION
// // ========================================
// function load_attachments(frm) {
//     // Check if custom_lead_files_html field exists
//     if (!frm.fields_dict.custom_lead_files_html) {
//         console.log("custom_lead_files_html field not found in Survey");
//         return;
//     }

//     // Determine source: Lead or Opportunity
//     if (frm.doc.lead) {
//         load_lead_attachments_directly(frm, frm.doc.lead);
//     } else if (frm.doc.opportunity) {
//         // Get Lead name from Opportunity
//         frappe.db.get_value(
//             "Opportunity",
//             frm.doc.opportunity,
//             ["party_name", "opportunity_from"]
//         ).then(function(r) {
//             if (r.message && r.message.opportunity_from === "Lead" && r.message.party_name) {
//                 load_lead_attachments_directly(frm, r.message.party_name);
//             }
//         });
//     }
// }

// // ========================================
// // LOAD LEAD ATTACHMENTS DIRECTLY
// // ========================================
// function load_lead_attachments_directly(frm, lead_name) {
//     console.log("Loading attachments for Lead:", lead_name);
    
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "File",
//             filters: {
//                 attached_to_doctype: "Lead",
//                 attached_to_name: lead_name
//             },
//             fields: ["name", "file_name", "file_url"],
//             order_by: "creation desc"
//         },
//         callback: function(r) {
//             console.log("Attachments found:", r.message);
            
//             let html = `
//                 <div style="margin-bottom:10px;">
//                     <button class="btn btn-xs btn-primary add-lead-attachment">
//                         ➕ Add Attachment
//                     </button>
//                 </div>
//             `;

//             if (r.message && r.message.length) {
//                 r.message.forEach(function(file) {
//                     html += `
//                         <div style="margin-bottom:6px; display:flex; align-items:center; gap:6px;">
//                             📎 <a href="${file.file_url}" target="_blank" style="flex:1;">
//                                 ${file.file_name}
//                             </a>
//                         </div>
//                     `;
//                 });
//             } else {
//                 html += `<em style="color:#888;">No attachments yet.</em>`;
//             }

//             // Set HTML
//             frm.fields_dict.custom_lead_files_html.$wrapper.html(html);

//             // Bind add attachment button
//             frm.fields_dict.custom_lead_files_html.$wrapper
//                 .find(".add-lead-attachment")
//                 .off("click")
//                 .on("click", function() {
//                     upload_to_lead(frm, lead_name);
//                 });
//         },
//         error: function(r) {
//             console.error("Error loading attachments:", r);
//         }
//     });
// }

// // ========================================
// // UPLOAD FILE TO LEAD
// // ========================================
// function upload_to_lead(frm, lead_name) {
//     console.log("Uploading file to Lead:", lead_name);
    
//     new frappe.ui.FileUploader({
//         allow_multiple: true,
//         on_success: function(file_doc) {
//             console.log("File uploaded:", file_doc);
            
//             frappe.call({
//                 method: "frappe.client.set_value",
//                 args: {
//                     doctype: "File",
//                     name: file_doc.name,
//                     fieldname: {
//                         attached_to_doctype: "Lead",
//                         attached_to_name: lead_name
//                     }
//                 },
//                 callback: function() {
//                     frappe.show_alert({
//                         message: __('File attached to Lead successfully'),
//                         indicator: 'green'
//                     });
                    
//                     // Reload attachments
//                     load_lead_attachments_directly(frm, lead_name);
//                 },
//                 error: function(r) {
//                     console.error("Error attaching file:", r);
//                     frappe.msgprint({
//                         title: __('Error'),
//                         indicator: 'red',
//                         message: __('Failed to attach file to Lead')
//                     });
//                 }
//             });
//         }
//     });
// }

// // ========================================
// // FETCH LEAD DATA
// // ========================================
// function fetch_lead_data(frm) {
//     console.log("Fetching Lead data:", frm.doc.lead);
    
//     frappe.call({
//         method: 'frappe.client.get',
//         args: {
//             doctype: 'Lead',
//             name: frm.doc.lead
//         },
//         callback: function(r) {
//             if (r.message) {
//                 let lead = r.message;
//                 console.log("Lead data received:", lead);
                
//                 // Map standard fields (only if empty)
//                 if (lead.lead_name && !frm.doc.customer) {
//                     frm.set_value('customer', lead.lead_name);
//                 }
//                 if (lead.email_id && !frm.doc.contact_email) {
//                     frm.set_value('contact_email', lead.email_id);
//                 }
//                 if (lead.mobile_no && !frm.doc.contact_mobile) {
//                     frm.set_value('contact_mobile', lead.mobile_no);
//                 }
//                 if (lead.company_name && !frm.doc.company_name) {
//                     frm.set_value('company_name', lead.company_name);
//                 }
//                 if (lead.territory && !frm.doc.territory) {
//                     frm.set_value('territory', lead.territory);
//                 }
//                 if (lead.source && !frm.doc.marketing_channel) {
//                     frm.set_value('marketing_channel', lead.source);
//                 }
//             }
//         },
//         error: function(r) {
//             console.error("Error fetching Lead data:", r);
//         }
//     });
// }

// // ========================================
// // FETCH PROJECT FIELDS FROM LEAD
// // ========================================
// function fetch_project_fields(frm) {
//     console.log("Fetching project fields from Lead:", frm.doc.lead);
    
//     frappe.db.get_doc("Lead", frm.doc.lead).then(function(lead) {
//         console.log("Project fields from Lead:", {
//             project_type: lead.custom_project_type,
//             property_type: lead.custom_property_type,
//             postcode: lead.custom_postcode
//         });
        
//         if (!frm.doc.project_type && lead.custom_project_type) {
//             frm.set_value("project_type", lead.custom_project_type);
//         }
//         if (!frm.doc.property_type && lead.custom_property_type) {
//             frm.set_value("property_type", lead.custom_property_type);
//         }
//         if (!frm.doc.postcode && lead.custom_postcode) {
//             frm.set_value("postcode", lead.custom_postcode);
//         }
//     }).catch(function(error) {
//         console.error("Error fetching project fields:", error);
//     });
// }

// // ========================================
// // CREATE QUOTATION FROM SURVEY
// // ========================================
// function create_quotation_from_survey(frm) {
//     console.log("Creating quotation from Survey:", frm.doc.name);
    
//     frappe.call({
//         method: 'grand_renovations_app.overrides.survey.create_quotation_from_survey',
//         args: {
//             survey_name: frm.doc.name
//         },
//         callback: function(r) {
//             if (r.message) {
//                 console.log("Quotation created:", r.message);
//                 frappe.model.sync(r.message);
//                 frappe.set_route('Form', 'Quotation', r.message.name);
//                 frappe.show_alert({
//                     message: __('Quotation created successfully'),
//                     indicator: 'green'
//                 });
//             }
//         },
//         error: function(r) {
//             console.error("Error creating quotation:", r);
//             frappe.msgprint({
//                 title: __('Error'),
//                 indicator: 'red',
//                 message: __('Failed to create quotation. Please check the error log.')
//             });
//         }
//     });
// }








