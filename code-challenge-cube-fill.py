from manim import *

class FillCubeWithVoxelsWireframe(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75*DEGREES, theta=-45*DEGREES)

        # Define parameters
        cube_size = 3  # Size of the cube
        voxel_size = 0.5  # Size of each voxel
        num_voxels = int(cube_size / voxel_size)  # Number of voxels per dimension

        # Create the wireframe cube
        wireframe_cube = Cube(side_length=cube_size, fill_opacity=0.7, fill_color=BLUE)
        wireframe_cube.set_opacity(0)  # Make faces transparent
        wireframe_cube.set_stroke(width=2)  # Emphasize the edges
        axes = ThreeDAxes()

        # Animate the creation of the wireframe
        self.play(Create(wireframe_cube))

        # Generate the voxels
        for x in range(num_voxels):
            for y in range(num_voxels):
                for z in range(num_voxels):
                    # Create an individual voxel
                    voxel = Cube(
                        side_length=voxel_size,
                        fill_color=BLUE,
                        fill_opacity=1,
                        stroke_width=0
                    )
                    voxel.shift(
                        np.array([
                            x * voxel_size - cube_size / 2 + voxel_size / 2,
                            y * voxel_size - cube_size / 2 + voxel_size / 2,
                            z * voxel_size - cube_size / 2 + voxel_size / 2,
                        ])
                    )

                    # Animate the appearance of this voxel
                    self.play(FadeIn(voxel, scale=0.5), run_time=0.1)

        # Pause to display the filled cube
        self.wait(2)
