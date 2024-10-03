let db = [
  {
    id: 0,
    addedTodo: ["reschedule meet up"],
    date: "Sep 30 2024",
    time: "1:47pm",
  },
  {
    id: 1,
    addedTodo: ["submit report"],
    date: "Oct 30 2024",
    time: "06:45am",
  },
  {
    id: 2,
    addedTodo: ["submit report, reschedule meet up"],
    date: "Oct 30 2024",
    time: "07:45am",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector("#btn-add-entry");
  const formModal = document.querySelector(".form-modal");
  const addModal = document.querySelector("#add-modal");
  const editModal = document.querySelector("#edit-modal");
  const closeModalButton = document.querySelectorAll(".btn-close-entry");
  let modalOptionsButton = document.querySelectorAll(".btn-options");
  const selectedWeek = document.querySelector("#week-selector");
  const today = new Date();
  const weekForm = document.querySelector("#form-week");
  const submitWeek = document.querySelector("#btn-submit-week");
  const dayContainer = document.querySelector("#tb-first-row");
  const toDoContainer = document.querySelector("#tb-second-row");
  const addForm = document.querySelector("#form-add");
  const toBeAdded = document.querySelector("#added-todo");
  const addedDateAndTime = document.querySelector("#added-datetime");
  const todoId = document.querySelector("#todo-id");
  const editForm = document.querySelector("#form-edit");
  const toBeEdited = document.querySelector("#edited-todo");
  const editedDateAndTime = document.querySelector("#edited-datetime");
  let currentEditedTodo;
  let currentEditedDateAndTime;

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;

    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const weekNumber = getWeekNumber(today);
  //   selectedWeek.value = `${today.getFullYear()}-W${weekNumber}`;

  selectedWeek.addEventListener("input", (event) => {
    event.preventDefault();

    let startDate = selectedWeek.valueAsDate;
    startDate.setHours(0, 0, 0, 0);
    let lastDayofTheWeek = new Date(startDate);
    lastDayofTheWeek.setDate(startDate.getDate() + 7);
    let currentDate;
    let filteredDateArray = [];

    const getNextDay = (inc) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + inc);

      return currentDate;
    };

    for (let i = 0; i < 7; i++) {
      const nextDay = getNextDay(i);
      currentDate = nextDay.toDateString().match(/\w{3}\s\d{2}\s\d{4}/);
      filteredDateArray.push(currentDate[0]);
    }

    const displayData = (data) => {
      for (let i = 0; i < toDoContainer.childElementCount; i++) {
        toDoContainer.children[i].innerHTML = "";
        toDoContainer.children[i].innerText = "";
      }
      data.forEach((element) => {
        let nthDay = new Date(element["date"]);
        let dayOfWeek = nthDay
          .toLocaleString("en-US", { weekday: "long" })
          .toLowerCase();
        nthDay = nthDay.getDay();

        let wrapper = document.createElement("div");
        wrapper.id = element["id"];
        wrapper.className = "div-to-do-entry";
        wrapper.innerHTML = `
                <div class="tde-top">
                    <h5>${element["time"]}</h5>
                    <button type="button" class="btn-options">
                        <img src="/images/more-options.png" alt="More options">
                    </button>
                    <div id="${dayOfWeek}-1" class="options-modal">
                        <button type="button" class="btn-edit">Edit</button>
                        <button type="button" class="btn-delete">Delete</button>
                    </div>
                </div>
                <ul>
                    <li>${element["addedTodo"]}</li>
                </ul>
            `;
        toDoContainer.children[nthDay - 1].appendChild(wrapper);
        // console.log(toDoContainer.children);
      });
    };

    // Function to process the data
    const processData = (allData, weekDates) => {
      // Filter the data based on the week input
      const filteredData = allData.filter((item) => {
        return weekDates.includes(item.date);
      });
      console.log(filteredData);

      displayData(filteredData);
    };

    processData(db, filteredDateArray);

    const [year, week] = selectedWeek.value.split("-W");
    const firstDayOfWeek = new Date(year, 0, (week - 1) * 7 + 1);

    for (let i = 0; i < 7; i++) {
      let dayTd = dayContainer.children[i];
      const day = new Date(firstDayOfWeek);
      var dayElement = document.createElement("p");
      dayElement.classList = "p-day sticky";

      day.setDate(firstDayOfWeek.getDate() + i);
      dayElement.innerText = day.toDateString().match(/\d{2}/)[0];

      if (dayTd.childElementCount !== 0) {
        for (let j = 0; j < dayTd.childElementCount; j++) {
          dayTd.removeChild(dayTd.children[j]);
        }
      }
      dayTd.appendChild(dayElement);
    }
  });

  addButton.addEventListener("click", () => (addModal.style.display = "grid"));
  closeModalButton.forEach(element => {
    element.addEventListener("click", (event) => {
      const ancestorElement = event.target.parentElement.parentElement.parentElement;
      if (ancestorElement.id === "add-modal") {
        addModal.style.display = 'none';
      }
      if (ancestorElement.id === "edit-modal") {
        editModal.style.display = 'none';
      }
    });
  });

  const formatDateAndTime = (date, time) => {
    const months = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12'
    };
    let [month, day, year]= date.split(" ");
    month = months[month];
    
    let [hours, minutes] = time.split(":");

    if (new RegExp("pm").test(minutes)) {
      hours = parseInt(hours, 10) + 12;
      // newTime = time.join(":").substring(0, time.indexOf("pm"));
    }

    if (hours.length < 2) {
      hours = `0${hours}`;
    }

    return `${year}-${month}-${day}T${hours}:${minutes.substring(0, 2)}`;
  };

  for (let i = 0; i < toDoContainer.childElementCount; i++) {
    toDoContainer.children[i].addEventListener("click", (event) => {
      const target = event.target;

      if (target.parentElement.classList.contains("btn-options")) {
        let optionsModal = target.parentElement.nextElementSibling;
        let rect = target.parentElement.parentElement.getBoundingClientRect();

        if (
          optionsModal.style.display !== "none" &&
          optionsModal.style.display !== ""
        ) {
          optionsModal.style.display = "none";
        } else {
          optionsModal.style.display = "grid";
          optionsModal.style.top = `${rect.height}px`;
          optionsModal.style.left = `${rect.width - 75}px`;
        }

        for (let i = 0; i < optionsModal.childElementCount; i++) {
          optionsModal.children[i].addEventListener("click", (event) => {
            const rootDiv = event.target.parentElement.parentElement.parentElement;
            const fullDate = db[rootDiv.id]["date"];
            const fullTime = db[rootDiv.id]["time"];
            if(event.target.classList.contains("btn-delete")) {
              db.splice(rootDiv.id, 1)
              rootDiv.remove();
            }
            if(event.target.classList.contains("btn-edit")) {
              currentEditedTodo = event.target.parentElement.parentElement.nextElementSibling.children[0].innerText
              currentEditedDateAndTime = formatDateAndTime(fullDate, fullTime);

              editModal.style.display = 'grid';
              todoId.value = rootDiv.id;
              toBeEdited.value = currentEditedTodo;
              editedDateAndTime.value = currentEditedDateAndTime;
            }
          })
        }
      }
      // console.log(toDoContainer.children[i])
    });
  }

  const changeDateFormat = (dateString) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const [year, month, day] = dateString.split("-");
    return `${months[month - 1]} ${day} ${year}`;
  };

  const changeTimeFormat = (timeString) => {
    const [hour, min] = timeString.split(":");
    if (hour > 12) {
      return `${hour - 12}:${min}pm`;
    } else {
      return `${timeString}am`;
    }
  };

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let addedDate = changeDateFormat(addedDateAndTime.value.split("T")[0]);
    let addedTime = changeTimeFormat(addedDateAndTime.value.split("T")[1]);

    let formData = new FormData();
    formData.append("addedTodo", toBeAdded.value);
    formData.append("date", addedDate);
    formData.append("time", addedTime);

    let newTodo = {
      id: db.length,
      addedTodo: [`${toBeAdded.value}`],
      date: addedDate,
      time: addedTime,
    };

    db.push(newTodo);

    toBeAdded.value = '';
    addedDateAndTime.value = '';
    addModal.style.display = 'none';
  });

  editForm.addEventListener("submit", event => {
    event.preventDefault();

    if (toBeEdited.value === currentEditedTodo && editedDateAndTime.value === currentEditedDateAndTime) {
      alert('No changes entered.')
    }
    else {
      db[event.target[0].value]["addedTodo"] = toBeEdited.value;
      db[event.target[0].value]["date"] = changeDateFormat(editedDateAndTime.value.split("T")[0]);
      db[event.target[0].value]["time"] = changeTimeFormat(editedDateAndTime.value.split("T")[1]);

      editModal.style.display = 'none';
    }
  })
});
