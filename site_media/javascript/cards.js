Q.UI.Layout.extend("ControlButtons", {
	init: function(p) {
		this._super(Q._defaults(p, {
			w: 100,
			h: 100,
			x: 0,
			y: 0,
			button_type: Q.ControlButtons.DONE, 
			layout: Q.UI.Layout.HORIZONTAL
		}));
		this.on("inserted");
	},

	inserted: function() {
		var callback_done = this.p.callback_done;
		var callback_next = this.p.callback_next;
		var context = this.p.context;
		if(this.p.button_type == Q.ControlButtons.DONE) {
			var b = this.insert(new Q.UI.Button({label: "Done", radius: 0, outlineWidth: 1, outlineColor: "#D9D9D9", stroke: "#D9D9D9", border: 2, fill: "#9c9c9c"}));
			b.on("click", function(){
				context[callback_done]();
			});
		}
		else if(this.p.button_type == Q.ControlButtons.NEXT) {
			var b = this.insert(new Q.UI.Button({label: "Next", radius: 0, outlineWidth: 1, outlineColor: "#D9D9D9", stroke: "#D9D9D9", border: 2, fill: "#9c9c9c"}));
			b.on("click", function(){
				context[callback_next]();
			});
		}
		this.fit(0);
	},
});
Q.ControlButtons.OK = 0;
Q.ControlButtons.OK_CANCEL = 1;
Q.ControlButtons.NEXT = 2;
Q.ControlButtons.DONE = 3;
Q.ControlButtons.YES_NO = 4;



/*
	To display the video
*/
function Video(content) {
	this.filename = content;
	this.status = -1;

	this.nextElement = function() {
		return this.next;
	};
}


/*
	To be used when we want to show text and optionally image as well. 
	Image can be placed at multiple places depending upon the context. 
	For example, in the case of multiple choice question in which choices have image and text both,
	we might want image to be above the text.
	However, in the question text where the image might represent the person asking the question, we want the image to be on the left.

	(text, image, layout, isSelectable) {
*/
Q.UI.Layout.extend("ImageText", {
	init: function(p) {
		var adjustedP= Q._defaults(p, {
			w: 300,
			h: 100,
			type: Q.SPRITE_PURE_UI,
			collisionMask: Q.SPRITE_NONE,
			separation_x: 10,
			separation_y: 10,
			isSelected: false,
			layoutType: Q.ImageText.LEFT_POSITION,
			isSelectable: false,
			fill: "rgba(255, 255, 255, 1)",
			radius: 0,
		});

		var layout = Q.UI.Layout.VERTICAL;
		if(adjustedP.layoutType == Q.ImageText.LEFT_POSITION)
			layout = Q.UI.Layout.HORIZONTAL;

		this._super(Q._defaults(adjustedP, {layout: layout, }));

		this.on("inserted");
		if(this.p.isSelectable) {
			this.add("Touch");
			this.on("touch");
		}
	},

	inserted: function() {
		if(this.p.isSelectable) {
			this.p.bullet = new Q.Rectangle({radius: 10, type: Q.SPRITE_NONE});
			this.insert(this.p.bullet);
		}

		if(this.p.label)
			this.insert(this.p.label);

		this.fit(10);
	},

	touch: function() {
		console.log("touch");
		this.p.isSelected = !this.p.isSelected;
		if(this.p.isSelectable) {
			this.p.bullet.p.isSelected = !this.p.bullet.p.isSelected;
		}
	},
});
Q.ImageText.LEFT_POSITION = 1;
Q.ImageText.TOP_POSITION = 2;


function NumericInput(type, initial_value, min_value, max_value) {
	this.type = NumericInput.SPINNER;
	this.min_value = min_value;
	this.max_value = max_value;
	this.value = initial_value;
}
NumericInput.SPINNER = 1;
NumericInput.SLIDER = 1;


//question, choices, isSelectALL
Q.UI.Layout.extend("MultipleChoiceQuestion", {
	init: function(p) {
		this._super(Q._defaults(p, {
//			x: 400, 
//			y: 300,
			w: 400,
			h: 500,
			type: Q.SPRITE_NONE,
			collisionMask: Q.SPRITE_NONE,
			separation_y: 10,
			align: Q.UI.Layout.LEFT_ALIGN,

			fill: "grey",
			radius: 0,

			status: Q.Form.INCOMPLETE,
			isSelectAll: false,
			answers: [],
			layout: Q.UI.Layout.VERTICAL,
		}));
		this.on("inserted");
	},

	inserted: function() {
		this.insert(this.p.question);
		for(var i = 0; i < this.p.choices.length; i++) {
			this.insert(this.p.choices[i]);
		}
		this.fit(10);
	},
});

/*
	To be used when we want to ask a question that has a numeric answer
	'exit_type' defines how the question will be considered answered. For example,
	should there is "Ok" and "Cancel" button, or just "Continue" button.
*/
function NumericQuestion(question, input) {
	this.question = question;
	this.choices = input;
}


/**
	Important variables to be passed:
		content: an array of all the questions/videos/text to be shown in this form
		exit_type: defines how the question will be considered answered. For example,
			should there is "Ok" and "Cancel" button, or just "Continue" button.
*/
Q.UI.Layout.extend("Form", {
	init: function(p) {
		this._super(Q._defaults(p, {
			x: 400,
			y: 300,
			w: 500,
			h: 400,
			type: Q.SPRITE_NONE,
			collisionMask: Q.SPRITE_NONE,
			separationType: 1,
			align: Q.UI.Layout.LEFT_ALIGN | Q.UI.Layout.START_TOP,
			status: Q.Form.INCOMPLETE,

			fill: "rgba(255, 255, 255, 1)",
			radius: 0,
		}));
		this.on("destroyed");
		this.on("inserted");
	},

	destroyed: function() {
		this.children.forEach(function(child) {
			child.destroy();
		});
	},

	inserted: function() {
		this.insert(this.p.content[0]);
		this.insert(new Q.ControlButtons({context: this, callback_done: "done"}));
	},


	done: function() {
		alert("done");
	},

	next: function() {
		if(this.next == null)
			return null;
		return this.p.next;
	}
});

Q.Form.INCOMPLETE = 1;
Q.Form.COMPLETE = 2;


var testform = new Q.Form(
				{
					content: [
						new Q.MultipleChoiceQuestion({
							question: new Q.ImageText({
								label: new Q.UI.Text({label: "Did you?", type: Q.SPRITE_NONE})
							}), 
							choices: [
								new Q.ImageText({
									label: new Q.UI.Text({label: "Yes", type: Q.SPRITE_NONE}),
									isSelectable: true,
								}), 
								new Q.ImageText({
									label: new Q.UI.Text({label: "No", type: Q.SPRITE_NONE}),
									isSelectable: true,
								}), 
							],
						})
					]
				}
			);

Q.scene("test", function(stage) {
	stage.insert(testform);
});