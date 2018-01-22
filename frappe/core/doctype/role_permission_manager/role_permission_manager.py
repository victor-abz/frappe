# -*- coding: utf-8 -*-
# Copyright (c) 2018, Frappe Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe.permissions import setup_custom_perms

class RolePermissionManager(Document):
	pass


@frappe.whitelist()
def update_permission_properties(values):
	'''
	Update list of dict of properties in Custom DocPerm
	With the following structure
		[{ doctype, role, permlevel, ptype_map: { amend: 1, delete: 0, read: 0 }}]
	'''

	values = json.loads(values)
	for d in values:
		args = frappe._dict(d)
		_update_permission_properties(args.doctype, args.role, args.permlevel, args.ptype_map)

	return 'ok'

def _update_permission_properties(doctype, role, permlevel, ptype_map):
		setup_custom_perms(doctype)

		name = frappe.get_value('Custom DocPerm', dict(parent=doctype, role=role,
			permlevel=permlevel))

		if name:
			frappe.db.set_value('Custom DocPerm', name, ptype_map, None)

@frappe.whitelist()
def add_new_rule(apply_user_permissions, user_permission_doctypes,
	doctype, role, permlevel, allow=None, for_value=None, user=None):
	'''
	Helper method to apply_user_permissions for user_permission_doctypes
	and create a User Permission doc
	'''
	_update_permission_properties(doctype, role, permlevel, dict(
		apply_user_permissions=apply_user_permissions,
		user_permission_doctypes=user_permission_doctypes
	))

	doc = frappe.new_doc('User Permission')
	doc.allow = allow
	doc.for_value = for_value
	doc.user = user
	doc.insert()

	return 'ok'

