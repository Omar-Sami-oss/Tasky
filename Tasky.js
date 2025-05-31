var figlet = require("figlet");
var inquirer = require("inquirer");
var dayjs = require("dayjs");
var customParseFormat = require("dayjs/plugin/customParseFormat");
var chalk = require("chalk");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const Table = require("cli-table3");
const prompt = inquirer.createPromptModule();

dayjs.extend(customParseFormat);

class task {
  constructor(ID, name, description, createDate, dueDate, priority, status) {
    this.ID = 0;
    this.name = name;
    this.description = description;
    this.createDate = createDate;
    this.dueDate = dueDate;
    this.priority = priority;
    this.status = status || "Pending";
  }
  getID() {
    return this.ID;
  }
  getName() {
    return this.name;
  }
  getDescription() {
    return this.description;
  }
  getcreateDate() {
    return this.createDate;
  }
  getDueDate() {
    return this.dueDate;
  }
  getPriority() {
    return this.priority;
  }
  getStatus() {
    return this.status;
  }
  setID(ID) {
    this.ID = ID;
  }
}

function getDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
}

function saveData(newItem) {
  newItem.setID(db.get("tasks").value().length + 1);
  db.get("tasks").push(newItem).write();
}

function mainMenu() {
  console.log(chalk.blue("Welcome to Tasky, your task management system!"));
  prompt([
    {
      type: "list",
      name: "option",
      message: "What would you like to do?",
      choices: [
        "Add a new task",
        "View all tasks",
        "Update a task",
        "Delete a task",
        "Clear all completed tasks",
        "Exit",
      ],
    },
  ]).then((answers) => {
    switch (answers.option) {
      case "Add a new task":
        console.clear();
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          console.log(chalk.blue(data));
          addTask();
        });

        break;

      case "View all tasks":
        console.clear();
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.log(chalk.blue(data));
          displayTasks();
          sortTasks();
        });
        break;

      case "Update a task":
        console.clear();
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.log(chalk.blue(data));
          displayTasks();
          updateTask();
        });
        break;

      case "Delete a task":
        console.clear();
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.log(chalk.blue(data));
          displayTasks();
          deleteTask();
        });
        break;
      case "Clear all completed tasks":
        console.clear();
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.log(chalk.blue(data));
          clearCompletedTasks();
        });
        break;

      case "Exit":
        console.log("Exiting Tasky. Goodbye!");
        process.exit();
    }
  });
}

function addTask() {
  prompt([
    {
      type: "input",
      name: "name",
      message: "Enter task name:",
    },
    {
      type: "input",
      name: "description",
      message: "Enter task description:",
    },
    {
      type: "datetime",
      name: "dueDate",
      message: "Enter task due date (DD-MM-YYYY):",
      format: ["dd", "-", "mm", "-", "yyyy"],
    },
    {
      type: "list",
      name: "priority",
      message: "Select task priority:",
      choices: ["Low", "Medium", "High"],
    },
  ]).then((taskData) => {
    switch (taskData.priority) {
      case "Low":
        taskData.priority = 3;
        break;
      case "Medium":
        taskData.priority = 2;
        break;
      case "High":
        taskData.priority = 1;
        break;
    }
    const newTask = new task(
      0,
      taskData.name,
      taskData.description,
      getDate(),
      taskData.dueDate,
      taskData.priority
    );
    console.log("Task created successfully!");
    console.log("Task details:");
    console.log(`Name: ${newTask.getName()}`);
    console.log(`Description: ${newTask.getDescription()}`);
    console.log(`Created Date: ${newTask.getcreateDate()}`);
    console.log(`Due Date: ${newTask.getDueDate()}`);
    console.log(
      `Priority: ${
        newTask.priority == 1
          ? "High"
          : newTask.priority == 2
          ? "Medium"
          : "Low"
      }`
    );
    console.log(`task added successfully!`);
    saveData(newTask);
    setTimeout(() => {
      console.clear();
    }, 1000);
    setTimeout(() => {
      main();
    }, 1100);
  });
}

function displayTasks() {
  const tasks = db.get("tasks").value();
  if (tasks.length === 0) {
    console.log(chalk.red("No tasks available."));
    return;
  }

  const table = new Table({
    head: [
      "ID",
      "Name",
      "Description",
      "Created Date",
      "Due Date",
      "Priority",
      "Status",
    ],
    colWidths: [5, 20, 30, 15, 15, 10, 20],
  });

  tasks.forEach((task) => {
    table.push([
      task.ID,
      task.name,
      task.description,
      dayjs(task.createDate, "DD-MM-YYYY").format("D MMM YYYY"),
      dayjs(task.dueDate, "DD-MM-YYYY").format("D MMM YYYY"),
      task.priority == 1 ? "High" : task.priority == 2 ? "Medium" : "Low",
      task.status,
    ]);
  });
  console.log(table.toString());
}

