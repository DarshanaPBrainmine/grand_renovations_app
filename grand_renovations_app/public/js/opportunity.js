frappe.ui.form.on("Opportunity", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(
                __("Survey"),
                () => create_survey_from_opportunity(frm),
                __("Create")
            );
        }
    }
});

function create_survey_from_opportunity(frm) {
    frappe.call({
        method: "grand_renovations_app.overrides.opportunity.create_survey_from_opportunity",
        args: { opportunity_name: frm.doc.name },
        freeze: true,
        freeze_message: __("Creating Survey..."),
        callback: function (r) {
            if (!r.message) return;

            let new_survey = frappe.model.get_new_doc("Survey");

            // Copy all returned fields
            Object.entries(r.message).forEach(([key, value]) => {
                if (!["doctype", "name", "__islocal"].includes(key)) {
                    new_survey[key] = value;
                }
            });

            frappe.set_route("Form", "Survey", new_survey.name);
        }
    });
}












// frappe.ui.form.on("Opportunity", {
//     refresh(frm) {
//         if (frm.doc.opportunity_from !== "Lead" || !frm.doc.party_name) return;
//         frm.trigger("load_lead_attachments");
//     },

//     // ----------------------------------
//     // Load Lead Attachments
//     // ----------------------------------
//     load_lead_attachments(frm) {
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: {
//                     attached_to_doctype: "Lead",
//                     attached_to_name: frm.doc.party_name
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
//     // Upload attachment to Lead + Quotation
//     // ----------------------------------
//     upload_to_lead(frm) {
//         new frappe.ui.FileUploader({
//             allow_multiple: true,
//             on_success(file) {
//                 // 1️⃣ Attach to Lead (existing logic)
//                 frappe.call({
//                     method: "frappe.client.set_value",
//                     args: {
//                         doctype: "File",
//                         name: file.name,
//                         fieldname: {
//                             attached_to_doctype: "Lead",
//                             attached_to_name: frm.doc.party_name
//                         }
//                     },
//                     callback() {
//                         // 2️⃣ Also attach to all Quotations linked to this Opportunity
//                         attach_to_quotations(frm, file);
                        
//                         frm.trigger("load_lead_attachments");
//                     }
//                 });
//             }
//         });
//     },

//     // ----------------------------------
//     // Remove from Lead + Quotation
//     // ----------------------------------
//     remove_lead_attachment(frm, file_url) {
//         frappe.confirm("Remove this attachment from Lead and all linked Quotations?", () => {
//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "File",
//                     filters: {
//                         file_url: file_url
//                     },
//                     fields: ["name"]
//                 },
//                 callback(r) {
//                     if (!r.message || !r.message.length) {
//                         frappe.show_alert({
//                             message: "No attachment found",
//                             indicator: "orange"
//                         });
//                         return;
//                     }

//                     // Delete all File records with this file_url
//                     Promise.all(
//                         r.message.map(f =>
//                             frappe.call({
//                                 method: "frappe.client.delete",
//                                 args: {
//                                     doctype: "File",
//                                     name: f.name
//                                 }
//                             })
//                         )
//                     ).then(() => {
//                         frappe.show_alert({
//                             message: "Attachment removed from Lead and Quotations",
//                             indicator: "orange"
//                         });
//                         frm.trigger("load_lead_attachments");
//                     });
//                 }
//             });
//         });
//     }
// });

// // ----------------------------------
// // Helper: Attach to all Quotations
// // ----------------------------------
// function attach_to_quotations(frm, file) {
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Quotation",
//             filters: {
//                 opportunity: frm.doc.name
//             },
//             fields: ["name"]
//         },
//         callback(r) {
//             if (!r.message || !r.message.length) return;

//             r.message.forEach(quot => {
//                 frappe.call({
//                     method: "frappe.client.insert",
//                     args: {
//                         doc: {
//                             doctype: "File",
//                             file_name: file.file_name,
//                             file_url: file.file_url,
//                             is_private: file.is_private,
//                             attached_to_doctype: "Quotation",
//                             attached_to_name: quot.name
//                         }
//                     }
//                 });
//             });
//         }
//     });
// }



frappe.ui.form.on("Opportunity", {
    refresh(frm) {
        if (frm.doc.opportunity_from !== "Lead" || !frm.doc.party_name) return;
        frm.trigger("load_lead_attachments");
    },

    // ----------------------------------
    // Load Lead Attachments
    // ----------------------------------
    load_lead_attachments(frm) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "File",
                filters: {
                    attached_to_doctype: "Lead",
                    attached_to_name: frm.doc.party_name
                },
                fields: ["name", "file_name", "file_url"],
                order_by: "creation desc"
            },
            callback(r) {
                let html = `
                    <div style="margin-bottom:10px;">
                        <button class="btn btn-xs btn-primary add-lead-attachment">
                            + Add Attachment
                        </button>
                    </div>
                `;

                if (!r.message || !r.message.length) {
                    html += `<em>No attachments yet.</em>`;
                    frm.fields_dict.custom_lead_files_html.$wrapper.html(html);
                    
                    // Bind the add button even when no attachments
                    frm.fields_dict.custom_lead_files_html.$wrapper
                        .find(".add-lead-attachment")
                        .on("click", () => frm.trigger("upload_to_lead"));
                    return;
                }

                r.message.forEach(file => {
                    html += `
                        <div style="margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                            📎 <a href="${file.file_url}" target="_blank">
                                ${file.file_name}
                            </a>
                            <button
                                class="btn btn-xs btn-secondary remove-lead-attachment"
                                style="padding:2px 6px; font-size:11px;"
                                data-file-url="${file.file_url}">
                                Remove
                            </button>
                        </div>
                    `;
                });

                frm.fields_dict.custom_lead_files_html.$wrapper.html(html);

                const wrapper = frm.fields_dict.custom_lead_files_html.$wrapper;

                wrapper.find(".add-lead-attachment")
                    .on("click", () => frm.trigger("upload_to_lead"));

                wrapper.find(".remove-lead-attachment")
                    .on("click", function () {
                        const file_url = $(this).data("file-url");
                        frm.events.remove_lead_attachment(frm, file_url);
                    });
            }
        });
    },

    // ----------------------------------
    // Upload attachment to Lead + Quotation
    // ----------------------------------
    upload_to_lead(frm) {
        new frappe.ui.FileUploader({
            allow_multiple: true,
            on_success(file) {
                // 1️⃣ Attach to Lead (existing logic)
                frappe.call({
                    method: "frappe.client.set_value",
                    args: {
                        doctype: "File",
                        name: file.name,
                        fieldname: {
                            attached_to_doctype: "Lead",
                            attached_to_name: frm.doc.party_name
                        }
                    },
                    callback() {
                        // 2️⃣ Also attach to all Quotations linked to this Opportunity
                        attach_to_quotations(frm, file);
                        
                        frm.trigger("load_lead_attachments");
                    }
                });
            }
        });
    },

    // ----------------------------------
    // Remove from Lead + Quotation
    // ----------------------------------
    remove_lead_attachment(frm, file_url) {
        frappe.confirm("Remove this attachment from Lead and all linked Quotations?", () => {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "File",
                    filters: {
                        file_url: file_url
                    },
                    fields: ["name"]
                },
                callback(r) {
                    if (!r.message || !r.message.length) {
                        frappe.show_alert({
                            message: "No attachment found",
                            indicator: "orange"
                        });
                        return;
                    }

                    // Delete all File records with this file_url
                    Promise.all(
                        r.message.map(f =>
                            frappe.call({
                                method: "frappe.client.delete",
                                args: {
                                    doctype: "File",
                                    name: f.name
                                }
                            })
                        )
                    ).then(() => {
                        frappe.show_alert({
                            message: "Attachment removed from Lead and Quotations",
                            indicator: "orange"
                        });
                        frm.trigger("load_lead_attachments");
                    });
                }
            });
        });
    }
});

// ----------------------------------
// Helper: Attach to all Quotations
// ----------------------------------
function attach_to_quotations(frm, file) {
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Quotation",
            filters: {
                opportunity: frm.doc.name
            },
            fields: ["name"]
        },
        callback(r) {
            if (!r.message || !r.message.length) return;

            r.message.forEach(quot => {
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "File",
                            file_name: file.file_name,
                            file_url: file.file_url,
                            is_private: file.is_private,
                            attached_to_doctype: "Quotation",
                            attached_to_name: quot.name
                        }
                    }
                });
            });
        }
    });
}