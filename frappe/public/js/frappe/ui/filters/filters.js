import './filters.html';

class Filters {
    constructor({parent, doctype}) {
        this.parent = parent;
        this.doctype = doctype;
        this.applied_filters = [];

        this.prepare_dom();
        this.prepare_fields();
        this.bind_events();
    }

    prepare_dom() {
        this.$wrapper = $(frappe.render_template('filters'));
        this.$wrapper.appendTo(this.parent);

        this.$filter_edit = this.$wrapper.find('.filter-edit-wrapper');
        this.$filter_tags = this.$wrapper.find('.filter-tags');
    }

    prepare_fields() {
        this.controls = {};

        this.controls.fieldname = frappe.ui.form.make_control({
            parent: this.$wrapper.find('.filter-fieldname'),
            df: {
                fieldtype: 'Autocomplete',
                label: __('Fieldname'),
                options: frappe.meta.get_docfields(this.doctype)
                    .map(df => ({ label: df.label, value: df.fieldname })),
                onchange: () => {
                    this.update_value_control();
                }
            },
            render_input: true,
            only_input: true
        });

        const conditions = [
			{ value: "=", label: __("Equals") },
			{ value: "!=", label: __("Not Equals") },
			{ value: "like", label: __("Like") },
			{ value: "not like", label: __("Not Like") },
			{ value: "in", label: __("In") },
			{ value: "not in", label: __("Not In") },
			{ value: ">", label: ">" },
			{ value: "<", label: "<" },
			{ value: ">=", label: ">=" },
			{ value: "<=", label: "<=" },
			{ value: "Between", label: __("Between") }
		];

        this.controls.condition = frappe.ui.form.make_control({
            df: {
                fieldtype: 'Select',
                fieldname: 'condition',
                options: conditions,
            },
            parent: this.$wrapper.find('.filter-condition'),
            render_input: true,
            only_input: true
        });

        this.controls.value = frappe.ui.form.make_control({
            df: {
                fieldtype: 'Data',
                fieldname: 'value'
            },
            parent: this.$wrapper.find('.filter-value'),
            render_input: true,
            only_input: true
        });

        this.reset_fields();
    }

    update_value_control() {
        const current_fieldname = this.controls.fieldname.get_value();
        if (!current_fieldname) return;

        const condition = this.controls.condition.get_value();
        const docfield = frappe.meta.get_docfield(this.doctype, current_fieldname);

        let df;
        if (this._is_of_type(condition, 'like')) {
            df = {
                fieldtype: 'Data',
                fieldname: 'value'
            }
        }
        else if (docfield.fieldtype === 'Check') {
            df = {
                fieldtype: 'Select',
                fieldname: 'value',
                options: [
                    { label: __('Yes'), value: 1 },
                    { label: __('No'), value: 0 },
                ]
            }
        }
        else {
            df = docfield;
        }

        // no need to change
        if (this.controls.value.df.fieldtype === df.fieldtype) return;

        this.controls.value = frappe.ui.form.make_control({
            df: df,
            parent: this.$wrapper.find('.filter-value').empty(),
            render_input: true,
            only_input: true
        });
    }

    bind_events() {
        this.bind_add_filter();
        this.bind_apply_filter();
        this.bind_filter_tags();
    }

    bind_add_filter() {
        this.$wrapper.on('click', '.btn-add-filter', () => {
            this.reset_fields();
            this.toggle_filter_edit();
        });
    }

    bind_apply_filter() {
        this.$wrapper.on('click', '.btn-apply-filter', () => {
            this.apply_filter();
        });
    }

    bind_filter_tags() {
        this.$filter_tags.on('click', '.btn-tag-edit, .btn-tag-remove', (e) => {
            const $target = $(e.currentTarget);
            const {fieldname} = $target.closest('.btn-group').data();

            if ($target.is('.btn-tag-edit')) {
                this.edit_filter(fieldname);
            } else {
                this.remove_filter(fieldname);
            }
        });
    }

    toggle_filter_edit(flag) {
        if (flag === undefined) {
            this.$filter_edit.toggleClass('hide');
            return;
        }
        this.$filter_edit.toggleClass('hide', !flag);
    }

    apply_filter() {
        const fieldname = this.controls.fieldname.get_value();
        const condition = this.controls.condition.get_value();
        const value = this.process_value();

        const filter = [this.doctype, fieldname, condition, value];

        this.update_filter_and_tag(filter);
        this.toggle_filter_edit(false);
        this.reset_fields();
    }

    process_value() {
        const condition = this.controls.condition.get_value();
        let value = this.controls.value.get_value();

        if (this._is_of_type(condition, 'like')) {
            if (!(value.startsWith('%') || value.endsWith('%'))) {
                value = `%${value}%`
            }
        }

        if (typeof value === 'string') {
            value = value.trim();
        }

        if (value === '%') {
            value = '';
        }

        return value;
    }

    update_filter_and_tag(filter) {
        this.applied_filters.push(filter);
        this.remove_tag(filter[1]);
        this.add_tag(filter);
    }

    remove_filter(fieldname) {
        this.applied_filters = this.applied_filters.filter(f => f[1] !== fieldname);
        this.remove_tag(fieldname);
    }

    edit_filter(fieldname) {
        // edit existing applied filter
        const filter = this.applied_filters.find(f => f[1] === fieldname);
        if (!filter) return;

        const [doctype, _, condition, value] = filter;
        this.toggle_filter_edit(true);

        frappe.run_serially([
            () => this.controls.fieldname.set_value(fieldname),
            () => this.controls.condition.set_value(condition),
            () => this.controls.value.set_value(value)
        ]);
    }

    add_tag(filter) {
        const [doctype, fieldname, condition, value] = filter;
        const label = fieldname + ' ' + condition + ' ' + value;
        const html = `
            <div class="btn-group text-muted" data-fieldname="${fieldname}">
                <button class="btn btn-xs btn-light border btn-tag-edit">${label}</button>
                <button class="btn btn-xs btn-light border btn-tag-remove">
                    <span class="octicon octicon-x" style="font-size: 11px;"></span>
                </button>
            </div>
        `;

        this.$filter_tags.append(html);
    }

    remove_tag(fieldname) {
        this.$filter_tags.find(`[data-fieldname=${fieldname}]`).remove();
    }

    reset_fields() {
        this.controls.fieldname.set_value('');
        this.controls.condition.set_value('=');
        this.controls.value.set_value('');
    }

    filter_exists() {
        return false;
    }

    get_filters() {
        return this.applied_filters;
    }

    add_filters(filters) {
        filters.forEach(filter => this.update_filter_and_tag(filter));
    }

    _is_of_type(condition, type) {
        // type can be 'like', 'in'
        return [type, 'not ' + type].includes(condition);
    }
}

export default Filters;
