let list = JSON.parse(localStorage.getItem("tasks")) || [];

function load() {
   setTasksList();
}

let addTaskElement = document.getElementById("add-task-button");

addTaskElement.addEventListener("click", function() {
   let text = document.getElementById("input-task").value;
   list.push(text);
   localStorage.setItem("tasks", JSON.stringify(list));
   setTasksList();
   setDeleteButtons();
});


function setTasksList() {
   list = JSON.parse(localStorage.getItem("tasks")) || [];
   document.getElementById("task-list").innerHTML = "";
   for (const task of list) {
      document.getElementById("task-list").innerHTML += addNewListElement(task);
   }
   setDeleteButtons();
}


function setDeleteButtons() {
   let deleteTaskElement = document.getElementsByClassName("delete-btn");
   list = JSON.parse(localStorage.getItem("tasks")) || [];

   Array.prototype.slice.call(deleteTaskElement).forEach(function(item) {
      item.addEventListener("click", function(e) {
         let i = e.target.parentNode.childNodes[1].textContent;
         e.target.parentNode.remove();
         list.splice(list.indexOf(i), 1);
         localStorage.setItem("tasks", JSON.stringify(list));
      })
   });
}


function addNewListElement(text) {
   return ("<li><input type=\"checkbox\"><span class=\"task\">" + text +
         "</span><button class=\"delete-btn\"> X </button></li>");
}