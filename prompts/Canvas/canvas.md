**Prompt:**

**Objective:** Develop a nextjs react component "canvas" with a dotted grid background. The canvas should allow users to move or pan infinitely in all directions and zoom in and out smoothly.

**Key Features:**

1. **Infinite Canvas:**
   - The canvas should extend infinitely in all directions (up, down, left, right), allowing the user to pan the view indefinitely.

2. **Dotted Grid Background:**
   - The canvas should have a consistent dotted grid pattern as the background, similar to the image provided.
   - The dots should remain evenly spaced, regardless of zoom level, to maintain visual consistency.

3. **Smooth Zooming:**
   - Users should be able to zoom in and out smoothly using standard gestures (pinch to zoom) or scroll wheel, with a focus on maintaining the grid pattern's integrity during zooming.

4. **Panning:**
   - Users should be able to click and drag to pan across the canvas smoothly. The panning should be seamless, with no visible edges or boundaries.

5. **Performance Optimization:**
   - Ensure that the canvas performs well, even with heavy zooming and panning, by leveraging efficient rendering techniques (e.g., canvas-based rendering, WebGL, or similar technologies).

**Optional Features:**
   - Ability to add elements (e.g., shapes, text) to the canvas that stay in position relative to the grid as the user pans and zooms.
   - Snap-to-grid functionality for any elements added to the canvas.

**Technology Stack:**
   - Consider using HTML5 Canvas API, WebGL, or libraries like Konva.js, PixiJS, or Fabric.js for efficient canvas rendering.
   - Implement zooming and panning functionalities using libraries like `panzoom` or custom JavaScript.
