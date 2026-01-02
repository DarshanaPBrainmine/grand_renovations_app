// // frappe.ui.form.on("Lead", {
// //     refresh(frm) {
// //         // Your existing Lead form logic (if any) can stay here
// //     },

// //     // ----------------------------------
// //     // After file attachment to Lead
// //     // ----------------------------------
// //     after_save(frm) {
// //         // This triggers when attachments are added to Lead
// //         attach_to_quotations_from_lead(frm);
// //     }
// // });

// // // ----------------------------------
// // // Helper: Attach Lead files to Quotations
// // // ----------------------------------
// // function attach_to_quotations_from_lead(frm) {
// //     // Get all files attached to this Lead
// //     frappe.call({
// //         method: "frappe.client.get_list",
// //         args: {
// //             doctype: "File",
// //             filters: {
// //                 attached_to_doctype: "Lead",
// //                 attached_to_name: frm.doc.name
// //             },
// //             fields: ["name", "file_name", "file_url", "is_private"]
// //         },
// //         callback(files_response) {
// //             if (!files_response.message || !files_response.message.length) return;

// //             // Find all Opportunities linked to this Lead
// //             frappe.call({
// //                 method: "frappe.client.get_list",
// //                 args: {
// //                     doctype: "Opportunity",
// //                     filters: {
// //                         opportunity_from: "Lead",
// //                         party_name: frm.doc.name
// //                     },
// //                     fields: ["name"]
// //                 },
// //                 callback(opp_response) {
// //                     if (!opp_response.message || !opp_response.message.length) return;

// //                     // For each Opportunity, find linked Quotations
// //                     opp_response.message.forEach(opp => {
// //                         frappe.call({
// //                             method: "frappe.client.get_list",
// //                             args: {
// //                                 doctype: "Quotation",
// //                                 filters: {
// //                                     opportunity: opp.name
// //                                 },
// //                                 fields: ["name"]
// //                             },
// //                             callback(quot_response) {
// //                                 if (!quot_response.message || !quot_response.message.length) return;

// //                                 // Attach all Lead files to each Quotation
// //                                 quot_response.message.forEach(quot => {
// //                                     files_response.message.forEach(file => {
// //                                         // Check if file already exists on Quotation
// //                                         frappe.call({
// //                                             method: "frappe.client.get_list",
// //                                             args: {
// //                                                 doctype: "File",
// //                                                 filters: {
// //                                                     file_url: file.file_url,
// //                                                     attached_to_doctype: "Quotation",
// //                                                     attached_to_name: quot.name
// //                                                 },
// //                                                 fields: ["name"]
// //                                             },
// //                                             callback(existing) {
// //                                                 // Only insert if doesn't exist
// //                                                 if (!existing.message || !existing.message.length) {
// //                                                     frappe.call({
// //                                                         method: "frappe.client.insert",
// //                                                         args: {
// //                                                             doc: {
// //                                                                 doctype: "File",
// //                                                                 file_name: file.file_name,
// //                                                                 file_url: file.file_url,
// //                                                                 is_private: file.is_private,
// //                                                                 attached_to_doctype: "Quotation",
// //                                                                 attached_to_name: quot.name
// //                                                             }
// //                                                         }
// //                                                     });
// //                                                 }
// //                                             }
// //                                         });
// //                                     });
// //                                 });
// //                             }
// //                         });
// //                     });
// //                 }
// //             });
// //         }
// //     });
// // }





// frappe.ui.form.on("Lead", {
//     refresh(frm) {
//         frm.trigger("render_lead_attachments");
//     },

