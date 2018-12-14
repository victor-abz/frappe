// import Awesomplete from 'awesomplete';

frappe.ui.form.ControlTableMultiSelect = frappe.ui.form.ControlLink.extend({
	make_input() {
		this._super();
		this.$input_area
			.addClass('table-multiselect form-control')
			.prepend(`<div class="table-multiselect-items">
				<span class="table-multiselect-item">Test</span>
			</div>`)

		this.$input.removeClass('form-control')

		this.selected_values = [];

		this.$input.on('keydown', (e) => {
			if (e.keyCode === frappe.ui.keyCode.ENTER) {
				console.log(e.target.value)
			}
		})

		// this.get_link_field

		// this.$wrapper.append(`
		//     <div class="form-control table-multiselect">
		//         <div class="table-multiselect-items">
		//             <span class="table-multiselect-item">Test</span>
		//         </div>
		//         <div class="inline-block">
		//             <input type="text" />
		//         </div>
		//     </div>
		// `)

		// this.$autocomplete_input = this.$wrapper.find('input');

		// this.awesomplete = new Awesomplete(this.$autocomplete_input[0], {
		//     list: ['Test', 'Test 1']
		// })

		// add title if prev field is not column / section heading or html
		// this.grid = new Grid({
		// 	frm: this.frm,
		// 	df: this.df,
		// 	perm: this.perm || (this.frm && this.frm.perm) || this.df.perm,
		// 	parent: this.wrapper
		// });
	},
	set_value(value) {
		debugger
	},
	get_value() {
	},
	get_link_field() {
		const meta = frappe.get_meta(this.df.options);
		return meta.fields.find(df => df.fieldtype === 'Link');
	},
	get_options() {
		return this.get_link_field().options;
	}
});
