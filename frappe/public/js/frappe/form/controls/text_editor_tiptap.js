import TipTapEditor from './TipTapEditor/index.vue';

frappe.ui.form.ControlTextEditor = frappe.ui.form.ControlCode.extend({
	make_input() {
		this.has_input = true;
		this.make_tiptap_editor();
	},

	make_tiptap_editor() {
		if (this.tiptap) return;
		this.tiptap_container = $('<div>').appendTo(this.input_area);
		this.tiptap = new Vue({
			el: this.tiptap_container[0],
			render: h => h(TipTapEditor, {
				ref: 'editor',
				on: {
					change: frappe.utils.debounce((value) => {
						this.parse_validate_and_set_in_model(value);
					}, 300)
				}
			})
		});
	},

	parse(value) {
		if (value == null) {
			value = "";
		}
		return frappe.dom.remove_script_and_style(value);
	},

	set_formatted_input(value) {
		if (!this.tiptap) return;
		if (value === this.get_input_value()) return;
		if (!value) {
			// clear contents for falsy values like '', undefined or null
			this.tiptap.$refs.editor.editor.clearContent();
			return;
		}

		console.log(value)

		// set html without triggering a focus
		this.tiptap.$refs.editor.editor.setContent(value);
	},

	get_input_value() {
		return this.tiptap ? this.tiptap.$refs.editor.editor.getHTML() : '';
	}
});


