// Document Object Model

// The DOM is a tree-like JavaScript representation of your HTML created by the browser.

/*

<body>
  <h1>Hello</h1>
  <p>World</p>
</body>



Document
 └── html
     └── body
         ├── h1
         │   └── "Hello"
         └── p
             └── "World"

             
             


 * DOM vs  Virtual DOM 

The DOM is a browser-created tree representation of HTML. 
Updating the real DOM is slow because it triggers layout and paint operations. 
React uses a Virtual DOM, which is a lightweight JavaScript representation of the UI, 
compares changes using diffing, and updates only the necessary parts of the real 
DOM for better performance.


Reflow vs  Repaint

Reflow is when the browser recalculates layout and geometry of elements.

Repaint is when the browser redraws pixels without recalculating layout.

Difference
Reflow is more expensive than repaint because it affects layout.

**

Reflow recalculates element size and position, while repaint only redraws visual changes. 
Reflow always triggers repaint, but repaint doesn’t trigger reflow. 
That’s why minimizing reflows is critical for performance.

*/