//     // ----------------------------------
//     // Render Lead Attachments
//     // ----------------------------------
//     render_lead_attachments(frm) {
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: {
//                     attached_to_doctype: "Lead",
//                     attached_to_name: frm.doc.name
//                 },
//                 fields: ["name", "file_name", "file_url"],
//                 order_by: "creation desc"
//             },
//             callback(r) {
//                 let html = `
//                     <div style="margin-bottom:10px;">
//                         <button class="btn btn-xs btn-primary add-lead-attachment">
//                             + Add Attachment
//                         </button>
//                     </div>
//                 `;

//                 if (!r.message || !r.message.length) {
//                     html += `<em>No attachments yet.</em>`;
//                     frm.fields_dict.custom_lead_files_html.$wrapper.html(html);
                    
//                     // Bind button even when empty
//                     frm.fields_dict.custom_lead_files_html.$wrapper
//                         .find(".add-lead-attachment")
//                         .on("click", () => frm.trigger("upload_to_lead"));
//                     return;
//                 }

//                 r.message.forEach(file => {
//                     html += `
//                         <div style="margin-bottom:6px; display:flex; align-items:center; gap:6px;">
//                             📎 <a href="${file.file_url}" target="_blank">
//                                 ${file.file_name}
//                             </a>
//                             <button
//                                 class="btn btn-xs btn-secondary remove-lead-attachment"
//                                 style="padding:2px 6px; font-size:11px;"
//                                 data-file-url="${file.file_url}">
//                                 Remove
//                             </button>
//                         </div>
//                     `;
//                 });

//                 frm.fields_dict.custom_lead_files_html.$wrapper.html(html);

//                 const wrapper = frm.fields_dict.custom_lead_files_html.$wrapper;

//                 wrapper.find(".add-lead-attachment")
//                     .on("click", () => frm.trigger("upload_to_lead"));

//                 wrapper.find(".remove-lead-attachment")
//                     .on("click", function () {
//                         const file_url = $(this).data("file-url");
//                         frm.events.remove_lead_attachment(frm, file_url);
//                     });
//             }
//         });
//     },

//     // ----------------------------------
//     // Upload to Lead + Sync to Quotation
//     // ----------------------------------
//     upload_to_lead(frm) {
//         new frappe.ui.FileUploader({
//             allow_multiple: true,
//             on_success(file_doc) {
//                 frappe.call({
//                     method: "frappe.client.set_value",
//                     args: {
//                         doctype: "File",
//                         name: file_doc.name,
//                         fieldname: {
//                             attached_to_doctype: "Lead",
//                             attached_to_name: frm.doc.name
//                         }
//                     },
//                     callback() {
//                         // Sync to Quotations via Opportunities
//                         sync_lead_to_quotations(frm, file_doc);
                        
//                         frm.trigger("render_lead_attachments");
//                     }
//                 });
//             }
//         });
//     },

//     // ----------------------------------
//     // Remove from EVERYWHERE
//     // ----------------------------------
//     remove_lead_attachment(frm, file_url) {
//         frappe.confirm("Remove this attachment from everywhere (Lead, Opportunity, Survey & Quotation)?", () => {
//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "File",
//                     filters: { file_url },
//                     fields: ["name"]
//                 },
//                 callback(r) {
//                     if (!r.message || !r.message.length) return;

//                     Promise.all(
//                         r.message.map(f =>
//                             frappe.call({
//                                 method: "frappe.client.delete",
//                                 args: { doctype: "File", name: f.name }
//                             })
//                         )
//                     ).then(() => {
//                         frappe.show_alert({
//                             message: "Attachment removed from everywhere",
//                             indicator: "orange"
//                         });
//                         frm.trigger("render_lead_attachments");
//                     });
//                 }
//             });
//         });
//     }
// });

// // ----------------------------------
// // Helper: Sync Lead files to Quotations
// // ----------------------------------
// function sync_lead_to_quotations(frm, file_doc) {
//     // Find all Opportunities linked to this Lead
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Opportunity",
//             filters: {
//                 opportunity_from: "Lead",
//                 party_name: frm.doc.name
//             },
//             fields: ["name"]
//         },
//         callback(opp_r) {
//             if (!opp_r.message || !opp_r.message.length) return;

//             opp_r.message.forEach(opp => {
//                 // Find Quotations for each Opportunity
//                 frappe.call({
//                     method: "frappe.client.get_list",
//                     args: {
//                         doctype: "Quotation",
//                         filters: { opportunity: opp.name },
//                         fields: ["name"]
//                     },
//                     callback(quot_r) {
//                         if (!quot_r.message || !quot_r.message.length) return;

//                         quot_r.message.forEach(quot => {
//                             frappe.call({
//                                 method: "frappe.client.insert",
//                                 args: {
//                                     doc: {
//                                         doctype: "File",
//                                         file_name: file_doc.file_name,
//                                         file_url: file_doc.file_url,
//                                         is_private: file_doc.is_private || 0,
//                                         attached_to_doctype: "Quotation",
//                                         attached_to_name: quot.name
//                                     }
//                                 }
//                             });
//                         });
//                     }
//                 });
//             });
//         }
//     });
// }




// frappe.ui.form.on("Lead", {
//     refresh(frm) {
//         frm.add_custom_button(
//             __("Survey"),
//             () => {
//                 frappe.new_doc("Survey", {
//                     lead: frm.doc.name,
//                     customer: frm.doc.customer_name || frm.doc.lead_name,
//                     contact_email: frm.doc.email_id,
//                     contact_mobile: frm.doc.mobile_no
//                 });
//             },
//             __("Create")
//         );
//     }
// });





// // ========================================
// // LEAD FORM CUSTOMIZATION
// // ========================================

// frappe.ui.form.on("Lead", {
//     refresh: function(frm) {
//         // Render lead attachments
//         if (frm.fields_dict.custom_lead_files_html) {
//             frm.trigger("render_lead_attachments");
//         }
        
//         // Add Create Survey button
//         if (!frm.is_new()) {
//             // Remove default buttons after a short delay
//             setTimeout(function() {
//                 frm.page.remove_inner_button('Opportunity', 'Create');
//                 frm.page.remove_inner_button('Prospect', 'Create');
//                 frm.page.remove_inner_button('Customer', 'Create');
//             }, 500);
            
//             // Add custom Survey button with correct method path
//             frm.add_custom_button(__('Survey'), function() {
//                 frappe.call({
//                     method: 'grand_renovations_app.overrides.lead.create_survey_from_lead',
//                     args: {
//                         source_name: frm.doc.name
//                     },
//                     callback: function(r) {
//                         if (r.message) {
//                             frappe.model.sync(r.message);
//                             frappe.set_route('Form', 'Survey', r.message.name);
//                             frappe.show_alert({
//                                 message: __('Survey created successfully'),
//                                 indicator: 'green'
//                             });
//                         }
//                     },
//                     error: function(r) {
//                         frappe.msgprint({
//                             title: __('Error'),
//                             indicator: 'red',
//                             message: __('Failed to create survey. Please check if all required fields are filled.')
//                         });
//                     }
//                 });
//             }, __('Create'));
            
//             // Add View Surveys button
//             frm.add_custom_button(__('View Surveys'), function() {
//                 frappe.set_route('List', 'Survey', {lead: frm.doc.name});
//             }, __('View'));
//         }
//     },

//     // ========================================
//     // LEAD ATTACHMENTS MANAGEMENT
//     // ========================================
//     render_lead_attachments: function(frm) {
//         if (!frm.fields_dict.custom_lead_files_html) {
//             return;
//         }
        
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: {
//                     attached_to_doctype: "Lead",
//                     attached_to_name: frm.doc.name
//                 },
//                 fields: ["name", "file_name", "file_url"],
//                 order_by: "creation desc"
//             },
//             callback: function(r) {
//                 let html = `
//                     <div style="margin-bottom:10px;">
//                         <button class="btn btn-xs btn-primary add-lead-attachment">
//                             + Add Attachment
//                         </button>
//                     </div>
//                 `;

//                 if (!r.message || !r.message.length) {
//                     html += `<em>No attachments yet.</em>`;
//                     frm.fields_dict.custom_lead_files_html.$wrapper.html(html);
                    
//                     frm.fields_dict.custom_lead_files_html.$wrapper
//                         .find(".add-lead-attachment")
//                         .on("click", function() {
//                             frm.trigger("upload_to_lead");
//                         });
//                     return;
//                 }

//                 r.message.forEach(function(file) {
//                     html += `
//                         <div style="margin-bottom:6px; display:flex; align-items:center; gap:6px;">
//                             📎 <a href="${file.file_url}" target="_blank">
//                                 ${file.file_name}
//                             </a>
//                             <button
//                                 class="btn btn-xs btn-secondary remove-lead-attachment"
//                                 style="padding:2px 6px; font-size:11px;"
//                                 data-file-url="${file.file_url}">
//                                 Remove
//                             </button>
//                         </div>
//                     `;
//                 });

//                 frm.fields_dict.custom_lead_files_html.$wrapper.html(html);

//                 const wrapper = frm.fields_dict.custom_lead_files_html.$wrapper;

//                 wrapper.find(".add-lead-attachment")
//                     .on("click", function() {
//                         frm.trigger("upload_to_lead");
//                     });

//                 wrapper.find(".remove-lead-attachment")
//                     .on("click", function() {
//                         const file_url = $(this).data("file-url");
//                         frm.events.remove_lead_attachment(frm, file_url);
//                     });
//             }
//         });
//     },

//     upload_to_lead: function(frm) {
//         new frappe.ui.FileUploader({
//             allow_multiple: true,
//             on_success: function(file_doc) {
//                 frappe.call({
//                     method: "frappe.client.set_value",
//                     args: {
//                         doctype: "File",
//                         name: file_doc.name,
//                         fieldname: {
//                             attached_to_doctype: "Lead",
//                             attached_to_name: frm.doc.name
//                         }
//                     },
//                     callback: function() {
//                         sync_lead_to_quotations(frm, file_doc);
//                         frm.trigger("render_lead_attachments");
//                     }
//                 });
//             }
//         });
//     },

//     remove_lead_attachment: function(frm, file_url) {
//         frappe.confirm(
//             "Remove this attachment from everywhere (Lead, Opportunity, Survey & Quotation)?",
//             function() {
//                 frappe.call({
//                     method: "frappe.client.get_list",
//                     args: {
//                         doctype: "File",
//                         filters: { file_url: file_url },
//                         fields: ["name"]
//                     },
//                     callback: function(r) {
//                         if (!r.message || !r.message.length) return;

//                         Promise.all(
//                             r.message.map(function(f) {
//                                 return frappe.call({
//                                     method: "frappe.client.delete",
//                                     args: { doctype: "File", name: f.name }
//                                 });
//                             })
//                         ).then(function() {
//                             frappe.show_alert({
//                                 message: "Attachment removed from everywhere",
//                                 indicator: "orange"
//                             });
//                             frm.trigger("render_lead_attachments");
//                         });
//                     }
//                 });
//             }
//         );
//     }
// });

// // ========================================
// // HELPER: Sync Lead files to Quotations
// // ========================================
// function sync_lead_to_quotations(frm, file_doc) {
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Opportunity",
//             filters: {
//                 opportunity_from: "Lead",
//                 party_name: frm.doc.name
//             },
//             fields: ["name"]
//         },
//         callback: function(opp_r) {
//             if (!opp_r.message || !opp_r.message.length) return;

//             opp_r.message.forEach(function(opp) {
//                 frappe.call({
//                     method: "frappe.client.get_list",
//                     args: {
//                         doctype: "Quotation",
//                         filters: { opportunity: opp.name },
//                         fields: ["name"]
//                     },
//                     callback: function(quot_r) {
//                         if (!quot_r.message || !quot_r.message.length) return;

//                         quot_r.message.forEach(function(quot) {
//                             frappe.call({
//                                 method: "frappe.client.insert",
//                                 args: {
//                                     doc: {
//                                         doctype: "File",
//                                         file_name: file_doc.file_name,
//                                         file_url: file_doc.file_url,
//                                         is_private: file_doc.is_private || 0,
//                                         attached_to_doctype: "Quotation",
//                                         attached_to_name: quot.name
//                                     }
//                                 }
//                             });
//                         });
//                     }
//                 });
//             });
//         }
//     });
// }




// // ========================================
// // LEAD FORM CUSTOMIZATION
// // ========================================

// frappe.ui.form.on("Lead", {
//     refresh: function(frm) {
//         console.log("=== Lead Refresh ===");
//         console.log("Lead Name:", frm.doc.name);
        
//         // Render lead attachments
//         if (frm.fields_dict.custom_lead_files_html && !frm.is_new()) {
//             frm.trigger("render_lead_attachments");
//         }
        
//         // Add Create Survey button
//         if (!frm.is_new()) {
//             // Remove default buttons after a short delay
//             setTimeout(function() {
//                 frm.page.remove_inner_button('Opportunity', 'Create');
//                 frm.page.remove_inner_button('Prospect', 'Create');
//                 frm.page.remove_inner_button('Customer', 'Create');
//             }, 500);
            
//             // Add custom Survey button
//             frm.add_custom_button(__('Survey'), function() {
//                 console.log("Survey button clicked for Lead:", frm.doc.name);
                
//                 frappe.call({
//                     method: 'grand_renovations_app.overrides.lead.create_survey_from_lead',
//                     args: {
//                         source_name: frm.doc.name
//                     },
//                     callback: function(r) {
//                         console.log("Survey creation response:", r);
//                         if (r.message) {
//                             frappe.model.sync(r.message);
//                             frappe.set_route('Form', 'Survey', r.message.name);
//                             frappe.show_alert({
//                                 message: __('Survey created successfully'),
//                                 indicator: 'green'
//                             });
//                         }
//                     },
//                     error: function(r) {
//                         console.error("Survey creation error:", r);
//                         frappe.msgprint({
//                             title: __('Error'),
//                             indicator: 'red',
//                             message: __('Failed to create survey. Please check if all required fields are filled.')
//                         });
//                     }
//                 });
//             }, __('Create'));
            
//             // Add View Surveys button
//             frm.add_custom_button(__('View Surveys'), function() {
//                 frappe.set_route('List', 'Survey', {lead: frm.doc.name});
//             }, __('View'));
//         }
//     },


    

//     // ========================================
//     // LEAD ATTACHMENTS MANAGEMENT
//     // ========================================
//     render_lead_attachments: function(frm) {
//         if (!frm.fields_dict.custom_lead_files_html) {
//             console.log("custom_lead_files_html field not found");
//             return;
//         }
        
//         console.log("Rendering attachments for Lead:", frm.doc.name);
        
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: {
//                     attached_to_doctype: "Lead",
//                     attached_to_name: frm.doc.name
//                 },
//                 fields: ["name", "file_name", "file_url"],
//                 order_by: "creation desc"
//             },
//             callback: function(r) {
//                 console.log("Attachments found:", r.message);
                
//                 let html = `
//                     <div style="margin-bottom:10px;">
//                         <button class="btn btn-xs btn-primary add-lead-attachment">
//                             + Add Attachment
//                         </button>
//                     </div>
//                 `;

//                 if (!r.message || !r.message.length) {
//                     html += `<em style="color:#888;">No attachments yet.</em>`;
//                 } else {
//                     r.message.forEach(function(file) {
//                         html += `
//                             <div style="margin-bottom:6px; display:flex; align-items:center; gap:6px;">
//                                 📎 <a href="${file.file_url}" target="_blank" style="flex:1;">
//                                     ${file.file_name}
//                                 </a>
//                                 <button
//                                     class="btn btn-xs btn-secondary remove-lead-attachment"
//                                     style="padding:2px 6px; font-size:11px;"
//                                     data-file-url="${file.file_url}">
//                                     Remove
//                                 </button>
//                             </div>
//                         `;
//                     });
//                 }

//                 frm.fields_dict.custom_lead_files_html.$wrapper.html(html);

//                 const wrapper = frm.fields_dict.custom_lead_files_html.$wrapper;

//                 // Bind add button
//                 wrapper.find(".add-lead-attachment")
//                     .off("click")
//                     .on("click", function() {
//                         frm.trigger("upload_to_lead");
//                     });

//                 // Bind remove buttons
//                 wrapper.find(".remove-lead-attachment")
//                     .off("click")
//                     .on("click", function() {
//                         const file_url = $(this).data("file-url");
//                         frm.events.remove_lead_attachment(frm, file_url);
//                     });
//             },
//             error: function(r) {
//                 console.error("Error loading attachments:", r);
//                 frm.fields_dict.custom_lead_files_html.$wrapper.html(
//                     '<em style="color:red;">Error loading attachments</em>'
//                 );
//             }
//         });
//     },

//     upload_to_lead: function(frm) {
//         console.log("Uploading file to Lead:", frm.doc.name);
        
//         new frappe.ui.FileUploader({
//             allow_multiple: true,
//             on_success: function(file_doc) {
//                 console.log("File uploaded:", file_doc);
                
//                 frappe.call({
//                     method: "frappe.client.set_value",
//                     args: {
//                         doctype: "File",
//                         name: file_doc.name,
//                         fieldname: {
//                             attached_to_doctype: "Lead",
//                             attached_to_name: frm.doc.name
//                         }
//                     },
//                     callback: function() {
//                         frappe.show_alert({
//                             message: __('File attached successfully'),
//                             indicator: 'green'
//                         });
                        
//                         // Sync to quotations
//                         sync_lead_to_quotations(frm, file_doc);
                        
//                         // Reload attachments
//                         frm.trigger("render_lead_attachments");
//                     },
//                     error: function(r) {
//                         console.error("Error attaching file:", r);
//                         frappe.msgprint({
//                             title: __('Error'),
//                             indicator: 'red',
//                             message: __('Failed to attach file')
//                         });
//                     }
//                 });
//             }
//         });
//     },

//     remove_lead_attachment: function(frm, file_url) {
//         frappe.confirm(
//             "Remove this attachment from everywhere (Lead, Opportunity, Survey & Quotation)?",
//             function() {
//                 frappe.call({
//                     method: "frappe.client.get_list",
//                     args: {
//                         doctype: "File",
//                         filters: { file_url: file_url },
//                         fields: ["name"]
//                     },
//                     callback: function(r) {
//                         if (!r.message || !r.message.length) {
//                             frappe.msgprint(__('File not found'));
//                             return;
//                         }

//                         Promise.all(
//                             r.message.map(function(f) {
//                                 return frappe.call({
//                                     method: "frappe.client.delete",
//                                     args: { doctype: "File", name: f.name }
//                                 });
//                             })
//                         ).then(function() {
//                             frappe.show_alert({
//                                 message: __('Attachment removed from everywhere'),
//                                 indicator: 'orange'
//                             });
//                             frm.trigger("render_lead_attachments");
//                         }).catch(function(error) {
//                             console.error("Error removing files:", error);
//                             frappe.msgprint({
//                                 title: __('Error'),
//                                 indicator: 'red',
//                                 message: __('Failed to remove some attachments')
//                             });
//                         });
//                     }
//                 });
//             }
//         );
//     }
// });






// ========================================
// LEAD FORM CUSTOMIZATION
// ========================================
frappe.ui.form.on("Lead", {
    refresh: function(frm) {
        console.log("=== Lead Refresh ===");
        console.log("Lead Name:", frm.doc.name);
        console.log("Lead Status:", frm.doc.status);
        
        // Render lead attachments
        if (frm.fields_dict.custom_lead_files_html && !frm.is_new()) {
            frm.trigger("render_lead_attachments");
        }
        
        // Add buttons for all non-new leads, regardless of status
        if (!frm.is_new()) {
            // Remove default buttons after a short delay
            setTimeout(function() {
                frm.page.remove_inner_button('Opportunity', 'Create');
                frm.page.remove_inner_button('Prospect', 'Create');
                frm.page.remove_inner_button('Customer', 'Create');
            }, 500);
            
            // Always add Quotation button (regardless of conversion status)
            if (!frm.custom_buttons[__('Quotation')]) {
                frm.add_custom_button(__('Quotation'), function() {
                    console.log("Quotation button clicked for Lead:", frm.doc.name);
                    
                    frappe.model.open_mapped_doc({
                        method: "erpnext.crm.doctype.lead.lead.make_quotation",
                        frm: frm
                    });
                }, __('Create'));
            }
            
            // Always add Survey button (regardless of conversion status)
            if (!frm.custom_buttons[__('Survey')]) {
                frm.add_custom_button(__('Survey'), function() {
                    console.log("Survey button clicked for Lead:", frm.doc.name);
                    
                    frappe.call({
                        method: 'grand_renovations_app.overrides.lead.create_survey_from_lead',
                        args: {
                            source_name: frm.doc.name
                        },
                        callback: function(r) {
                            console.log("Survey creation response:", r);
                            if (r.message) {
                                frappe.model.sync(r.message);
                                frappe.set_route('Form', 'Survey', r.message.name);
                                frappe.show_alert({
                                    message: __('Survey created successfully'),
                                    indicator: 'green'
                                });
                            }
                        },
                        error: function(r) {
                            console.error("Survey creation error:", r);
                            frappe.msgprint({
                                title: __('Error'),
                                indicator: 'red',
                                message: __('Failed to create survey. Please check if all required fields are filled.')
                            });
                        }
                    });
                }, __('Create'));
            }
            
            // Add View Surveys button
            if (!frm.custom_buttons[__('View Surveys')]) {
                frm.add_custom_button(__('View Surveys'), function() {
                    frappe.set_route('List', 'Survey', {lead: frm.doc.name});
                }, __('View'));
            }
        }
    },
    
    // Re-trigger refresh when status changes to ensure buttons remain
    status: function(frm) {
        if (!frm.is_new()) {
            setTimeout(function() {
                frm.trigger('refresh');
            }, 100);
        }
    }
});





// ========================================
// HELPER: Sync Lead files to Quotations
// ========================================
function sync_lead_to_quotations(frm, file_doc) {
    console.log("Syncing file to quotations...");
    
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Opportunity",
            filters: {
                opportunity_from: "Lead",
                party_name: frm.doc.name
            },
            fields: ["name"]
        },
        callback: function(opp_r) {
            if (!opp_r.message || !opp_r.message.length) {
                console.log("No opportunities found for this lead");
                return;
            }

            opp_r.message.forEach(function(opp) {
                frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "Quotation",
                        filters: { opportunity: opp.name },
                        fields: ["name"]
                    },
                    callback: function(quot_r) {
                        if (!quot_r.message || !quot_r.message.length) {
                            console.log("No quotations found for opportunity:", opp.name);
                            return;
                        }

                        quot_r.message.forEach(function(quot) {
                            frappe.call({
                                method: "frappe.client.insert",
                                args: {
                                    doc: {
                                        doctype: "File",
                                        file_name: file_doc.file_name,
                                        file_url: file_doc.file_url,
                                        is_private: file_doc.is_private || 0,
                                        attached_to_doctype: "Quotation",
                                        attached_to_name: quot.name
                                    }
                                },
                                callback: function() {
                                    console.log("File synced to quotation:", quot.name);
                                }
                            });
                        });
                    }
                });
            });
        }
    });
}



