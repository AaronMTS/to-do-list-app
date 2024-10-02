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

        // let topDiv = document.createElement('div');
        // topDiv.className = "tde-top";
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
  modalOptionsButton.forEach((element) => {
    element.addEventListener("click", (Event) => {
      let currentTarget = Event.srcElement.parentElement.nextElementSibling.id;
      let optionsModal = document.querySelector(`#${currentTarget}`);
      let rect = element.parentElement.getBoundingClientRect();

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
    });
  });
});
