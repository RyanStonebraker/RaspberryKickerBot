platform_thickness = 10;
padding = 5;
depth = 5;

module attaching_brace() {
	linear_extrude(20)
		difference() {
		square([platform_thickness + 2 * padding + depth, platform_thickness + 2 * padding], center = true);

		translate([padding/2, 0, 0])
		square([platform_thickness + padding + depth + 0.01, platform_thickness], center = true);
		}
}

attaching_brace();

difference() {
	rotate([-45,0,0])
	translate([-19, -7, -3])
	linear_extrude(20)
		difference() {
			circle(r=8.5);
			circle(r=5.5);
		}

	translate([0,0,-10])
	linear_extrude(10)
	square([75,75], center=true);
}