frappe.ui.form.on("Lead", {
    refresh(frm) {
        load_google_autocomplete(frm);
    }
});

function load_google_autocomplete(frm) {
    if (!window.google || !google.maps || !google.maps.places) {
        setTimeout(() => load_google_autocomplete(frm), 1000);
        return;
    }

    let input = frm.fields_dict.custom_postcode?.input;
    if (!input) return;

    let autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "uk" }
    });

    autocomplete.addListener("place_changed", function () {
        let place = autocomplete.getPlace();
        if (!place.address_components) return;

        let address = {
            line1: "",
            line2: "",
            city: "",
            county: "",
            postcode: "",
            country: ""
        };

        place.address_components.forEach(comp => {
            let types = comp.types;

            if (types.includes("street_number")) {
                address.line1 = comp.long_name + " " + address.line1;
            }
            if (types.includes("route")) {
                address.line1 += comp.long_name;
            }
            if (types.includes("postal_town")) {
                address.city = comp.long_name;
            }
            if (types.includes("administrative_area_level_2")) {
                address.county = comp.long_name;
            }
            if (types.includes("postal_code")) {
                address.postcode = comp.long_name;
            }
            if (types.includes("country")) {
                address.country = comp.long_name;
            }
        });

        frm.set_value("custom_address_line_1", address.line1);
        frm.set_value("custom_city", address.city);
        frm.set_value("custom_county", address.county);
        frm.set_value("custom_postcode", address.postcode);
        frm.set_value("custom_country", address.country);
    });
}









