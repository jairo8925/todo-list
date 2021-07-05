
setDeleteButtons();


let addTaskElement = document.getElementById("add-task-button");

addTaskElement.addEventListener("click", function() {
   let text = document.getElementById("input-task").value;
   document.getElementById("task-list").innerHTML += addNewListElement(text)
   setDeleteButtons();
});


function setDeleteButtons() {
   let deleteTaskElement = document.getElementsByClassName("delete-btn");

   Array.prototype.slice.call(deleteTaskElement).forEach(function(item) {
      item.addEventListener("click", function(e) {
         e.target.parentNode.remove();
      })
   });
}


function addNewListElement(text) {
   return ("<li>\n" +
       "                <label><input type=\"checkbox\"></label>\n" +
       "                <span class=\"task\">" + text + "</span>\n" +
       "                <button class=\"delete-btn\"> X </button>\n" +
       "            </li>");
}