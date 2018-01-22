// Copyright (c) 2018, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Role Permission Manager', {
	onload(frm) {
		frm.events.show_help_message(frm);
		// permission engine wrapper
		const { $wrapper  } = frm.get_field('permission_engine_wrapper');
		$wrapper.append("<div class='perm-engine'></div>");
		frm.permission_engine = new frappe.PermissionEngine($wrapper, frm);

		// help html
		const help_html = frappe.render_template(frappe.PermissionEngine.HelpHTML, {});
		frm.get_field('permission_engine_help').$wrapper.html(help_html);

		// TODO or_filters
		frm.set_query("document_type", function() {
			return {
				filters: {
					"istable": 0,
					"name": ['not in', ["DocType", "Patch Log", "Module Def"].join(',')]
				}
			};
		});

		frm.set_query("role", function() {
			return {
				filters: {
					name: ["not in", "Administrator"],
					disabled: 0
				}
			};
		});

		frm.disable_save();
	},

	refresh(frm) {
		// set from route_options
		if (frappe.route_options) {
			if (frappe.route_options.doctype) {
				frm.set_value('document_type', frappe.route_options.doctype);
			}
			if(frappe.route_options.role) {
				frm.set_value('role', frappe.route_options.role);
			}
			frappe.route_options = null;
		}

		frm.events.on_perm_dirty(frm);
	},

	document_type(frm) {
		frm.events.show_help_message(frm);
		frm.permission_engine.set_document_type(frm.doc.document_type);
	},

	role(frm) {
		frm.events.show_help_message(frm);
		frm.permission_engine.set_role(frm.doc.role);
	},

	show_help_message(frm) {
		if (frm.doc.document_type || frm.doc.role) {
			frm.dashboard.clear_headline();
		} else {
			frm.dashboard.add_comment(__('Select Document Type or Role to start'), null, true);
		}
	},

	on_perm_dirty(frm) {
		if (frm.permission_engine.dirty === true) {
			frm.page.set_indicator(__('Not Saved'), 'orange');
			frm.page.set_primary_action(__('Save'), () => {
				frm.permission_engine.save_changes();
			});
		} else {
			frm.page.clear_indicator();
			frm.page.clear_primary_action();
		}
	}

});


