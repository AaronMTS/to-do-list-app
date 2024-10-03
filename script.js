document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector("#btn-add-entry");
  const addModal = document.querySelector("#add-modal");
  const closeModalButton = document.querySelector("#btn-close-entry");
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
      //   filteredDateArray.push([
      //     currentDate[0],
      //     currentDate["input"].slice(0, 3),
      //   ]);
      // console.log(filteredDateArray);
    }

    fetch(`/db.json`)
      .then((response) => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Parse the response as JSON
        return response.json();
      })
      .then((data) => {
        // Handle the JSON data
        processData(data, filteredDateArray);
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch
        console.error("Fetch error:", error);
      });

    // Function to process the data
    const processData = (allData, weekDates) => {
      // Filter the data based on the week input
      const filteredData = allData.filter((item) => {
        return weekDates.includes(item.date);
      });
      console.log(filteredData);

      displayData(filteredData);
    };

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
        wrapper.className = "div-to-do-entry";

        wrapper.innerHTML = `
                <div class="tde-top">
                    <h5>${element["time"]}</h5>
                    <button type="button" class="btn-options">
                        <img src="/images/more-options.png" alt="More options">
                    </button>
                    <div id="${dayOfWeek}-1" class="options-modal">
                        <button type="button">Edit</button>
                        <button type="button">Delete</button>
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
  closeModalButton.addEventListener(
    "click",
    () => (addModal.style.display = "none")
  );

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
      }
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

  async function readFile(filename) {
    try {
      const response = await fetch(filename);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }

  async function writeFile(filename, data) {
    try {
      const response = await fetch(filename, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (error) {
      console.error("Error writing file:", error);
      return false;
    }
  }

  function parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }

  addForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const filename = "db.json";
    let addedDate = changeDateFormat(addedDateAndTime.value.split("T")[0]);
    let addedTime = changeTimeFormat(addedDateAndTime.value.split("T")[1]);

    let formData = new FormData();
    formData.append("addedTodo", toBeAdded.value);
    formData.append("date", addedDate);
    formData.append("time", addedTime);

    let newTodo = {
      addedTodo: [`${toBeAdded.value}`],
      date: addedDate,
      time: addedTime,
    };

    let fileContents = await readFile(filename);
    if (!fileContents) {
      console.log("No existing data found. Creating new array.");
      fileContents = "[{}]";
    }

    const data = parseJSON(fileContents);
    if (!data) {
      console.log("Failed to parse JSON data.");
      return;
    }

    // Add the new item to the existing data
    data.push(newTodo);

    // Convert the data back to a JSON string
    const updatedData = JSON.stringify(data);

    console.log(updatedData)

    // Write the updated data back to the file
    const success = await writeFile(filename, updatedData);

    if (success) {
      console.log("Data added successfully!");
    } else {
      console.error("Failed to add data to file.");
    }
  });
});