// ========================================
// FILE: lead.js
// PATH: grand_renovations_app/public/js/lead.js
// Complete Lead customization - List View + Form View
// ========================================

// ========================================
// PART 1: HIDE STATUS FROM LIST VIEW
// ========================================
frappe.listview_settings['Lead'] = {
    hide_name_column: false,
    
    onload: function(listview) {
        console.log("=== Lead List View Loaded ===");
        
        // Remove status column immediately and continuously
        this.hideStatusColumn();
        
        // Use MutationObserver to catch any re-renders
        const targetNode = document.querySelector('.frappe-list');
        if (targetNode) {
            const observer = new MutationObserver(() => {
                this.hideStatusColumn();
            });
            
            observer.observe(targetNode, {
                childList: true,
                subtree: true,
                attributes: false
            });
        }
        
        // Also hide on interval as backup
        this.hideInterval = setInterval(() => {
            this.hideStatusColumn();
        }, 500);
    },
    
    refresh: function(listview) {
        console.log("Lead List Refreshed");
        this.hideStatusColumn();
    },
    
    hideStatusColumn: function() {
        // Find and hide Status column by header text
        $('.list-row-head .list-row-col').each(function(index) {
            const $col = $(this);
            const colTitle = $col.find('.list-col-title, .column-title').text().trim();
            
            if (colTitle === 'Status' || colTitle === 'status') {
                console.log("Hiding Status column at index:", index);
                
                // Hide the header
                $col.hide();
                
                // Hide all cells in this column
                $('.list-row').each(function() {
                    $(this).find('.list-row-col').eq(index).hide();
                });
            }
        });
        
        // Additional CSS-based hiding
        $('[data-field="status"]').hide();
        $('[data-fieldname="status"]').hide();
        $('.list-row-col[data-field="status"]').hide();
    }
};

