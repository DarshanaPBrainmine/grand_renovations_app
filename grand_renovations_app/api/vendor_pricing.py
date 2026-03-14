# import frappe
# from collections import defaultdict


# # ---------------------------------------------------------
# # CREATE PURCHASE ORDERS (GROUPED BY VENDOR)
# # ---------------------------------------------------------

# @frappe.whitelist()
# def create_purchase_order(vendor_pricing):

#     vp = frappe.get_doc("Vendor Pricing", vendor_pricing)

#     if not vp.pricing_items:
#         frappe.throw("No pricing items found in Vendor Pricing")

#     vendor_groups = defaultdict(list)

#     # Group items by vendor
#     for row in vp.pricing_items:

#         if not row.vendor:
#             frappe.throw(f"Vendor not selected for {row.product_type}")

#         vendor_groups[row.vendor].append(row)

#     created_pos = []

#     # Create one Purchase Order per vendor
#     for vendor, items in vendor_groups.items():

#         po = frappe.new_doc("Purchase Order")

#         po.supplier = vendor
#         po.schedule_date = frappe.utils.nowdate()

#         for row in items:

#             po.append("items", {
#                 "item_code": row.product_type,
#                 "qty": row.quantity,
#                 "rate": row.unit_cost
#             })

#         po.insert(ignore_permissions=True)

#         created_pos.append(po.name)

#     frappe.db.commit()

#     return created_pos



# # ---------------------------------------------------------
# # CREATE SUBCONTRACT AGREEMENT
# # ---------------------------------------------------------

# @frappe.whitelist()
# def create_subcontract_agreement(vendor_pricing):

#     vp = frappe.get_doc("Vendor Pricing", vendor_pricing)

#     vendor = None

#     for row in vp.pricing_items:
#         if row.vendor:
#             vendor = row.vendor
#             break

#     if not vendor:
#         frappe.throw("Please select vendor")

#     agreement = frappe.new_doc("Subcontract Agreement")

#     agreement.vendor = vendor
#     agreement.survey = vp.survey
#     agreement.vendor_pricing = vp.name
#     agreement.agreed_amount = vp.total_vendor_cost

#     agreement.insert(ignore_permissions=True)

#     frappe.db.commit()

#     return agreement.name



import frappe
from collections import defaultdict


# =====================================================
# CREATE ITEM IF NOT EXISTS
# =====================================================

def get_or_create_item(item_name):

    if frappe.db.exists("Item", item_name):
        return item_name

    item = frappe.new_doc("Item")

    item.item_code = item_name
    item.item_name = item_name
    item.item_group = "Services"
    item.stock_uom = "Nos"

    item.is_stock_item = 0
    item.is_purchase_item = 1
    item.is_sales_item = 0

    item.insert(ignore_permissions=True)

    return item_name


# =====================================================
# CREATE PURCHASE ORDER
# =====================================================

@frappe.whitelist()
def create_purchase_order(vendor_pricing):

    vp = frappe.get_doc("Vendor Pricing", vendor_pricing)

    if not vp.pricing_items:
        frappe.throw("No pricing items found")

    vendor_groups = defaultdict(list)

    # -------------------------------------------------
    # GROUP ITEMS BY VENDOR
    # -------------------------------------------------
    for row in vp.pricing_items:

        if not row.vendor:
            frappe.throw(f"Vendor not selected for {row.product_type}")

        vendor_groups[row.vendor].append(row)

    created_pos = []

    # -------------------------------------------------
    # CREATE PURCHASE ORDER PER VENDOR
    # -------------------------------------------------
    for vendor, items in vendor_groups.items():

        po = frappe.new_doc("Purchase Order")

        po.supplier = vendor
        po.schedule_date = frappe.utils.nowdate()

        for row in items:

            item_code = get_or_create_item(row.product_type)

            po.append("items", {
                "item_code": item_code,
                "qty": row.quantity,
                "rate": row.unit_cost,
                "price_list_rate": row.unit_cost
            })

        po.insert(ignore_permissions=True)

        created_pos.append(po.name)

    frappe.db.commit()

    return created_pos


# =====================================================
# CREATE SUBCONTRACT AGREEMENT
# =====================================================

@frappe.whitelist()
def create_subcontract_agreement(vendor_pricing):

    vp = frappe.get_doc("Vendor Pricing", vendor_pricing)

    vendor = None

    for row in vp.pricing_items:
        if row.vendor:
            vendor = row.vendor
            break

    if not vendor:
        frappe.throw("Please select vendor")

    agreement = frappe.new_doc("Subcontract Agreement")

    agreement.vendor = vendor
    agreement.survey = vp.survey
    agreement.vendor_pricing = vp.name
    agreement.agreed_amount = vp.total_vendor_cost

    agreement.insert(ignore_permissions=True)

    frappe.db.commit()

    return agreement.name