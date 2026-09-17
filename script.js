(function () {
  const form = document.getElementById("mainForm");
  const recap = document.getElementById("recap");
  const recapContent = document.getElementById("recapContent");
  const count = document.getElementById("count");
  const tableWrapper = document.getElementById("table-wrapper");
  const successMessage = document.getElementById("successMessage");
  let states = {
    appointments: [],
  };
  const fields = {
    name: {
      input: document.getElementById("name"),
      error: document.getElementById("nameError"),
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("emailError"),
    },
    service: {
      input: document.getElementById("service"),
      error: document.getElementById("serviceError"),
    },
    date: {
      input: document.getElementById("date"),
      error: document.getElementById("dateError"),
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("messageError"),
    },
  };
  const messageInput = fields.message.input;
  const charCount = document.getElementById("charCount");
  if (messageInput && charCount) {
    messageInput.addEventListener("input", function () {
      charCount.textContent = `${this.value.length} / 300`;
    });
  }
  function render() {
    if (!count || !tableWrapper) return;
    count.textContent = states.appointments.length;
    if (states.appointments.length === 0) {
      tableWrapper.innerHTML = "<p>Aucune demande en attente.</p>";
      return;
    }
    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Prestation</th>
                    <th>Date</th>
                    <th>Message</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    states.appointments.forEach((appointment) => {
      html += `
            <tr>
                <td><strong>#${appointment.id}</strong></td>
                <td>${escapeHTML(appointment.name)}</td>
                <td>${escapeHTML(appointment.email)}</td>
                <td>${escapeHTML(appointment.service)}</td>
                <td>${escapeHTML(appointment.date)}</td>
                <td>${escapeHTML(appointment.message)}</td>
                <td>
                    <button class="button" data-id="${appointment.id}">Supprimer</button>
                </td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    tableWrapper.innerHTML = html;
  }
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag
    );
  }
  function clearErrors() {
    for (const key in fields) {
      const field = fields[key];
      if (field.error) field.error.textContent = "";
      if (field.input) field.input.classList.remove("error");
    }
  }
  function setError(fieldKey, message) {
    const field = fields[fieldKey];
    if (field.error) field.error.textContent = message;
    if (field.input) field.input.classList.add("error");
  }
  function validateForm(data) {
    let isValid = true;
    clearErrors();
    if (!data.name || data.name.trim() === "") {
      setError("name", "Le nom est obligatoire.");
      isValid = false;
    }
    if (!data.email || data.email.trim() === "") {
      setError("email", "L'email est obligatoire.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("email", "Veuillez saisir une adresse email valide.");
      isValid = false;
    }
    if (!data.service) {
      setError("service", "Veuillez choisir une prestation.");
      isValid = false;
    }
    if (!data.date) {
      setError("date", "La date est obligatoire.");
      isValid = false;
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError("date", "La date ne peut pas être dans le passé.");
        isValid = false;
      }
    }
    if (!data.message || data.message.trim() === "") {
      setError("message", "Le message est obligatoire.");
      isValid = false;
    } else if (data.message.length > 300) {
      setError("message", "Le message ne doit pas dépasser 300 caractères.");
      isValid = false;
    }
    return isValid;
  }
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      const newAppointment = {
        id: Date.now(), 
        name: formData.get("name"),
        email: formData.get("email"),
        service: formData.get("service"),
        date: formData.get("date"),
        message: formData.get("message"),
      };
      if (!validateForm(newAppointment)) {
        const firstError = form.querySelector(".error");
        if (firstError) firstError.focus();
        return;
      }
      states.appointments.push(newAppointment);
      form.reset();
      if (charCount) charCount.textContent = "0 / 300";
      if (validateForm(newAppointment)) {
        successMessage.textContent = "Votre demande a été soumise avec succès.";
      }
      render();
      if (recap && recapContent) {
        recap.classList.add("visible");
        recapContent.innerHTML = `
          <p><strong>Nom :</strong> ${escapeHTML(newAppointment.name)}</p>
          <p><strong>Email :</strong> ${escapeHTML(newAppointment.email)}</p>
          <p><strong>Prestation :</strong> ${escapeHTML(newAppointment.service)}</p>
          <p><strong>Date :</strong> ${escapeHTML(newAppointment.date)}</p>
          <p><strong>Message :</strong> ${escapeHTML(newAppointment.message)}</p>
        `;
      }
    });
  }
  for (const key in fields) {
    const input = fields[key].input;
    if (input) {
      input.addEventListener("input", function () {
        const error = fields[key].error;
        if (error) error.textContent = "";
        this.classList.remove("error");
      });
    }
  }
  if (tableWrapper) {
    tableWrapper.addEventListener("click", function (event) {
      if (event.target.classList.contains("button")) {
        const button = event.target;
        const deleteId = button.getAttribute("data-id");
        states.appointments = states.appointments.filter(
          (appointment) => appointment.id !== Number(deleteId)
        );
        render();
      }
    });
  }
  render();
})();

