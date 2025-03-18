const questionnaires = JSON.parse(localStorage.getItem("questionnaires")) || [];

if (!localStorage.getItem("completions")) {
  const completions = questionnaires.map((q) => ({ id: q.id, count: 0 }));
  localStorage.setItem("completions", JSON.stringify(completions));
}

const completions = JSON.parse(localStorage.getItem("completions")) || [];

function loadCatalog() {
  const catalogDiv = document.getElementById("catalog");
  catalogDiv.innerHTML = "";

  questionnaires.forEach((q) => {
    const card = createQuestionnaireCard(q);
    catalogDiv.appendChild(card);
  });
}

function createQuestionnaireCard(questionnaire) {
  const questionCount = questionnaire.questions.length;
  const completionCount =
    completions.find((c) => c.id === questionnaire.id)?.count || 0;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h2>${questionnaire.name}</h2>
    <p>${questionnaire.description}</p>
    <p><strong>Questions:</strong> ${questionCount}</p>
    <p><strong>Completions:</strong> ${completionCount}</p>
    <div class="actions">
      <button onclick="editQuestionnaire(${questionnaire.id})">Edit</button>
      <button onclick="runQuestionnaire(${questionnaire.id})">Run</button>
      <button onclick="deleteQuestionnaire(${questionnaire.id})">Delete</button>
    </div>
  `;
  return card;
}

function editQuestionnaire(id) {
  window.location.href = `builder.html?id=${id}`;
}

function deleteQuestionnaire(id) {
  const confirmation = confirm(
    "Are you sure you want to delete this questionnaire?"
  );
  if (confirmation) {
    const index = questionnaires.findIndex((q) => q.id === id);
    if (index !== -1) {
      questionnaires.splice(index, 1);

      const completionIndex = completions.findIndex((c) => c.id === id);
      completions.splice(completionIndex, 1);

      localStorage.setItem("questionnaires", JSON.stringify(questionnaires));
      localStorage.setItem("completions", JSON.stringify(completions));

      loadCatalog();
    }
  }
}

function runQuestionnaire(id) {
  window.location.href = `run.html?id=${id}`;
}

loadCatalog();
