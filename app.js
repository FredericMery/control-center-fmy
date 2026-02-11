const modal = document.getElementById("modal");
const fab = document.getElementById("fab");
const saveBtn = document.getElementById("saveBtn");
const list = document.getElementById("actionsList");
const counter = document.getElementById("counter");

function loadActions() {
  let actions = JSON.parse(localStorage.getItem("actions") || "[]");

  // tri par deadline
  actions.sort((a,b) => new Date(a.deadline) - new Date(b.deadline));

  list.innerHTML = "";

  actions.forEach((a, index) => {
    const div = document.createElement("div");
    div.className = "action-card";
    div.innerHTML = `
      <strong>${a.text}</strong>
      <div class="deadline">${a.deadline || "Sans date"}</div>
    `;
    list.appendChild(div);
  });

  counter.textContent = actions.length + " actions";
}

fab.onclick = () => modal.classList.remove("hidden");

saveBtn.onclick = () => {
  const text = document.getElementById("actionText").value;
  const deadline = document.getElementById("deadline").value;

  if (!text) return;

  let actions = JSON.parse(localStorage.getItem("actions") || "[]");

  actions.push({
    text,
    deadline,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("actions", JSON.stringify(actions));

  document.getElementById("actionText").value = "";
  document.getElementById("deadline").value = "";
  modal.classList.add("hidden");

  loadActions();
};

window.onload = loadActions;
