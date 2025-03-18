let questionCount = 0;
const urlParams = new URLSearchParams(window.location.search);
const surveyId = parseInt(urlParams.get("id"), 10);
const questionnaires = JSON.parse(localStorage.getItem("questionnaires")) || [];

if (surveyId) {
  const survey = questionnaires.find((q) => q.id === surveyId);
  if (survey) {
    document.getElementById("surveyName").value = survey.name;
    document.getElementById("surveyDescription").value = survey.description;
    survey.questions.forEach((question, index) => addQuestion(question, index));
  }
}

function addQuestion(existingQuestion = null, index = questionCount) {
  const questionsDiv = document.getElementById("questions");
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.id = `questionDiv-${index}`;

  questionDiv.innerHTML = `
    <label for="question-${index}">Question ${index + 1}:</label>
    <input type="text" id="question-${index}" value="${
    existingQuestion ? existingQuestion.question : ""
  }" required /><br />
    
    <label>Type:</label>
    <select id="type-${index}">
      <option value="text" ${
        existingQuestion && existingQuestion.type === "text" ? "selected" : ""
      }>Text</option>
      <option value="single" ${
        existingQuestion && existingQuestion.type === "single" ? "selected" : ""
      }>Single Choice</option>
      <option value="multiple" ${
        existingQuestion && existingQuestion.type === "multiple"
          ? "selected"
          : ""
      }>Multiple Choices</option>
    </select><br />
    
    <div id="options-${index}"></div>
    
    <button type="button" onclick="addOption(${index})">Add Option</button>
    <button type="button" onclick="deleteQuestion(${index})" class="delete-button">Delete Question</button>
  `;

  questionsDiv.appendChild(questionDiv);
  questionCount++;

  if (
    existingQuestion &&
    (existingQuestion.type === "single" || existingQuestion.type === "multiple")
  ) {
    existingQuestion.options.forEach((option, optIndex) =>
      addOption(index, option, optIndex)
    );
  }
}

function addOption(questionIndex, existingOption = "") {
  const optionsDiv = document.getElementById(`options-${questionIndex}`);
  const optionInput = document.createElement("input");
  optionInput.type = "text";
  optionInput.value = existingOption;
  optionInput.placeholder = `Option ${optionsDiv.children.length + 1}`;
  optionsDiv.appendChild(optionInput);
}

function deleteQuestion(questionIndex) {
  const questionDiv = document.getElementById(`questionDiv-${questionIndex}`);
  if (questionDiv) {
    questionDiv.remove();
    questionCount--;
  }
}

document.getElementById("surveyForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("surveyName").value;
  const description = document.getElementById("surveyDescription").value;
  const questions = [];

  const questionDivs = document.querySelectorAll(".question");
  questionDivs.forEach((div, index) => {
    const questionText = div.querySelector(`#question-${index}`).value;
    const questionType = div.querySelector(`#type-${index}`).value;
    const options = [];

    if (questionType === "single" || questionType === "multiple") {
      const optionInputs = div.querySelectorAll(`#options-${index} input`);
      optionInputs.forEach((input) => options.push(input.value));
    }

    questions.push({ question: questionText, type: questionType, options });
  });

  if (surveyId) {
    const index = questionnaires.findIndex((q) => q.id === surveyId);
    questionnaires[index] = { id: surveyId, name, description, questions };
  } else {
    const newId = Date.now();
    questionnaires.push({ id: newId, name, description, questions });
  }

  localStorage.setItem("questionnaires", JSON.stringify(questionnaires));
  alert(surveyId ? "Survey updated!" : "Survey created!");
  window.location.href = "index.html";
});
