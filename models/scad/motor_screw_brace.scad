motor_width = 100;
motor_height = 50;
arm_length = 50;
thickness = 15;
depth_padding = 10;

screw_radius = 7.5;
screw_length = 30;
screw_head_height = 5;
nut_height = 10;
nut_radius = 15;
nut_inner_radius_padding = 1;

include <../dependencies/threads.scad>

module brace () {
linear_extrude(depth_padding * 2 + screw_radius * 2)
	difference() {
		square([motor_width + arm_length * 2 + thickness * 2, motor_height], center=true);

		translate([0,-thickness, 0])
			square([motor_width, motor_height], center=true);

		for(i = [-1:2:1])
		translate([i*(motor_width + thickness), thickness, 0])
			square([motor_width, motor_height], center=true);

	}
}

module screw_shaft(padding=0) {
	cylinder(r=screw_radius, h = thickness + screw_length);
	//metric_thread (screw_radius * 2 + padding, 5, thickness + screw_length);
}

module screw() {
	cylinder(r=screw_radius + depth_padding/2, h = screw_head_height);
	translate([0,0,screw_head_height])
	screw_shaft();
}

module nut() {
	difference() {
		cylinder(r=nut_radius * 2, h=nut_height, $fa=50);
		translate([0,0,thickness+screw_length - 0.001])
		rotate([180,0,0])
		screw_shaft(nut_inner_radius_padding);
	}
}

module screws_inplace() {
	for(i = [-1:2:1]) {
		translate([i*(motor_width/2 + thickness + arm_length/2),-depth_padding + screw_head_height + 0.001,depth_padding + screw_radius]) {
			rotate([90,0,0]) {
				screw();
			}
		}
	}
}

module brace_with_holes() {
	difference() {
		brace();
		screws_inplace();
	}
}

module printable_screws() {
	for(i = [-1:2:1])
		translate([i * 25, 0, 0])
			screw();
}

module printable_nuts() {
	for(i = [-1:2:1])
		translate([0, i * (25 + nut_radius), 0])
			nut();
}

module printable_hardware() {
	printable_nuts();
	printable_screws();

	translate([-(nut_radius + motor_height),0,0])
	rotate([0,0,90])
	brace_with_holes();
}

printable_hardware();
