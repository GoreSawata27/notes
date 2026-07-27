// Browser Object Model (BOM)
// Allows JS to interact with the browser (window)

// location → URL related info & navigation
window.location.href; // current URL
window.location.reload(); // reload page
window.location.assign(url); // navigate to new page
window.location.replace(url); // navigate without back option

// history → browser navigation
window.history.back(); // go to previous page
window.history.forward(); // go to next page
window.history.go(-1); // move by steps

// viewport size (visible browser area)
window.innerHeight;
window.innerWidth;

// open & close windows (limited by browsers)
window.open("https://example.com", "_blank");
window.close();

// resize window (mostly blocked in modern browsers)
window.resizeBy(100, 100);
window.resizeTo(800, 600);

// move window position (often blocked)
window.moveBy(50, 50);
window.moveTo(100, 100);

// scrolling the page
window.scrollBy(0, 100); // relative scroll
window.scrollTo(0, 0); // absolute scroll
window.scroll({ top: 0 }); // modern syntax

// print current page
window.print();

// document → entry point to DOM (HTML)
document.title;
document.getElementById("id");

// browser dialogs
alert("Hello");
confirm("Are you sure?");
prompt("Enter your name");
