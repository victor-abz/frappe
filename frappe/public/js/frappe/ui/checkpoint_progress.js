frappe.provide('frappe.ui');

frappe.ui.CheckpointProgress = class CheckpointProgress {
	constructor(opts) {
		Object.assign(this, opts);
		this.make_html();
	}

	make_html() {
		const length = this.steps.length - 1;
		this.wrapper = $(`
			<div className="checkpoint-progress-wrapper">
				<div class="checkpoint-progress">
					<div class="cp-progress">
					</div>
					<div class="cp-progress tracker">
					</div>
					${this.steps.map((step, i) => `<div class="dot ${i==0 ? 'filled':''}" style="left: ${i*100/length}%"></div>`).join("")}
					${this.steps.map((step, i) => `<div class="title" style="left: ${i*100/length}%">${step}</div>`).join("")}
				</div>
			</div>
		`);

		$(this.parent).append(this.wrapper);
	}

	set_completed(number) {
		this.wrapper.find('.tracker').css('width', (number * 100 / this.steps.length) + '%');
		for(var i=1; i <= number; i++) {
			$(this.wrapper.find('.dot').get(i)).addClass('filled');
		}
	}
}