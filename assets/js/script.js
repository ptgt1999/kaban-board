// Retrieve tasks and nextId from localStorage - assigned empty array for tasks and 0 for nextId if no data is found.
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 0;

// Generate elements for each task stage, To Do, In Progress, and Done.
const $toDoElement = $("#todo-cards").addClass('lane');
const $inProgressElement = $("#in-progress-cards").addClass('lane');
const $doneElement = $("#done-cards").addClass('lane');

// Function to generate a unique task id - increment nextId and save to localStorage.
function generateTaskId() {
    nextId++;
    localStorage.setItem('nextId', nextId);
    return nextId;
}


// Todo: create a function to create a task card.
// Function to create task card with title, description, due date, and delete button. Add subsequent classes to card base.
function createTaskCard(task) {
    const $tCard = $("<div>").addClass("card dragTask").attr("id", task.id).css('margin', '5%');
    const $taskCardHeader = $("<h4>").addClass("card-header").text(task.title);
    const $taskCardBody = $("<div>").addClass("card-body").text(task.description);
    const $taskCardDate = $("<div>").addClass("card-footer").text(task.dueDate);
    const $taskCardDelete = $("<a>").addClass("btn btn-danger delete-task").text("Delete Task").attr("data-id", task.id);


// Add class to card based on due date status.
const statusClass = cardDue(task.dueDate);
$tCard.addClass(statusClass);


// Append elements to card and return card.
$taskCardBody.append($taskCardDate, $taskCardDelete); 
$tCard.append($taskCardHeader, $taskCardBody);
return $tCard;
}


// Todo: create a function to render the task list and make cards draggable.
// Function to renderTaskList - empty the task list elements, create a card for each task, and append to the appropriate lane.
function renderTaskList() {
    $toDoElement.empty();
    $inProgressElement.empty();
    $doneElement.empty();

// Retrieve tasks from local storage
taskList = JSON.parse(localStorage.getItem("tasks")) || [];

// Loop through the task list and create cards
for (let task of taskList) {
    let card = createTaskCard(task);
    if (task.status === "to-do") {
        $toDoElement.append(card);
    } else if (task.status === "in-progress") {
        $inProgressElement.append(card);
    } else {
        $doneElement.append(card);
    }
}

// Make the cards draggable and create a visual clone for dragging effect
$(".dragTask").draggable({
    zIndex: 100,
    opacity: 0.5,
    helper: function(event) {
        let originalcard = $(event.target).hasClass('dragTask') ? $(event.target) : $(event.target).closest('.dragTask');
        return originalcard.clone().css({
            width: originalcard.outerWidth(),
        });
    }
});
}


// Todo: create a function to handle adding a new task
// Function to handleAddTask - prevent default form submission, get values from form, create a new task object, clear the form, add the new task to the task list, and push to local storage.
function handleAddTask(event){
event.preventDefault();

// Get the values from the form
let titleE = $("#titleInput").val();
let dueDate = $("#dateInput").val();
let description = $("#taskInput").val();

// New task Id
let newId = generateTaskId();

// Create a new task object
let newTask = {
    title: titleE,
    dueDate: dueDate,
    description: description,
    id: newId,
    status: "to-do"
};

// Clear the form
$("#form").trigger("reset");

// Add the new task to the task list and push to local storage
taskList.push(newTask);
localStorage.setItem('tasks', JSON.stringify(taskList));

// Render the task list
renderTaskList();
}


// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    let deleteID = parseInt($(event.target).closest('.card').attr('id'));
// Filter the task list to remove the task with the deleteID
    taskList = taskList.filter((task) => task.id !== deleteID);
    localStorage.setItem("tasks", JSON.stringify(taskList));
//Remove the card from the DOM
    $(event.target).closest('.card').remove();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    let taskId = ui.draggable[0].id;
    let newStatus = event.target.id;
    let updateTask = JSON.parse(localStorage.getItem('tasks'));

// Update the task status
for (let task of updateTask) {
    if (task.id === taskId) {
        task.status = newStatus;
    }
}

// Update the task list in local storage
localStorage.setItem("tasks", JSON.stringify(updateTask));

// Render the task list
renderTaskList();
}


// Todo: create a function to handle dropping a task into a new status lane
// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    let taskId = ui.draggable[0].id;
    let newStatus = event.target.id;
    let updateTask = JSON.parse(localStorage.getItem('tasks'));

// Update the task status
for (let task of updateTask) {
    if (task.id === taskId) {
        task.status = newStatus;
    }
}

// Update the task list in local storage
localStorage.setItem("tasks", JSON.stringify(updateTask));

// Render the task list
renderTaskList();
}


// Create a function to return class depending on task status
function cardDue(dueDate) {
    let today = dayjs();
    let taskDate = dayjs(dueDate);
// Calculate the difference between the due date and today
let difference = today.diff(taskDate, 'd', true);
// Return the class based on the difference
if (difference > 1) {
    return "overdue";
} else if (difference > 0 && difference <= 1) {
    return "due-today";
} else {
    return "upcoming";
}
}
// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
// add listener to execute handleAddTask function
$("#saveTask").on("click", handleAddTask);

//  add listener to execute handleDeleteTask function
$(".container").on("click", '.delete-task', handleDeleteTask);

// add date picker to due date field
$("#dateInput").datepicker({
    changeMonth: true,
    changeYear: true,
});

// Make the .lane elements droppable
$(".lane").droppable({
    accept: ".dragTask", 
    drop: function(event, ui) {
// Get the id of the task that was moved
let movedTaskID = Number($(ui.draggable).attr('id'));

// Get the status of the lane that the task was dropped into
let newStatus = $(this).attr('id');

// Get the task list from local storage
let taskList = JSON.parse(localStorage.getItem("tasks"));

// Find the task that was moved and update its status
for (let task of taskList) {
    if (task.id === movedTaskID) {
        task.status = newStatus;
        break;
    }
}

// Save the updated task list back to local storage
localStorage.setItem("tasks", JSON.stringify(taskList));

// Conditional state to change the class of the card based on the new status
//This will change the color of the card when moved in or out of the "done" lane
if (newStatus === "done") {
    $(ui.draggable).addClass("upcoming");
} else {
    $(ui.draggable).removeClass("upcoming");
}

// Append the dragged task to the lane
ui.draggable.detach().appendTo($(this));
    }
});

// render the task list
renderTaskList();

});