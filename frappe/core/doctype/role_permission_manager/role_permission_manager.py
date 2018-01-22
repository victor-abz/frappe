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
		[{ doctype, role, permlevel, { amend: 1, delete: 0, read: 0 }}]
	'''
	values = json.loads(values)
	# try:
	# 	values = json.loads(values)
	# except ValueError as e:
	# 	return
	print("=============================")
	print(values)

	for d in values:
		doctype = d['doctype']
		role = d['role']
		permlevel = d['permlevel']
		d.pop('doctype')
		d.pop('role')
		d.pop('permlevel')

		setup_custom_perms(doctype)

		name = frappe.get_value('Custom DocPerm', dict(parent=doctype, role=role,
			permlevel=permlevel))

		if name:
			frappe.db.set_value('Custom DocPerm', name, d, None)

