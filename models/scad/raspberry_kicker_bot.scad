floor_thickness = 15;
inner_gap = 40;

module kicker_hull (thickness=floor_thickness) {
	path="/Users/ryanstonebraker/Documents/Programming/Projects/RaspberryKickerBot/redbull.svg";
	
	linear_extrude(thickness)
		import(path);
}

module kicker_text(thickness=floor_thickness/8) {
	path = "/Users/ryanstonebraker/Documents/Programming/Projects/RaspberryKickerBot/bot_text.svg";
	color([0.9,0.1,0.1])
	linear_extrude(thickness)
		import(path);
}

module mirror_copy (mirror_dir=[1,0,0]) {
	children();
	mirror(mirror_dir)
		children();
}

module motor () {
	mirror_copy([1,0,0])
	translate([-48,20,floor_thickness/2])
	color([0.1,0.1,0.9])
	linear_extrude(20)
	difference () {
		square([40,40], center=true);
		square([20,20]);
	}
}

module rpi () {
	translate([0,75,floor_thickness/2])
	linear_extrude(floor_thickness/2 + 0.001)
		square([95,65], center=true);
}

module breadboard () {
	translate([0,-55,floor_thickness/2])
	linear_extrude(floor_thickness/2 + 0.001)
		square([50,90], center=true);
}

module battery () {
	translate([0,15,floor_thickness/2])
	linear_extrude(floor_thickness/2 + 0.001)
		square([52,30], center=true);
}

module screw_holes (length=floor_thickness/2) {
	mirror_copy([1,0,0])
	translate([35,-85,floor_thickness/2])
	linear_extrude(length + 0.001)
		circle(r=5, center=true, $fn = 5);
	
	mirror_copy([1,0,0])
	translate([70,87,floor_thickness/2])
	linear_extrude(length + 0.001)
		circle(r=5, center=true, $fn = 5);
}

module bottom_plate() {
	difference() {
		kicker_hull();
		motor();
		rpi();
		breadboard();
		battery();
		screw_holes();
	}
}

module top_plate() {
	translate([0, 0, floor_thickness + inner_gap]) {
		translate([0,0,floor_thickness/2])
			kicker_text();
		difference() {
			kicker_hull(floor_thickness/2);
			translate([0,0,-inner_gap - 3 * floor_thickness/4])
				screw_holes(inner_gap + floor_thickness/2);
		}
	}
}

module full_model() {
	bottom_plate();
	top_plate();
	screw_holes(inner_gap + floor_thickness/2);
}

module screw(gap=10) {
	length=floor_thickness/2 + inner_gap;
	translate([-length/2,gap,5])
	rotate([0,90,0])
		linear_extrude(length + 0.001)
		rotate([0,0,72/2])
			circle(r=5, center=true, $fn = 5);	
}

module arranged_screws() {
	screw(0);
	screw(15);
	screw(30);
	screw(-15);
	screw(-30);
}

full_model();