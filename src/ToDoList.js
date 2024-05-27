import React, { useState, useEffect } from "react";
import "./ToDoList.css";

const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

const getDayOfWeek = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("");
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [currentDay, setCurrentDay] = useState(getDayOfWeek());
  const [currentDate, setCurrentDate] = useState(getFormattedDate());
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setCurrentDay(getDayOfWeek());
      setCurrentDate(getFormattedDate());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTask = () => {
    if (newTask.trim() === "" || dueDate.trim() === "") {
      alert("Task description and due date cannot be empty");
      return;
    }
    if (editTaskId) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === editTaskId) {
          return {
            ...task,
            text: newTask,
            priority,
            dueDate,
          };
        }
        return task;
      });
      setTasks(updatedTasks);
      setEditTaskId(null);
    } else {
      const newTasks = [
        ...tasks,
        {
          id: Date.now(),
          text: newTask,
          priority,
          dueDate,
          completed: false,
          completionDateTime: "",
        },
      ];
      setTasks(newTasks);
    }
    setNewTask("");
    setPriority("low");
    setDueDate("");
  };

  const removeTask = (id) => {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  };

  const toggleCompleteTask = (id) => {
    const newTasks = tasks.map((task) => {
      if (task.id === id) {
        task.completed = !task.completed;
        task.completionDateTime = task.completed
          ? new Date().toLocaleString()
          : "";
      }
      return task;
    });
    setTasks(newTasks);
  };

  const handleEditTask = (task) => {
    setNewTask(task.text);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setEditTaskId(task.id);
  };

  const handleSort = (tasks) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return tasks.slice().sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const handleFilter = (tasks) => {
    return tasks.filter((task) =>
      task.text.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const filteredAndSortedTasks = handleSort(handleFilter(tasks));

  return (
    <div className="todo-list">
      <h2>To-Do List</h2>
      <div className="date-time-container">
        <div className="date-box">
          <div className="current-day">{currentDay}</div>
          <div className="current-date">{currentDate}</div>
        </div>
        <div className="time-box">
          <div className="current-time">{currentTime}</div>
        </div>
      </div>
      <div className="task-inputs">
        <label>
          Task Description<span className="required">*</span>:
          <input
            type="text"
            placeholder="Add new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
        </label>
        <label>
          Due Date<span className="required">*</span>:
          <input
            type="date"
            value={dueDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <label>
          Priority:
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </label>
        <button onClick={addTask}>
          {editTaskId ? "Save Changes" : "Add Task"}
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Filter tasks"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="date">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <ul>
        {filteredAndSortedTasks.map((task) => (
          <li
            key={task.id}
            className={task.priority + (task.completed ? " completed" : "")}
          >
            <span onClick={() => toggleCompleteTask(task.id)}>{task.text}</span>
            <span className="due-date">{`Due: ${formatDate(
              task.dueDate
            )}`}</span>
            {task.completed && (
              <span className="completion-date">{`Completed: ${task.completionDateTime}`}</span>
            )}
            <button className="edit-btn" onClick={() => handleEditTask(task)}>
              Edit
            </button>
            <button className="remove-btn" onClick={() => removeTask(task.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDoList;
