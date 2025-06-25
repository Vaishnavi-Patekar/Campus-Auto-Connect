function openForm() {
    console.log("openForm() called");
    fetch("/api/checkAuth", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          document.getElementById("bookingForm").style.display = "block";
        } else {
          alert("Please log in to book an auto.");
          window.location.href = "login.html";
        }
      })
      .catch(err => {
        console.error("Error checking login:", err);
      });
  }
  
  function closeForm() {
    document.getElementById("bookingForm").style.display = "none";
  }
  
  function closeSuccess() {
    document.getElementById("successPopup").style.display = "none";
  }
  
  function updateCharges() {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
  
    const charges = {
      "TCOER-Yewalewadi": 20,
      "TCOER-Khadi Machine": 50,
      "Yewalewadi-TCOER": 20,
      "Khadi Machine-TCOER": 50,
    };
  
    const route = from + "-" + to;
    const charge = charges[route];
  
    if (charge) {
      document.getElementById("chargeInfo").innerText = `Charge: ₹${charge}`;
    } else {
      document.getElementById("chargeInfo").innerText = "Invalid route or unavailable service.";
    }
  }
  
  document.getElementById("from").addEventListener("change", updateCharges);
  document.getElementById("to").addEventListener("change", updateCharges);
  
  document.getElementById("autoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
  
    if (from === to) {
      alert("Pickup and destination locations cannot be the same.");
      return;
    }
  
    if (from !== "TCOER" && to !== "TCOER") {
      alert("Booking is only allowed if one of the locations is TCOER.");
      return;
    }
  
    const res = await fetch("/api/book", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    });
  
    if (res.ok) {
      closeForm();
      document.getElementById("successPopup").style.display = "block";
    } else {
      alert("Booking failed.");
    }
  });
  