frappe.PermissionEngine = class PermissionEngine {
	constructor(wrapper, frm) {
		this.wrapper = wrapper;
		this.frm = frm;
		this.page = wrapper.page;
		this.body = $(this.wrapper).find(".perm-engine");
		this.rights = ["read", "write", "create", "delete", "submit", "cancel", "amend",
			"print", "email", "report", "import", "export", "set_user_permissions", "share"];

		this.changes = [];
		this.make_reset_button();
		this.refresh();
		this.add_check_events();
	}

	get dirty() {
		return this._dirty;
	}

	set dirty(val) {
		this._dirty = val;
		this.frm.events.on_perm_dirty(this.frm);
	}

	set_document_type(document_type) {
		this.document_type = document_type;
		this.refresh();
	}

	set_role(role) {
		this.role = role;
		this.refresh();
	}

	get_standard_permissions(callback) {
		var doctype = this.get_doctype();
		if(doctype) {
			return frappe.call({
				module:"frappe.core",
				page:"permission_manager",
				method: "get_standard_permissions",
				args: {doctype: doctype},
				callback: callback
			});
		}
		return false;
	}

	reset_std_permissions(data) {
		var me = this;
		var d = frappe.confirm(__("Reset Permissions for {0}?", [me.get_doctype()]), function() {
			return frappe.call({
				module:"frappe.core",
				page:"permission_manager",
				method:"reset",
				args: {
					doctype: me.get_doctype(),
				},

				callback: function() { me.refresh(); }
			});
		});

		// show standard permissions
		var $d = $(d.wrapper).find(".frappe-confirm-message").append("<hr><h4>Standard Permissions:</h4><br>");
		var $wrapper = $("<p></p>").appendTo($d);
		$.each(data.message, function(i, d) {
			d.rights = [];
			$.each(me.rights, function(i, r) {
				if(d[r]===1) {
					d.rights.push(__(toTitle(r.replace("_", " "))));
				}
			});
			d.rights = d.rights.join(", ");
			$wrapper.append(repl('<div class="row">\
				<div class="col-xs-5"><b>%(role)s</b>, Level %(permlevel)s</div>\
				<div class="col-xs-7">%(rights)s</div>\
			</div><br>', d));
		});

	}

	get_doctype() {
		return this.document_type;
	}

	get_role() {
		return this.role;
	}

	refresh() {
		if(!this.get_doctype() && !this.get_role()) {
			this.body.empty();
			return;
		}

		// show loading indicator
		this.body.html(`<span class="text-muted">${__('Loading...')}</span>`);

		// get permissions
		frappe.call({
			module: "frappe.core",
			page: "permission_manager",
			method: "get_permissions",
			args: {
				doctype: this.get_doctype(),
				role: this.get_role()
			},
			callback: r => this.render(r.message)
		});
	}

	render(perm_list) {
		this.body.empty();
		this.perm_list = perm_list || [];
		if(!this.perm_list.length) {
			this.body.html(
				`<p class='text-muted'>${__("No Permissions set for this criteria.")}</p>`
			);
		} else {
			this.show_permission_table(this.perm_list);
		}
		this.show_add_rule();
		this.make_reset_button();
	}

	show_permission_table(perm_list) {

		var me = this;
		this.table = $("<div class='table-responsive'>\
			<table class='table table-bordered' style='margin: 0'>\
				<thead><tr></tr></thead>\
				<tbody></tbody>\
			</table>\
		</div>").appendTo(this.body);

		$.each([[__("Document Type"), 150], [__("Role"), 170], [__("Level"), 40],
			[__("Permissions"), 350], ["", 40]], function(i, col) {
			$("<th>").html(col[0]).css("width", col[1]+"px")
				.appendTo(me.table.find("thead tr"));
		});

		$.each(perm_list, function(i, d) {
			if(d.parent==="DocType") { return; }
			if(!d.permlevel) d.permlevel = 0;
			var row = $("<tr>").appendTo(me.table.find("tbody"));
			me.add_cell(row, d, "parent");
			var role_cell = me.add_cell(row, d, "role");
			me.set_show_users(role_cell, d.role);

			if (d.permlevel===0) {
				me.setup_user_permissions(d, role_cell);
				me.setup_if_owner(d, role_cell);
			}

			var cell = me.add_cell(row, d, "permlevel");
			if(d.permlevel==0) {
				cell.css("font-weight", "bold");
				row.addClass("warning");
			}

			var perm_cell = me.add_cell(row, d, "permissions").css("padding-top", 0);
			var perm_container = $("<div class='row'></div>").appendTo(perm_cell);

			me.rights.forEach(r => {
				if (!d.is_submittable && ['submit', 'cancel', 'amend'].includes(r)) return;
				me.add_check(perm_container, d, r);
			});

			// buttons
			me.add_delete_button(row, d);
		});
	}

	add_cell(row, d, fieldname) {
		return $("<td>").appendTo(row)
			.attr("data-fieldname", fieldname)
			.html(__(d[fieldname]));
	}


	add_check(cell, d, fieldname, label) {
		if(!label) {
			label = toTitle(fieldname.replace(/_/g, " "));
		}
		if(d.permlevel > 0 && ["read", "write"].indexOf(fieldname)==-1) {
			return;
		}

		var checkbox = $("<div class='col-md-4'><div class='checkbox'>\
				<label><input type='checkbox'>"+__(label)+"</input></label>"
				+ (d.help || "") + "</div></div>").appendTo(cell)
			.attr("data-fieldname", fieldname);

		checkbox.find("input")
			.prop("checked", d[fieldname] ? true: false)
			.attr("data-ptype", fieldname)
			.attr("data-role", d.role)
			.attr("data-permlevel", d.permlevel)
			.attr("data-doctype", d.parent);

		checkbox.find("label")
			.css("text-transform", "capitalize");

		return checkbox;
	}

	setup_user_permissions(d, role_cell) {
		var me = this;
		d.help = `<ul class="user-permission-help small hidden"
				style="margin-left: -10px;">
				<li style="margin-top: 7px;"><a class="show-user-permission-doctypes">
					${__("Select Document Types")}</a></li>
				<li style="margin-top: 3px;"><a class="show-user-permissions">
					${__("Show User Permissions")}</a></li>
			</ul>`;

		var checkbox = this.add_check(role_cell, d, "apply_user_permissions")
			.removeClass("col-md-4")
			.css({"margin-top": "15px"});

		checkbox.find(".show-user-permission-doctypes").on("click", function() {
			me.show_user_permission_doctypes(d);
		});

		var toggle_user_permissions = function() {
			checkbox.find(".user-permission-help").toggleClass("hidden", !checkbox.find("input").prop("checked"));
		};

		toggle_user_permissions();
		checkbox.find("input").on('click', function() {
			toggle_user_permissions();
		});

		d.help = "";

		// this.setup_apply_user_permissions_dialog(d, role_cell);
	}

	setup_apply_user_permissions_dialog(d, parent) {
		console.log(d);

		// let user_permissions = [];

		// const dialog = new frappe.ui.Dialog({
		// 	title: __('Apply User Permissions'),
		// 	// size: 'large',
		// 	fields: [
		// 		{
		// 			label: __('Enable User based Role Permissions'),
		// 			fieldname: 'enable',
		// 			fieldtype: 'Check',
		// 			default: d.apply_user_permissions
		// 		},
		// 		{
		// 			label: __('Restrict Permissions for Link Fields'),
		// 			fieldtype: 'Section Break',
		// 			depends_on: 'enable'
		// 		},
		// 		{
		// 			fieldname: 'user_permissions', fieldtype: 'Table',
		// 			fields: [
		// 				{
		// 					label: __('Allow'),
		// 					fieldname: 'allow',
		// 					fieldtype: 'Link',
		// 					options: 'DocType',
		// 					in_list_view: 1,
		// 					get_query() {
		// 						return {
		// 							filters: {
		// 								name: ['in', d.linked_doctypes]
		// 							}
		// 						};
		// 					}
		// 				},
		// 				{
		// 					label: __('Value'),
		// 					fieldname: 'for_value',
		// 					fieldtype: 'Dynamic Link',
		// 					options: 'allow',
		// 					in_list_view: 1
		// 				},
		// 				{
		// 					label: __('For User'),
		// 					fieldname: 'user',
		// 					fieldtype: 'Link',
		// 					options: 'User',
		// 					in_list_view: 1
		// 				}
		// 			],
		// 			in_place_edit: true,
		// 			data: user_permissions,
		// 			get_data() {
		// 				return user_permissions;
		// 			}
		// 		}
		// 	]
		// });

		// const $button = $(`<button class="btn btn-default">${__('Apply User Permissions')}</button>`).click(() => {
		// 	frappe.db.get_list('User Permission', {
		// 		filters: [{ allow: ['in', d.linked_doctypes] }],
		// 		fields: ['name', 'allow', 'for_value', 'user']
		// 	}).then(results => {
		// 		user_permissions.push(...results);
		// 		// Array.prototype.apply.call(user_permissions, results);
		// 		// user_permissions = results;
		// 		dialog.fields_dict.user_permissions.refresh();
		// 		dialog.show();
		// 	});
		// });

		const $button = $(`<button class="btn btn-default">${__('New User Permission')}</button>`).click(() => {
			// frappe.new_doc('User Permission');

			const dialog = new frappe.ui.Dialog({
				title: __('New User Permission'),
				fields: [
					{
						label: __('Allow'),
						fieldname: 'allow',
						fieldtype: 'Link',
						options: 'DocType',
						get_query() {
							return {
								filters: {
									name: ['in', d.linked_doctypes]
								}
							};
						}
					},
					{
						label: __('Value'),
						fieldname: 'for_value',
						fieldtype: 'Dynamic Link',
						options: 'allow'
					},
					{
						label: __('For User'),
						fieldname: 'user',
						fieldtype: 'Link',
						options: 'User'
					}
				]
			});

			dialog.show();
		});

		$(parent).append($button);
	}

	setup_if_owner(d, role_cell) {
		this.add_check(role_cell, d, "if_owner", __("Only Creator can view"))
			.removeClass("col-md-4")
			.css({"margin-top": "15px"});
	}

	set_show_users(cell, role) {
		cell.html("<a class='grey' href='#'>"+__(role)+"</a>")
			.find("a")
			.attr("data-role", role)
			.click(function() {
				var role = $(this).attr("data-role");
				frappe.call({
					module: "frappe.core",
					page: "permission_manager",
					method: "get_users_with_role",
					args: {
						role: role
					},
					callback: function(r) {
						const users = r.message;
						const users_html = users.map(user => frappe.avatar(user, null, null, true))
							.map((html, i) => `<div ${i !=0 ? 'class="margin-top"' : ''}>${html}</div>`).join("");
						frappe.msgprint({
							title: __('Users with Role: {0}', [__(role)]),
							message: users_html
						});
					}
				});
				return false;
			});
	}

	add_delete_button(row, d) {
		var me = this;
		$("<button class='btn btn-default btn-sm'><i class='fa fa-remove'></i></button>")
			.appendTo($("<td>").appendTo(row))
			.attr("data-doctype", d.parent)
			.attr("data-role", d.role)
			.attr("data-permlevel", d.permlevel)
			.click(function() {
				return frappe.call({
					module: "frappe.core",
					page: "permission_manager",
					method: "remove",
					args: {
						doctype: $(this).attr("data-doctype"),
						role: $(this).attr("data-role"),
						permlevel: $(this).attr("data-permlevel")
					},
					callback: function(r) {
						if(r.exc) {
							frappe.msgprint(__("Did not remove"));
						} else {
							me.refresh();
						}
					}
				});
			});
	}

	add_check_events() {
		var me = this;

		this.body.on("click", ".show-user-permissions", function() {
			frappe.route_options = { allow: me.get_doctype() || "" };
			frappe.set_route('List', 'User Permission');
		});

		this.body.on("click", "input[type='checkbox']", function() {
			var chk = $(this);
			var args = {
				role: chk.attr("data-role"),
				permlevel: chk.attr("data-permlevel"),
				doctype: chk.attr("data-doctype"),
				ptype: chk.attr("data-ptype"),
				value: chk.prop("checked") ? 1 : 0
			};
			me.dirty = true;
			me.add_to_changes(args);
			// return frappe.call({
			// 	module: "frappe.core",
			// 	page: "permission_manager",
			// 	method: "update",
			// 	args: args,
			// 	callback: function(r) {
			// 		if(r.exc) {
			// 			// exception: reverse
			// 			chk.prop("checked", !chk.prop("checked"));
			// 		} else {
			// 			me.get_perm(args.role)[args.ptype]=args.value;
			// 		}
			// 	}
			// });
		});
	}

	add_to_changes({doctype, role, permlevel, ptype, value}) {
		let index = this.changes.findIndex(
			d => d.role === role && d.permlevel === permlevel && d.doctype && doctype
		);

		if (index === -1) {
			const length = this.changes.push({
				doctype,
				role,
				permlevel
			});

			index = length - 1;
		}

		this.changes[index][ptype] = value;
	}

	save_changes() {

		return frappe.call({
			module: "frappe.core",
			doctype: "role_permission_manager",
			method: "update_permission_properties",
			args: { values: this.changes },
			freeze: true,
			callback: function(r) {
				console.log(r);
				// if(r.exc) {
				// 	// exception: reverse
				// 	chk.prop("checked", !chk.prop("checked"));
				// } else {
				// 	me.get_perm(args.role)[args.ptype]=args.value;
				// }
			}
		});
	}

	show_add_rule() {
		var me = this;
		$("<button class='btn btn-default btn-primary btn-sm'>"
			+__("Add a New Rule")+"</button>")
			.appendTo($("<p class='permission-toolbar'>").appendTo(this.body))
			.click(function() {
				var d = new frappe.ui.Dialog({
					title: __("Add New Permission Rule"),
					fields: [
						// TODO: add proper filters for DocType and Role
						{fieldtype:"Link", label:__("Document Type"),
							options: 'DocType', reqd:1, fieldname:"parent"},
						{fieldtype:"Link", label:__("Role"),
							options: 'Role', reqd:1,fieldname:"role"},
						{fieldtype:"Select", label:__("Permission Level"),
							options:[0,1,2,3,4,5,6,7,8,9], reqd:1, fieldname: "permlevel",
							description: __("Level 0 is for document level permissions, \
								higher levels for field level permissions.")}
					]
				});
				if(me.get_doctype()) {
					d.set_value("parent", me.get_doctype());
					d.get_input("parent").prop("disabled", true);
				}
				if(me.get_role()) {
					d.set_value("role", me.get_role());
					d.get_input("role").prop("disabled", true);
				}
				d.set_value("permlevel", "0");
				d.set_primary_action(__('Add'), function() {
					var args = d.get_values();
					if(!args) {
						return;
					}
					frappe.call({
						module: "frappe.core",
						page: "permission_manager",
						method: "add",
						args: args,
						callback: function(r) {
							if(r.exc) {
								frappe.msgprint(__("Did not add"));
							} else {
								me.refresh();
							}
						}
					});
					d.hide();
				});
				d.show();
			});
	}


	show_user_permission_doctypes(d) {
		var me = this;
		if (!d.dialog) {
			var fields = [];
			for (let i=0, l=d.linked_doctypes.length; i<l; i++) {
				fields.push({
					fieldtype: "Check",
					label: __("If {0} is permitted", ["<b>" + __(d.linked_doctypes[i]) + "</b>"]),
					fieldname: d.linked_doctypes[i]
				});
			}

			fields.push({
				fieldtype: "Button",
				label: __("Set"),
				fieldname: "set_user_permission_doctypes"
			});

			var dialog = new frappe.ui.Dialog({
				title: __('Apply Rule'),
				fields: fields
			});

			var fields_to_check = d.user_permission_doctypes
				? JSON.parse(d.user_permission_doctypes) : [];

			for (let i=0, l=fields_to_check.length; i<l; i++) {
				dialog.set_value(fields_to_check[i], 1);
			}

			var btn = dialog.get_input("set_user_permission_doctypes");
			btn.on("click", function() {
				var values = dialog.get_values();
				var user_permission_doctypes = [];
				$.each(values, function(key, val) {
					if (val) {
						user_permission_doctypes.push(key);
					}
				});
				if (!user_permission_doctypes || !user_permission_doctypes.length ||
					user_permission_doctypes.length === d.linked_doctypes.length) {
					// if all checked
					user_permission_doctypes = undefined;
				} else {
					user_permission_doctypes.sort();
					user_permission_doctypes = JSON.stringify(user_permission_doctypes);
				}

				frappe.call({
					module: "frappe.core",
					page: "permission_manager",
					method: "update",
					args: {
						doctype: d.parent,
						role: d.role,
						permlevel: d.permlevel,
						ptype: "user_permission_doctypes",
						value: user_permission_doctypes
					},
					callback: function(r) {
						if(r.exc) {
							frappe.msgprint(__("Did not set"));
						} else {
							var msg = frappe.msgprint(__("Saved!"));
							setTimeout(function() { msg.hide(); }, 3000);
							d.user_permission_doctypes = user_permission_doctypes;
							dialog.hide();
							if(r.message==='refresh') {
								me.refresh();
							}
						}
					}
				});
			});

			d.dialog = dialog;
		}

		d.dialog.show();
	}


	make_reset_button() {
		$(`<button class="btn btn-default btn-sm" style="margin-left: 10px;">${__("Restore Original Permissions")}</button>`)
			.appendTo(this.body.find(".permission-toolbar"))
			.on("click", () =>
				this.get_standard_permissions(
					(data) => this.reset_std_permissions(data)
				)
			);
	}


	get_perm(role) {
		return this.perm_list.find(d => d.role === role);
	}

	get_link_fields(doctype) {
		return frappe.get_children("DocType", doctype, "fields",
			{fieldtype:"Link", options:["not in", ["User", '[Select]']]});
	}
};


