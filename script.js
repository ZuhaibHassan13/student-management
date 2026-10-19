const STORAGE_KEY = "students";

const form = document.getElementById("studentForm");
const idField = document.getElementById("studentId");
const nameField = document.getElementById("name");
const rollField = document.getElementById("roll");
const courseField = document.getElementById("course");
const marksField = document.getElementById("marks");
const errorBox = document.getElementById("error");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const tableBody = document.getElementById("tableBody");
const emptyMsg = document.getElementById("empty");
const searchBox = document.getElementById("search");
const statTotal = document.getElementById("statTotal");
const statAvg = document.getElementById("statAvg");

let students = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function render() {
  const query = searchBox.value.trim().toLowerCase();
  const visible = students.filter(s =>
    [s.name, s.roll, s.course].some(v => v.toLowerCase().includes(query))
  );

  tableBody.innerHTML = visible.map(s => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.roll)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td class="marks ${s.marks < 40 ? "low" : ""}">${s.marks}</td>
      <td class="actions-cell">
        <button class="ghost" data-edit="${s.id}">Edit</button>
        <button class="btn-delete" data-delete="${s.id}">Delete</button>
      </td>
    </tr>`).join("");

  emptyMsg.hidden = visible.length > 0;
  emptyMsg.textContent = students.length
    ? "No students match your search."
    : "No students yet. Add the first one using the form.";

  statTotal.textContent = students.length;
  statAvg.textContent = students.length
    ? (students.reduce((sum, s) => sum + s.marks, 0) / students.length).toFixed(1)
    : "–";
}

function resetForm() {
  form.reset();
  idField.value = "";
  errorBox.textContent = "";
  formTitle.textContent = "Add a student";
  saveBtn.textContent = "Add student";
  cancelBtn.hidden = true;
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const id = idField.value;
  const roll = rollField.value.trim();
  const marks = Number(marksField.value);

  if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase() && s.id !== id)) {
    errorBox.textContent = "That roll number already exists. Use a different one.";
    return;
  }
  if (marks < 0 || marks > 100) {
    errorBox.textContent = "Marks must be between 0 and 100.";
    return;
  }

  const data = { name: nameField.value.trim(), roll, course: courseField.value.trim(), marks };

  if (id) {
    students = students.map(s => (s.id === id ? { ...s, ...data } : s));
  } else {
    students.push({ id: crypto.randomUUID(), ...data });
  }

  save();
  resetForm();
  render();
});

tableBody.addEventListener("click", e => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;

  if (editId) {
    const s = students.find(st => st.id === editId);
    idField.value = s.id;
    nameField.value = s.name;
    rollField.value = s.roll;
    courseField.value = s.course;
    marksField.value = s.marks;
    formTitle.textContent = "Edit student";
    saveBtn.textContent = "Save changes";
    cancelBtn.hidden = false;
    nameField.focus();
  }

  if (deleteId) {
    const s = students.find(st => st.id === deleteId);
    if (confirm(`Delete ${s.name}?`)) {
      students = students.filter(st => st.id !== deleteId);
      save();
      render();
    }
  }
});

cancelBtn.addEventListener("click", resetForm);
searchBox.addEventListener("input", render);

render();
