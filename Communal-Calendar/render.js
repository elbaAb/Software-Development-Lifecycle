function sendForm(event) {
  event.preventDefault();
  const firstname = document.getElementById("firstname")?.value || "Unnamed";
  ipcRenderer.send("form-submission", firstname);
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("render.js running");

  const calendarBox = document.getElementById("calendarBox");
  const calendarGrid = document.getElementById("calendarGrid");
  if (!calendarBox || !calendarGrid) return;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /*start of curr week.*/
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  /*beautiful wekday headers.*/
  days.forEach(day => {
    const headerCell = document.createElement("div");
    headerCell.textContent = day;
    headerCell.classList.add("hour-cell");
    headerCell.style.fontWeight = "bold";
    headerCell.style.backgroundColor = "#e0e0e0";
    calendarGrid.appendChild(headerCell);
  });

  /*24/7  event/hour grid */
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("div");
      cell.classList.add("hour-cell");
      cell.dataset.dayIndex = day;
      cell.dataset.hour = hour;
      calendarGrid.appendChild(cell);
    }
  }

  /*setup for event terror*/
  let events = [];
  try {
    const res = await fetch("events.json");
    events = await res.json();
  } catch (err) {
    console.error("events.json not found!!!!", err);
  }

  renderEvents(events, firstDayOfWeek, calendarBox); //renders... the events <3
});

/*evil death terror function to make the events appear from events.json*/
function renderEvents(events, firstDayOfWeek) {
  const hourHeight = 60; 
  const dayMs = 24 * 60 * 60 * 1000;

  
  document.querySelectorAll(".hour-cell").forEach(cell => {
    cell.style.position = "relative";
  });

  events.forEach(event => {
    const startDate = new Date(event["Start Date"]);
    /*use start as end if flubbed*/
    const endDate = new Date(event["End Date"] || event["Start Date"]);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(firstDayOfWeek.getTime() + i * dayMs);

      // Check if event occurs on this day
      const isWithinRange =
        currentDate >= new Date(startDate.setHours(0, 0, 0, 0)) &&
        currentDate <= new Date(endDate.setHours(23, 59, 59, 999));

        /*This is all a bit flubbed rn. Repeated events flood the whole grid with that event. The ranges should be entirely functional, however.*/
      const isSameDay =
        event["Repeat Frequency"] === "Daily" ||
        (event["Repeat Frequency"] === "Weekly" &&
          currentDate.getDay() === startDate.getDay()) ||
        isWithinRange;

      if (!isSameDay) continue;

      /*makes the time string turn into number.*/
      let [startHour, startMin] = event["Time start"].split(":").map(Number);
      let [endHour, endMin] = event["Time end"].split(":").map(Number);

      if (currentDate.toDateString() !== startDate.toDateString()) {
        startHour = 0;
        startMin = 0;
      }

      if (currentDate.toDateString() !== endDate.toDateString()) {
        endHour = 24;
        endMin = 0;
      }

      const duration = (endHour + endMin / 60) - (startHour + startMin / 60);

      /*renders in each hour cell.*/
      for (let h = startHour; h < endHour; h++) {
        const cell = document.querySelector(
          `.hour-cell[data-day-index='${i}'][data-hour='${h}']`
        );
/*makes it not explode if the cell doesn't exist, presumably.*/
        if (!cell) continue;

        const eventBlock = document.createElement("div");
        eventBlock.classList.add("event-block");
        /*thoughtful backup name for an untitiled event*/
        eventBlock.textContent = event["Name"] || "Untitled Event";

        /*cutesy little colors for our presentation.*/
        if (event["Category"] === "Work") eventBlock.style.background = "#b0d6ff";
        else if (event["Category"] === "Health") eventBlock.style.background = "#c3ffb0";
        else eventBlock.style.background = "#f7d9b0";

      /*should make partial hours work kinda*/
        const topOffset = h === startHour ? (startMin / 60) * hourHeight : 0;
        const blockHeight =
          h === endHour - 1 ? ((endMin || 60) / 60) * hourHeight - topOffset : hourHeight - topOffset;
    
        eventBlock.style.position = "absolute";
        eventBlock.style.top = `${topOffset}px`;
        eventBlock.style.left = "0";
        eventBlock.style.width = "100%";
        eventBlock.style.height = `${blockHeight}px`;

        eventBlock.style.boxSizing = "border-box";
        eventBlock.style.fontSize = "12px";
        eventBlock.style.padding = "2px";
        eventBlock.style.border = "1px solid #333";
        eventBlock.style.borderRadius = "4px";
        eventBlock.style.color = "#000";
        eventBlock.style.overflow = "hidden";

        cell.appendChild(eventBlock);
      }
    }
  });
}