function sortTasks() {
  prompt([
    {
      type: "list",
      name: "sortOption",
      message: "sort by:",
      choices: [
        "Index",
        "Priority (High to Low)",
        "Priority (Low to High)",
        "Due Date (Newest to Oldest)",
        "Due Date (Oldest to Newest)",
        "Back to Main Menu",
      ],
    },
  ]).then((sortAnswers) => {
    let sortedTasks = db.get("tasks").value();
    switch (sortAnswers.sortOption) {
      case "Index":
        sortedTasks = sortedTasks.sort((a, b) => a.ID - b.ID);
        db.write(sortedTasks);
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.clear();
          console.log(chalk.blue(data));
          displayTasks();
          sortTasks();
        });

        break;

      case "Priority (High to Low)":
        sortedTasks = sortedTasks.sort((a, b) => a.priority - b.priority);
        db.write(sortedTasks);
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.clear();
          console.log(chalk.blue(data));
          displayTasks();
          sortTasks();
        });
        break;

      case "Priority (Low to High)":
        sortedTasks = sortedTasks.sort((a, b) => b.priority - a.priority);
        db.write(sortedTasks);
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.clear();
          console.log(chalk.blue(data));
          displayTasks();
          sortTasks();
        });
        break;

      case "Due Date (Newest to Oldest)":
        sortedTasks = sortedTasks.sort(
          (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
        );
        db.write(sortedTasks);
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.clear();
          console.log(chalk.blue(data));
          displayTasks();
          sortTasks();
        });
        break;

      case "Due Date (Oldest to Newest)":
        sortedTasks = sortedTasks.sort(
          (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
        );
        db.write(sortedTasks);
        figlet.text("Tasky", { font: "Slant" }, function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.clear();
          console.log(chalk.blue(data));
          displayTasks();
          sortTasks();
        });
        break;

      case "Back to Main Menu":
        console.clear();
        main();
        return;
    }
  });
}

function updateTask() {
  prompt([
    {
      type: "input",
      name: "taskIndex",
      message: "Enter the task number you want to update:",
    },
    {
      type: "input",
      name: "name",
      message: "Enter new task name (leave blank to keep current):",
    },
    {
      type: "input",
      name: "description",
      message: "Enter new task description (leave blank to keep current):",
    },
    {
      type: "date",
      name: "dueDate",
      message:
        "Enter new task due date (DD-MM-YYYY, leave blank to keep current):",
    },
    {
      type: "list",
      name: "priority",
      message: "Select new task priority:",
      choices: ["Low", "Medium", "High", "Unchanged"],
    },
    {
      type: "list",
      name: "status",
      message: "Select task status:",
      choices: ["Pending", "Completed"],
    },
  ]).then((updateData) => {
    const tasks = db.get("tasks").value();
    const index = parseInt(updateData.taskIndex) - 1;

    if (index < 0 || index >= tasks.length) {
      console.log(chalk.red("Invalid task number."));
      return;
    }

    const taskToUpdate = tasks[index];

    if (updateData.name) taskToUpdate.name = updateData.name;
    if (updateData.description)
      taskToUpdate.description = updateData.description;
    if (updateData.dueDate) taskToUpdate.dueDate = updateData.dueDate;

    switch (updateData.priority) {
      case "Low":
        taskToUpdate.priority = 3;
        break;
      case "Medium":
        taskToUpdate.priority = 2;
        break;
      case "High":
        taskToUpdate.priority = 1;
        break;
      case "Unchanged":
        break;
    }
    taskToUpdate.status = updateData.status;

    db.get("tasks")
      .find({ name: taskToUpdate.name })
      .assign(taskToUpdate)
      .write();

    console.log("Task updated successfully!");
    setTimeout(() => {
      console.clear();
    }, 1000);
    setTimeout(() => {
      main();
    }, 1100);
  });
}

function deleteTask() {
  prompt([
    {
      type: "input",
      name: "taskIndex",
      message: "Enter the task number you want to delete:",
    },
  ]).then((deleteData) => {
    const tasks = db.get("tasks").value();
    const index = parseInt(deleteData.taskIndex) - 1;

    db.get("tasks").splice(index, 1).write();

    const updatedTasks = tasks.map((task, i) => ({
      ...task,
      ID: i + 1, // Reset IDs to 1-based index
    }));

    // Save back to DB
    db.set("tasks", updatedTasks).write();

    console.log("Task deleted successfully!");
    setTimeout(() => {
      console.clear();
    }, 1000);
    setTimeout(() => {
      main();
    }, 1100);
  });
}

function clearCompletedTasks() {
  const tasks = db.get("tasks").value();
  const completedTasks = tasks.filter((task) => task.status === "Completed");
  if (completedTasks.length > 0) {
    db.get("tasks")
      .remove((task) => task.status === "Completed")
      .write();
    console.log(chalk.green("All completed tasks have been cleared!"));
  } else {
    console.log(chalk.yellow("No completed tasks to clear."));
  }
  setTimeout(() => {
    console.clear();
  }, 1000);
  setTimeout(() => {
    main();
  }, 1100);
}

function main() {
  figlet.text("Tasky", { font: "Slant" }, function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(chalk.blue(data));
    mainMenu(); // Call main menu after figlet is done
  });
}

const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ tasks: [] }).write();
console.clear();
main();
