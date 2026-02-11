// frappe.ui.form.on("Quotation", {
//     refresh(frm) {
//         frm.trigger("render_attachments");
//     },

//     // ----------------------------------
//     // Render Attachments (SAFE)
//     // ----------------------------------
//     render_attachments(frm) {
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: [
//                     ["attached_to_doctype", "in", ["Lead", "Opportunity", "Quotation"]],
//                     ["attached_to_name", "in", [
//                         frm.doc.party_name || "__none__",
//                         frm.doc.opportunity || "__none__",
//                         frm.doc.name
//                     ]]
//                 ],
//                 fields: ["name", "file_name", "file_url"],
//                 order_by: "creation desc"
//             },
//             callback(r) {
//                 let html = `
//                     <div style="margin-bottom:10px;">
//                         <button class="btn btn-xs btn-primary upload-quotation-attachment">
//                             + Add Attachment
//                         </button>
//                     </div>
//                 `;

//                 if (!r.message || !r.message.length) {
//                     html += `<em>No attachments found.</em>`;
//                     frm.fields_dict.custom_lead_files_html.$wrapper.html(html);
//                     bind_upload(frm);
//                     return;
//                 }

//                 const seen = new Set();

//                 r.message.forEach(file => {
//                     if (seen.has(file.file_url)) return;
//                     seen.add(file.file_url);

//                     html += `
//                         <div style="margin-bottom:6px; display:flex; gap:6px;">
//                             📎 <a href="${file.file_url}" target="_blank">${file.file_name}</a>
//                             <button
//                                 class="btn btn-xs btn-secondary remove-quotation-attachment"
//                                 data-file-name="${file.name}">
//                                 Remove
//                             </button>
//                         </div>
//                     `;
//                 });

//                 frm.fields_dict.custom_lead_files_html.$wrapper.html(html);
//                 bind_upload(frm);
//                 bind_remove(frm);
//             }
//         });
//     },

//     // ----------------------------------
//     // Upload (ALWAYS WORKS)
//     // ----------------------------------
//     upload_attachment(frm) {
//         new frappe.ui.FileUploader({
//             allow_multiple: true,
//             on_success(file) {
//                 // 1️⃣ ALWAYS attach to Quotation first
//                 frappe.call({
//                     method: "frappe.client.insert",
//                     args: {
//                         doc: {
//                             doctype: "File",
//                             file_name: file.file_name,
//                             file_url: file.file_url,
//                             is_private: file.is_private,
//                             attached_to_doctype: "Quotation",
//                             attached_to_name: frm.doc.name
//                         }
//                     },
//                     callback() {
//                         // 2️⃣ Sync to Lead / Opportunity only if present
//                         sync_related(frm, file);
//                     }
//                 });
//             }
//         });
//     },

//     // ----------------------------------
//     // Remove everywhere
//     // ----------------------------------
//     remove_attachment(frm, file_name) {
//         frappe.confirm("Remove this attachment everywhere?", () => {
//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "File",
//                     filters: { file_name },
//                     fields: ["name"]
//                 },
//                 callback(r) {
//                     const deletes = r.message.map(f =>
//                         frappe.call({
//                             method: "frappe.client.delete",
//                             args: { doctype: "File", name: f.name }
//                         })
//                     );

//                     Promise.all(deletes).then(() => {
//                         frm.trigger("render_attachments");
//                         frappe.show_alert({ message: "Removed", indicator: "orange" });
//                     });
//                 }
//             });
//         });
//     }
// });

// // ----------------------------------
// // Helpers
// // ----------------------------------
// function bind_upload(frm) {
//     frm.fields_dict.custom_lead_files_html.$wrapper
//         .find(".upload-quotation-attachment")
//         .on("click", () => frm.trigger("upload_attachment"));
// }

// function bind_remove(frm) {
//     frm.fields_dict.custom_lead_files_html.$wrapper
//         .find(".remove-quotation-attachment")
//         .on("click", function () {
//             frm.events.remove_attachment(frm, $(this).data("file-name"));
//         });
// }

// function sync_related(frm, file) {
//     const targets = [];

//     if (frm.doc.party_name)
//         targets.push({ dt: "Lead", name: frm.doc.party_name });

//     if (frm.doc.opportunity)
//         targets.push({ dt: "Opportunity", name: frm.doc.opportunity });

//     targets.forEach(t => {
//         frappe.call({
//             method: "frappe.client.insert",
//             args: {
//                 doc: {
//                     doctype: "File",
//                     file_name: file.file_name,
//                     file_url: file.file_url,
//                     is_private: file.is_private,
//                     attached_to_doctype: t.dt,
//                     attached_to_name: t.name
//                 }
//             }
//         });
//     });
// }




// frappe.ui.form.on("Quotation", {
//     refresh(frm) {
//         frm.trigger("render_attachments");
//     },

//     // ----------------------------------
//     // Render Attachments
//     // ----------------------------------
//     render_attachments(frm) {
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: [
//                     ["attached_to_doctype", "in", ["Quotation", "Opportunity", "Survey", "Lead"]],
//                     ["attached_to_name", "in", [
//                         frm.doc.name,
//                         frm.doc.opportunity,
//                         frm.doc.custom_survey
//                     ]]
//                 ],
//                 fields: ["file_name", "file_url"],
//                 order_by: "creation desc"
//             },
//             callback(r) {
//                 let html = `
//                     <div style="margin-bottom:10px;">
//                         <button class="btn btn-xs btn-primary upload-quotation-attachment">
//                             + Add Attachment
//                         </button>
//                     </div>
//                 `;

//                 if (!r.message || !r.message.length) {
//                     html += `<em>No attachments found.</em>`;
//                     frm.fields_dict.custom_lead_files_html.$wrapper.html(html);
//                     bind_upload(frm);
//                     return;
//                 }

//                 const seen = new Set();

//                 r.message.forEach(file => {
//                     if (seen.has(file.file_url)) return;
//                     seen.add(file.file_url);

//                     html += `
//                         <div style="margin-bottom:6px; display:flex; gap:6px;">
//                             📎 <a href="${file.file_url}" target="_blank">
//                                 ${file.file_name}
//                             </a>
//                             <button
//                                 class="btn btn-xs btn-secondary remove-attachment"
//                                 data-file-url="${file.file_url}">
//                                 Remove
//                             </button>
//                         </div>
//                     `;
//                 });

//                 frm.fields_dict.custom_lead_files_html.$wrapper.html(html);
//                 bind_upload(frm);
//                 bind_remove(frm);
//             }
//         });
//     },

//     // ----------------------------------
//     // Upload & Attach (CORRECT LEAD LOGIC)
//     // ----------------------------------
//     upload_attachment(frm) {
//         new frappe.ui.FileUploader({
//             allow_multiple: true,
//             on_success(file) {
//                 frappe.call({
//                     method: "frappe.client.get",
//                     args: { doctype: "File", name: file.name },
//                     callback(r) {
//                         const uploaded = r.message;
//                         const inserts = [];

//                         // 1️⃣ Quotation
//                         inserts.push(insert_file(uploaded, "Quotation", frm.doc.name));

//                         // 2️⃣ Opportunity
//                         if (frm.doc.opportunity) {
//                             inserts.push(insert_file(uploaded, "Opportunity", frm.doc.opportunity));
//                         }

//                         // 3️⃣ Survey
//                         if (frm.doc.custom_survey) {
//                             inserts.push(insert_file(uploaded, "Survey", frm.doc.custom_survey));
//                         }

//                         // 4️⃣ Lead (FETCH FROM OPPORTUNITY)
//                         if (frm.doc.opportunity) {
//                             frappe.call({
//                                 method: "frappe.client.get",
//                                 args: {
//                                     doctype: "Opportunity",
//                                     name: frm.doc.opportunity
//                                 },
//                                 callback(res) {
//                                     const lead = res.message.party_name;
//                                     if (lead) {
//                                         inserts.push(insert_file(uploaded, "Lead", lead));
//                                     }

//                                     Promise.all(inserts).then(() => {
//                                         frappe.show_alert({
//                                             message: "Attachment added everywhere",
//                                             indicator: "green"
//                                         });
//                                         frm.trigger("render_attachments");
//                                     });
//                                 }
//                             });
//                         }
//                     }
//                 });
//             }
//         });
//     },

//     // ----------------------------------
//     // Remove Everywhere
//     // ----------------------------------
//     remove_attachment(frm, file_url) {
//         frappe.confirm("Remove this attachment everywhere?", () => {
//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "File",
//                     filters: { file_url },
//                     fields: ["name"]
//                 },
//                 callback(r) {
//                     const deletes = r.message.map(f =>
//                         frappe.call({
//                             method: "frappe.client.delete",
//                             args: { doctype: "File", name: f.name }
//                         })
//                     );

//                     Promise.all(deletes).then(() => {
//                         frm.trigger("render_attachments");
//                     });
//                 }
//             });
//         });
//     }
// });

// // ----------------------------------
// // Helpers
// // ----------------------------------
// function insert_file(file, dt, name) {
//     return new Promise(resolve => {
//         frappe.call({
//             method: "frappe.client.insert",
//             args: {
//                 doc: {
//                     doctype: "File",
//                     file_name: file.file_name,
//                     file_url: file.file_url,
//                     is_private: file.is_private,
//                     attached_to_doctype: dt,
//                     attached_to_name: name
//                 }
//             },
//             callback: () => resolve()
//         });
//     });
// }

// function bind_upload(frm) {
//     frm.fields_dict.custom_lead_files_html.$wrapper
//         .find(".upload-quotation-attachment")
//         .on("click", () => frm.trigger("upload_attachment"));
// }

// function bind_remove(frm) {
//     frm.fields_dict.custom_lead_files_html.$wrapper
//         .find(".remove-attachment")
//         .on("click", function () {
//             frm.events.remove_attachment(frm, $(this).data("file-url"));
//         });
// }




// ==========================================
// QUOTATION ATTACHMENT HANDLER
// Source of truth: LEAD
// ==========================================

// frappe.ui.form.on("Quotation", {

//     refresh(frm) {

//         const wrapper = frm.fields_dict.custom_lead_files_html?.$wrapper;
//         if (!wrapper) return;

//         if (!frm.doc.custom_lead) {
//             wrapper.html(`<em style="color:#888;">Please link a Lead first.</em>`);
//             return;
//         }

//         frm.trigger("render_attachments");
//     },

//     // ----------------------------------
//     // Render Lead Attachments
//     // ----------------------------------
//     render_attachments(frm) {

//         const wrapper = frm.fields_dict.custom_lead_files_html.$wrapper;

//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: {
//                     attached_to_doctype: "Lead",
//                     attached_to_name: frm.doc.custom_lead
//                 },
//                 fields: ["file_name", "file_url"],
//                 order_by: "creation desc",
//                 limit_page_length: 0
//             },
//             callback(r) {

//                 let html = `
//                     <div style="margin-bottom:10px;">
//                         <button class="btn btn-xs btn-primary upload-quotation-attachment">
//                             + Add Attachment
//                         </button>
//                     </div>
//                 `;

//                 if (!r.message || !r.message.length) {
//                     html += `<em>No attachments found.</em>`;
//                 } else {
//                     const seen = new Set();

//                     r.message.forEach(file => {
//                         if (seen.has(file.file_url)) return;
//                         seen.add(file.file_url);

//                         html += `
//                             <div style="margin-bottom:6px; display:flex; gap:6px;">
//                                 📎 <a href="${file.file_url}" target="_blank">${file.file_name}</a>
//                                 <button
//                                     class="btn btn-xs btn-danger remove-attachment"
//                                     data-file-url="${file.file_url}">
//                                     Remove
//                                 </button>
//                             </div>
//                         `;
//                     });
//                 }

//                 wrapper.html(html);

//                 wrapper.find(".upload-quotation-attachment")
//                     .off("click")
//                     .on("click", () => frm.trigger("upload_attachment"));

//                 wrapper.off("click", ".remove-attachment");
//                 wrapper.on("click", ".remove-attachment", function () {
//                     frm.trigger("remove_attachment", $(this).data("file-url"));
//                 });
//             }
//         });
//     },

//     // ----------------------------------
//     // Upload → ALWAYS TO LEAD
//     // ----------------------------------
//     upload_attachment(frm) {

//         new frappe.ui.FileUploader({
//             allow_multiple: true,

//             // 🔥 IMPORTANT: upload to LEAD, not Quotation
//             doctype: "Lead",
//             docname: frm.doc.custom_lead,

//             on_success(file) {
//                 frm.events.sync_to_survey_and_quotation(frm, file);
//             }
//         });
//     },

//     // ----------------------------------
//     // Sync to Survey & Quotation (CLONE)
//     // ----------------------------------
//     sync_to_survey_and_quotation(frm, file) {

//         const targets = [];

//         // Survey
//         if (frm.doc.custom_survey) {
//             targets.push({ dt: "Survey", dn: frm.doc.custom_survey });
//         }

//         // Quotation
//         targets.push({ dt: "Quotation", dn: frm.doc.name });

//         targets.forEach(t => {
//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "File",
//                     filters: {
//                         file_url: file.file_url,
//                         attached_to_doctype: t.dt,
//                         attached_to_name: t.dn
//                     },
//                     fields: ["name"]
//                 },
//                 callback(r) {
//                     if (r.message && r.message.length) return;

//                     frappe.call({
//                         method: "frappe.client.insert",
//                         args: {
//                             doc: {
//                                 doctype: "File",
//                                 file_name: file.file_name,
//                                 file_url: file.file_url,
//                                 is_private: file.is_private || 0,
//                                 attached_to_doctype: t.dt,
//                                 attached_to_name: t.dn
//                             }
//                         }
//                     });
//                 }
//             });
//         });

//         frappe.show_alert({
//             message: "Attachment added successfully",
//             indicator: "green"
//         });

//         frm.trigger("render_attachments");
//     },

//     // ----------------------------------
//     // Remove Everywhere
//     // ----------------------------------
//     remove_attachment(frm, file_url) {

//         frappe.confirm("Remove this attachment from Lead, Survey & Quotation?", () => {

//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "File",
//                     filters: {
//                         file_url: file_url,
//                         attached_to_doctype: ["in", ["Lead", "Survey", "Quotation"]]
//                     },
//                     fields: ["name"],
//                     limit_page_length: 0
//                 },
//                 callback(r) {

//                     if (!r.message) return;

//                     r.message.forEach(f => {
//                         frappe.call({
//                             method: "frappe.client.delete",
//                             args: {
//                                 doctype: "File",
//                                 name: f.name
//                             }
//                         });
//                     });

//                     frm.trigger("render_attachments");
//                 }
//             });
//         });
//     }
// });









frappe.ui.form.on("Quotation", {

    refresh(frm) {

        const wrapper = frm.fields_dict.custom_lead_files_html?.$wrapper;
        if (!wrapper) return;

        if (!frm.doc.custom_lead) {
            wrapper.html(`<em style="color:#888;">Please link a Lead first.</em>`);
            return;
        }

        frm.trigger("render_attachments");
    },

    // ----------------------------------
    // Render Lead Attachments
    // ----------------------------------
    render_attachments(frm) {

        const wrapper = frm.fields_dict.custom_lead_files_html.$wrapper;

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "File",
                filters: {
                    attached_to_doctype: "Lead",
                    attached_to_name: frm.doc.custom_lead
                },
                fields: ["file_name", "file_url"],
                order_by: "creation desc",
                limit_page_length: 0
            },
            callback(r) {

                let html = `
                    <div style="margin-bottom:10px;">
                        <button class="btn btn-xs btn-primary upload-quotation-attachment">
                            <i class="fa fa-plus"></i> Add Attachment
                        </button>
                    </div>
                `;

                if (!r.message || !r.message.length) {
                    html += `<em style="color:#888;">No attachments found.</em>`;
                } else {
                    const seen = new Set();

                    r.message.forEach(file => {
                        if (seen.has(file.file_url)) return;
                        seen.add(file.file_url);

                        html += `
                            <div style="margin-bottom:8px; display:flex; align-items:center; gap:8px; padding:6px; background:#f9f9f9; border-radius:4px;">
                                <i class="fa fa-paperclip" style="color:#5e64ff;"></i>
                                <a href="${file.file_url}" target="_blank" style="flex:1; text-decoration:none;">
                                    ${file.file_name}
                                </a>
                                <button
                                    class="btn btn-xs btn-danger remove-attachment"
                                    data-file-url="${file.file_url}">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </div>
                        `;
                    });
                }

                wrapper.html(html);

                wrapper.find(".upload-quotation-attachment")
                    .off("click")
                    .on("click", () => frm.trigger("upload_attachment"));

                // FIXED: Call function directly instead of using trigger
                wrapper.off("click", ".remove-attachment");
                wrapper.on("click", ".remove-attachment", function () {
                    const file_url = $(this).data("file-url");
                    frm.events.remove_attachment(frm, file_url);
                });
            }
        });
    },

    // ----------------------------------
    // Upload → ALWAYS TO LEAD
    // ----------------------------------
    upload_attachment(frm) {

        new frappe.ui.FileUploader({
            allow_multiple: true,

            // 🔥 IMPORTANT: upload to LEAD, not Quotation
            doctype: "Lead",
            docname: frm.doc.custom_lead,

            on_success(file) {
                frm.events.sync_to_survey_and_quotation(frm, file);
            }
        });
    },

    // ----------------------------------
    // Sync to Survey & Quotation (CLONE)
    // ----------------------------------
    sync_to_survey_and_quotation(frm, file) {

        const targets = [];

        // Survey
        if (frm.doc.custom_survey) {
            targets.push({ dt: "Survey", dn: frm.doc.custom_survey });
        }

        // Quotation
        targets.push({ dt: "Quotation", dn: frm.doc.name });

        const promises = targets.map(t => {
            return new Promise((resolve) => {
                frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "File",
                        filters: {
                            file_url: file.file_url,
                            attached_to_doctype: t.dt,
                            attached_to_name: t.dn
                        },
                        fields: ["name"]
                    },
                    callback(r) {
                        if (r.message && r.message.length) {
                            resolve();
                            return;
                        }

                        frappe.call({
                            method: "frappe.client.insert",
                            args: {
                                doc: {
                                    doctype: "File",
                                    file_name: file.file_name,
                                    file_url: file.file_url,
                                    is_private: file.is_private || 0,
                                    attached_to_doctype: t.dt,
                                    attached_to_name: t.dn
                                }
                            },
                            callback() {
                                resolve();
                            }
                        });
                    }
                });
            });
        });

        Promise.all(promises).then(() => {
            frappe.show_alert({
                message: "Attachment synced to Lead, Survey & Quotation",
                indicator: "green"
            });
            frm.trigger("render_attachments");
        });
    },

    // ----------------------------------
    // Remove Everywhere
    // ----------------------------------
    remove_attachment(frm, file_url) {

        frappe.confirm("Remove this attachment from Lead, Survey & Quotation?", () => {

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "File",
                    filters: {
                        file_url: file_url,
                        attached_to_doctype: ["in", ["Lead", "Survey", "Quotation"]]
                    },
                    fields: ["name"],
                    limit_page_length: 0
                },
                callback(r) {

                    if (!r.message || !r.message.length) {
                        frappe.show_alert({
                            message: "No files found to remove",
                            indicator: "orange"
                        });
                        return;
                    }

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
                            message: "Attachment removed everywhere",
                            indicator: "green"
                        });
                        frm.trigger("render_attachments");
                    }).catch((error) => {
                        frappe.msgprint({
                            title: "Error",
                            message: "Failed to remove attachment: " + error.message,
                            indicator: "red"
                        });
                    });
                }
            });
        });
    }
});