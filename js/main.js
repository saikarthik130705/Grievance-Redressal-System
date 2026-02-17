// ================= SIGNUP SYSTEM =================

function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  fetch("http://127.0.0.1:5000/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      joined: new Date().toLocaleDateString(),
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.message || "Error");
        });
      }
      return res.json();
    })
    .then(() => {
      alert("Account Created Successfully!");
      window.location.href = "index.html";
    })
    .catch((err) => alert("Error: " + err.message));
}

// ================= LOGIN SYSTEM =================

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  fetch("http://127.0.0.1:5000/users")
    .then((res) => res.json())
    .then((users) => {
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        alert("Invalid email or password");
        return;
      }

      localStorage.setItem("username", user.name);
      localStorage.setItem("role", user.role);
      localStorage.setItem("email", user.email);

      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      console.error(err);
      alert("Error logging in");
    });
}

function logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  window.location.href = "index.html";
}

// ================= NAVIGATION =================

function goDashboard() {
  window.location.href = "dashboard.html";
}
function goProfile() {
  window.location.href = "profile.html";
}

// ================= DASHBOARD =================

function loadDashboard() {
  const role = localStorage.getItem("role");

  Promise.all([
    fetch("http://127.0.0.1:5000/tickets").then((res) => res.json()),
    fetch("http://127.0.0.1:5000/complaints").then((res) => res.json()),
  ]).then(([tickets, complaints]) => {
    const total = tickets.length;
    const pending = tickets.filter((t) => t.status === "Pending").length;
    const completed = tickets.filter(
      (t) => t.status === "Completed"
    ).length;

    document.getElementById("analytics").innerHTML = `
      <div class="card">Total Tickets <h2>${total}</h2></div>
      <div class="card">Pending <h2>${pending}</h2></div>
      <div class="card">Completed <h2>${completed}</h2></div>
      <div class="card">Officer Complaints <h2>${complaints.length}</h2></div>
    `;

    let links = "";

    if (role === "user") {
      links = `
        <button onclick="location.href='user-submit.html'">Submit Issue</button>
        <button onclick="location.href='user-track.html'">Track Ticket</button>
        <button onclick="location.href='user-officer-complaint.html'">Report Officer</button>
      `;
    }

    if (role === "agent") {
      links = `<button onclick="location.href='agent.html'">Assigned Tickets</button>`;
    }

    if (role === "admin") {
      links = `<button onclick="location.href='admin.html'">Admin Panel</button>`;
    }

    document.getElementById("roleLinks").innerHTML = links;
  });
}

// ================= ADMIN =================

function loadAdmin() {
  const ticketContainer = document.getElementById("adminTickets");
  const complaintContainer = document.getElementById("officerComplaintsBox");

  ticketContainer.innerHTML = "Loading tickets...";
  complaintContainer.innerHTML = "Loading complaints...";

  Promise.all([
    fetch("http://127.0.0.1:5000/tickets").then((res) => res.json()),
    fetch("http://127.0.0.1:5000/complaints").then((res) => res.json()),
  ])
    .then(([tickets, complaints]) => {
      ticketContainer.innerHTML = "";
      complaintContainer.innerHTML = "";

      tickets.forEach((t) => {
        ticketContainer.innerHTML += `
          <div class="card">
            <h4>Ticket #${t.id}</h4>
            <p>${t.description}</p>
            <p>Status: <strong>${t.status}</strong></p>
            <button onclick="updateTicket(${t.id}, 'Completed')">
              Mark Completed
            </button>
            <button onclick="updateTicket(${t.id}, 'Pending')">
              Mark Pending
            </button>
          </div>
        `;
      });

      complaints.forEach((c) => {
        complaintContainer.innerHTML += `
          <div class="card">
            <h4>Complaint #${c.id}</h4>
            <p>Officer: ${c.officerName}</p>
            <p>Dept: ${c.department}</p>
            <p>${c.description}</p>
            <p>Status: <strong>${c.status}</strong></p>
            <button onclick="updateComplaint(${c.id}, 'Resolved')">
              Resolve
            </button>
            <button onclick="updateComplaint(${c.id}, 'Under Review')">
              Under Review
            </button>
          </div>
        `;
      });
    })
    .catch((err) => {
      console.error(err);
      ticketContainer.innerHTML = "Error loading tickets";
      complaintContainer.innerHTML = "Error loading complaints";
    });
}

// ================= TICKET SYSTEM =================

function submitProblem() {
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;

  if (!description || !location) {
    alert("Please fill all fields");
    return;
  }

  fetch("http://127.0.0.1:5000/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description,
      location,
      status: "Pending",
      assignedStaff: "Agent Kumar",
      estimatedTime: "48 Hours",
    }),
  })
    .then((res) => res.json())
    .then(() => alert("Ticket Created Successfully!"))
    .catch((err) => {
      console.error(err);
      alert("Error creating ticket");
    });
}

// ================= OFFICER COMPLAINT SYSTEM =================

function generateComplaintID() {
  return "OC-2026-" + Math.floor(1000 + Math.random() * 9000);
}

function submitOfficerComplaint() {
  const officerName = document.getElementById("officerName").value;
  const department = document.getElementById("department").value;
  const description = document.getElementById("officerDescription").value;
  const location = document.getElementById("officerLocation").value;

  if (!officerName || !department || !description || !location) {
    alert("Please fill all fields");
    return;
  }

  const complaint = {
    complaintId: "OC-" + Date.now(),
    officerName: officerName,
    department: department,
    description: description,
    location: location,
    status: "Under Review",
    reportedBy: "Citizen",   // temporary fix
    date: new Date().toLocaleDateString(),
  };

  fetch("http://127.0.0.1:5000/complaints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaint),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Server error");
      }
      return res.json();
    })
    .then(() => {
      alert("Complaint Submitted Successfully!");
    })
    .catch((err) => {
      console.error(err);
      alert("Error submitting complaint");
    });
}

// ================= STATUS UPDATES =================

function updateTicket(id, status) {
  fetch(`http://127.0.0.1:5000/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
    .then((res) => res.json())
    .then(() => loadAdmin());
}

function updateComplaint(id, status) {
  fetch(`http://127.0.0.1:5000/complaints/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
    .then((res) => res.json())
    .then(() => loadAdmin());
}