frappe.PermissionEngine.HelpHTML = `
<div>
	<h4>{%= __("Quick Help for Setting Permissions") %}:</h4>
	<ol>
		<li>{%= __("Permissions are set on Roles and Document Types (called DocTypes) by setting rights like Read, Write, Create, Delete, Submit, Cancel, Amend, Report, Import, Export, Print, Email and Set User Permissions.") %}</li>
		<li>{%= __("Permissions get applied on Users based on what Roles they are assigned.") %}</li>
		<li>{%= __("Roles can be set for users from their User page.") %}
            <a href="#List/User">{%= __("Setup > User") %}</a></li>
		<li>{%= __("The system provides many pre-defined roles. You can add new roles to set finer permissions.") %}<a href="#List/Role"> {%= __("Add a New Role") %}</a></li>
		<li>{%= __("Permissions are automatically translated to Standard Reports and Searches.") %}</li>
		<li>{%= __("As a best practice, do not assign the same set of permission rule to different Roles. Instead, set multiple Roles to the same User.") %}</li>
	</ol>
    <hr>
	<h4>{%= __("Meaning of Submit, Cancel, Amend") %}:</h4>
	<ol>
		<li>{%= __("Certain documents, like an Invoice, should not be changed once final. The final state for such documents is called Submitted. You can restrict which roles can Submit.") %}</li>
		<li>{%= __("You can change Submitted documents by cancelling them and then, amending them.") %}</li>
		<li>{%= __("When you Amend a document after Cancel and save it, it will get a new number that is a version of the old number.") %}</li>
		<li>{%= __("For example if you cancel and amend INV004 it will become a new document INV004-1. This helps you to keep track of each amendment.") %}</li>
	</ol>
    <hr>
	<h4>{%= __("Permission Levels") %}:</h4>
	<ol>
		<li>{%= __("Permissions at level 0 are Document Level permissions, i.e. they are primary for access to the document.") %}</li>
		<li>{%= __("If a Role does not have access at Level 0, then higher levels are meaningless.") %}</li>
		<li>{%= __("Permissions at higher levels are Field Level permissions. All Fields have a Permission Level set against them and the rules defined at that permissions apply to the field. This is useful in case you want to hide or make certain field read-only for certain Roles.") %}</li>
		<li>{%= __("You can use Customize Form to set levels on fields.") %} <a href="#Form/Customize Form">Setup > Customize Form</a></li>
	</ol>
    <hr>
	<h4>{%= __("User Permissions") %}:</h4>
	<ol>
		<li>{%= __("To give acess to a role for only specific records, check the Apply User Permissions. User Permissions are used to limit users with such role to specific records.") %}
			 <a href="#user-permissions">{%= __("Setup > User Permissions Manager") %}</a></li>
		<li>{%= __("Select Document Types to set which User Permissions are used to limit access.") %}</li>
		<li>{%= __("Once you have set this, the users will only be able access documents (eg. Blog Post) where the link exists (eg. Blogger).") %}</li>
		<li>{%= __("Apart from System Manager, roles with Set User Permissions right can set permissions for other users for that Document Type.") %}</li>
	</ol>
    <p>{%= __("If these instructions where not helpful, please add in your suggestions on GitHub Issues.") %}
    	 <a href="https://github.com/frappe/frappe/issues" target="_blank" rel="noopener noreferrer">{%= __("Submit an Issue") %}</a>
    </p>
</div>
`;