// Global CSS injection for Status column hiding
$(document).ready(function() {
    if (!$('#hide-lead-status-style').length) {
        $('<style id="hide-lead-status-style">')
            .text(`
                /* Hide Status column in Lead List View */
                [data-page-route="List/Lead"] .list-row-col[data-field="status"],
                [data-page-route="List/Lead"] [data-fieldname="status"] {
                    display: none !important;
                    width: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    visibility: hidden !important;
                }
            `)
            .appendTo('head');
    }
});

// ========================================
// PART 2: LEAD FORM CUSTOMIZATION
// ========================================
frappe.ui.form.on("Lead", {
    refresh: function(frm) {
        console.log("=== Lead Form Refresh ===");
        console.log("Lead Name:", frm.doc.name);
        console.log("Lead Status:", frm.doc.status);
        
        // Render lead attachments
        if (frm.fields_dict.custom_lead_files_html && !frm.is_new()) {
            frm.trigger("render_lead_attachments");
        }
        
        // Add custom buttons for all non-new leads
        if (!frm.is_new()) {
            // Remove default ERPNext buttons
            setTimeout(function() {
                frm.page.remove_inner_button('Opportunity', 'Create');
                frm.page.remove_inner_button('Prospect', 'Create');
                frm.page.remove_inner_button('Customer', 'Create');
            }, 500);
            
            // Add Quotation button (always visible)
            if (!frm.custom_buttons[__('Quotation')]) {
                frm.add_custom_button(__('Quotation'), function() {
                    console.log("Quotation button clicked");
                    
                    frappe.model.open_mapped_doc({
                        method: "erpnext.crm.doctype.lead.lead.make_quotation",
                        frm: frm
                    });
                }, __('Create'));
            }
            
            // Add Survey button (always visible)
            if (!frm.custom_buttons[__('Survey')]) {
                frm.add_custom_button(__('Survey'), function() {
                    console.log("Survey button clicked");
                    
                    frappe.call({
                        method: 'grand_renovations_app.overrides.lead.create_survey_from_lead',
                        args: {
                            source_name: frm.doc.name
                        },
                        callback: function(r) {
                            console.log("Survey creation response:", r);
                            if (r.message) {
                                frappe.model.sync(r.message);
                                frappe.set_route('Form', 'Survey', r.message.name);
                                frappe.show_alert({
                                    message: __('Survey created successfully'),
                                    indicator: 'green'
                                });
                            }
                        },
                        error: function(r) {
                            console.error("Survey creation error:", r);
                            frappe.msgprint({
                                title: __('Error'),
                                indicator: 'red',
                                message: __('Failed to create survey. Please check if all required fields are filled.')
                            });
                        }
                    });
                }, __('Create'));
            }
            
            // Add View Surveys button
            if (!frm.custom_buttons[__('View Surveys')]) {
                frm.add_custom_button(__('View Surveys'), function() {
                    frappe.set_route('List', 'Survey', {lead: frm.doc.name});
                }, __('View'));
            }
        }
    },
    
    // Re-trigger refresh when status changes
    status: function(frm) {
        if (!frm.is_new()) {
            setTimeout(function() {
                frm.trigger('refresh');
            }, 100);
        }
    }
});