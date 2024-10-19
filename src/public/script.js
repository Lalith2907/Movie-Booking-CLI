const users = [];
const movies = {
  "Dune 2": Array(150).fill(false),
  "Transformers One": Array(150).fill(false),
  "Oppenheimer": Array(150).fill(false),
  "Inception": Array(150).fill(false),
  "Tenet": Array(150).fill(false),
};

let selectedSeat = null;

function saveDetails() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const mobile = document.getElementById("mobile").value;
  
  if (name && email && mobile) {
    fetch("/add-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, mobile }),
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("mobile").value = "";
      })
      .catch((error) => {
        alert("Error saving details.");
        console.error(error);
      });
  } else {
    alert("Please fill in all fields.");
  }
}

function loadUsers() {
  fetch("/get-users")
    .then((response) => response.json())
    .then((data) => {
      users.length = 0;
      users.push(...data);
    })
    .catch((error) => {
      console.error("Error loading users:", error);
    });
}

function searchDetails() {
  const searchName = document.getElementById("searchName").value.toLowerCase();
  fetch(`/search-users?name=${searchName}`)
    .then((response) => response.json())
    .then((users) => {
      const searchResults = document.getElementById("searchResults");
      searchResults.innerHTML = "";
      if (users.length === 0) {
        searchResults.innerHTML = "<p>No users found.</p>";
      } else {
        users.forEach((user) => {
          const userDiv = document.createElement("div");
          userDiv.textContent = `${user.name} - ${user.email} - ${user.mobile}`;
          searchResults.appendChild(userDiv);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
    });
}

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
  });
  document.getElementById(sectionId).style.display = "block";
  if (sectionId === "bookMovie") {
    renderSeatMap();
  }
}

function renderSeatMap() {
  const movie = document.getElementById("movieSelect").value;
  const seatMap = document.getElementById("seatMap");
  seatMap.innerHTML = "";
  movies[movie].forEach((booked, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 15));
    const seatNum = (index % 15) + 1;
    const seat = document.createElement("div");
    seat.className = `seat${booked ? " booked" : ""}`;
    seat.textContent = `${row}${seatNum}`;
    
    if (!booked) {
      seat.onclick = () => selectSeat(index);
    }
    
    seatMap.appendChild(seat);
  });
}

function selectSeat(index) {
  const movie = document.getElementById("movieSelect").value;
  const seatMap = document.getElementById("seatMap");
  
  if (movies[movie][index]) {
    alert("This seat is already booked!");
    return;
  }
  
  if (selectedSeat !== null) {
    const previousSeat = seatMap.children[selectedSeat];
    previousSeat.classList.remove("selected");
  }
  
  selectedSeat = index;
  seatMap.children[selectedSeat].classList.add("selected");
}

function bookSeat() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const movie = document.getElementById("movieSelect").value;

  if (!name || !email || !mobile || selectedSeat === null) {
    alert("Please fill in all details and select a seat.");
    return;
  }
  
  const seatIndex = selectedSeat;
  const row = String.fromCharCode(65 + Math.floor(seatIndex / 15));
  const seatNum = (seatIndex % 15) + 1;
  const seatBooked = `${row}${seatNum}`;
  
  users.push({ name, email, mobile, movie, seat: seatBooked });
  movies[movie][seatIndex] = true;
  const seat = document.getElementById("seatMap").children[seatIndex];
  seat.classList.add("booked");
  seat.classList.remove("selected");
  
  alert(`Seat ${seatBooked} booked successfully for ${movie}!`);
  
  selectedSeat = null;
  renderSeatMap();
}

function generateBill() {
  const name = document.getElementById("billName").value.toLowerCase();
  const user = users.find((u) => u.name.toLowerCase() === name);
  
  if (user && user.movie && user.seat) {
    const billDetails = document.getElementById("billDetails");
    const totalPrice = getSeatPrice(user.seat);
    
    billDetails.innerHTML = `
            <h3>Bill for ${user.name}</h3>
            <p>Email: ${user.email}</p>
            <p>Mobile: ${user.mobile}</p>
            <p>Movie: ${user.movie}</p>
            <p>Seat: ${user.seat}</p>
            <p>Total Price: $${totalPrice}</p>
        `;
  } else {
    alert("User not found or seat/movie details missing!");
  }
}

function getSeatPrice(seat) {
  const row = seat.charAt(0);
  if (row === "J") return 500;
  if (row >= "G" && row <= "I") return 300;
  return 200;
}

showSection("details");