const urlParams = new URLSearchParams(window.location.search);
const surveyId = parseInt(urlParams.get("id"), 10);
const questionnaires = JSON.parse(localStorage.getItem("questionnaires")) || [];
const completions = JSON.parse(localStorage.getItem("completions")) || [];
const answers = JSON.parse(localStorage.getItem("answers")) || [];

function loadQuestionnaire() {
  const statisticsContainer = document.getElementById("statisticsContainer");
  const questionnaireContainer = document.getElementById(
    "questionnaireContainer"
  );

  const questionnaire = questionnaires.find((q) => q.id === surveyId);

  if (!questionnaire) {
    questionnaireContainer.innerHTML = "<p>Questionnaire not found.</p>";
    return;
  }

  const questionCount = questionnaire.questions.length;
  const completionCount =
    completions.find((c) => c.id === surveyId)?.count || 0;
  const questionnaireAnswers =
    answers.find((a) => a.id === surveyId)?.responses || [];

  statisticsContainer.innerHTML = `
    <h2>Statistics</h2>
    <p><strong>Questions:</strong> ${questionCount}</p>
    <p><strong>Completions:</strong> ${completionCount}</p>
    <h3>Previous Answers</h3>
    ${
      questionnaireAnswers.length > 0
        ? `<ul>${questionnaireAnswers
            .map(
              (response, index) =>
                `<li>Response ${index + 1}: ${JSON.stringify(response)}</li>`
            )
            .join("")}</ul>`
        : "<p>No answers yet.</p>"
    }
  `;

  questionnaireContainer.innerHTML = `
    <h2>${questionnaire.name}</h2>
    <p>${questionnaire.description}</p>
    <form id="questionnaireForm"></form>
  `;

  const form = document.getElementById("questionnaireForm");

  questionnaire.questions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";

    if (question.type === "text") {
      questionDiv.innerHTML = `
        <label>${index + 1}. ${question.question}</label>
        <input type="text" name="question-${index}" placeholder="Your answer" required />
      `;
    } else if (question.type === "single") {
      const optionsHtml = question.options
        .map(
          (option) => `
            <label class="radio-option">
              <input type="radio" name="question-${index}" value="${option}" required /> ${option}
            </label>`
        )
        .join("");
      questionDiv.innerHTML = `
        <p>${index + 1}. ${question.question}</p>
        <div class="options">${optionsHtml}</div>
      `;
    } else if (question.type === "multiple") {
      const optionsHtml = question.options
        .map(
          (option, optIndex) => `
            <label class="checkbox-option">
              <input type="checkbox" name="question-${index}-${optIndex}" value="${option}" /> ${option}
            </label>`
        )
        .join("");
      questionDiv.innerHTML = `
        <p>${index + 1}. ${question.question}</p>
        <div class="options">${optionsHtml}</div>
      `;
    }

    form.appendChild(questionDiv);
  });

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Submit";
  form.appendChild(submitButton);

  form.addEventListener("submit", handleSubmit);
}

function handleSubmit(event) {
  event.preventDefault();

  const userResponses = collectResponses();

  const completionIndex = completions.findIndex((c) => c.id === surveyId);
  if (completionIndex !== -1) {
    completions[completionIndex].count++;
  } else {
    completions.push({ id: surveyId, count: 1 });
  }
  localStorage.setItem("completions", JSON.stringify(completions));

  // Save user responses
  const answerIndex = answers.findIndex((a) => a.id === surveyId);
  if (answerIndex !== -1) {
    answers[answerIndex].responses.push(userResponses);
  } else {
    answers.push({ id: surveyId, responses: [userResponses] });
  }
  localStorage.setItem("answers", JSON.stringify(answers));

  alert("Thank you for completing the questionnaire!");
  window.location.href = "index.html";
}

function collectResponses() {
  const questionnaire = questionnaires.find((q) => q.id === surveyId);
  return questionnaire.questions.map((question, index) => {
    if (question.type === "text") {
      return document.querySelector(`[name="question-${index}"]`).value;
    } else if (question.type === "single") {
      const selectedOption = document.querySelector(
        `[name="question-${index}"]:checked`
      );
      return selectedOption ? selectedOption.value : null;
    } else if (question.type === "multiple") {
      const selectedOptions = document.querySelectorAll(
        `[name^="question-${index}-"]:checked`
      );
      return Array.from(selectedOptions).map((option) => option.value);
    }
  });
}

loadQuestionnaire();
