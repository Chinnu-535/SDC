const API_URL = "https://39pb66m1le.execute-api.us-east-1.amazonaws.com";  // Replace with your API Gateway Invoke URL

async function fetchQuestions() {
    try {
        const response = await fetch(`${API_URL}/get-quiz-questions`);
        const data = await response.json();  // Assuming API Gateway returns JSON directly

        let quizHTML = '';

        data.forEach((item, index) => {
            // Extracting values from DynamoDB format
            const questionId = item.id.S;
            const questionText = item.question.S;
            const options = item.options.L.map(option => option.S); // Extract options from list

            quizHTML += `<div class="question">
                            <p>${index + 1}. ${questionText}</p>
                            <input type="radio" name="q${questionId}" value="${options[0]}"> ${options[0]} <br>
                            <input type="radio" name="q${questionId}" value="${options[1]}"> ${options[1]} <br>
                            <input type="radio" name="q${questionId}" value="${options[2]}"> ${options[2]} <br>
                            <input type="radio" name="q${questionId}" value="${options[3]}"> ${options[3]} <br>
                        </div>`;
        });

        document.getElementById("quiz-container").innerHTML = quizHTML;
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

async function submitQuiz() {
    let userResponses = [];
    document.querySelectorAll('.question').forEach(q => {
        const questionId = q.querySelector("input[type=radio]").name.substring(1); // Extract numeric ID
        const selectedOption = q.querySelector(`input[name="q${questionId}"]:checked`);
        if (selectedOption) {
            userResponses.push({ questionId, answer: selectedOption.value });
        }
    });

    const userId = "user123";  // Replace with dynamic user ID
    const quizId = "aws_basics";

    const payload = { userId, quizId, responses: userResponses };
    console.log("Submitting Quiz Payload:", JSON.stringify(payload, null, 2)); // ✅ Debug log

    try {
        const response = await fetch(`${API_URL}/submit-quiz-response`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();
        console.log("Quiz Submission Response:", result); // ✅ Log API response

        if (result.statusCode === 200) {
            getQuizScore(userId, quizId);
        } else {
            document.getElementById("result").innerText = "Error submitting quiz.";
        }
    } catch (error) {
        console.error("Error submitting quiz:", error);
    }
}

async function getQuizScore(userId, quizId) {
    try {
        const response = await fetch(`${API_URL}/get-quiz-score?userId=${userId}&quizId=${quizId}`);
        const scoreData = await response.json();
        document.getElementById("result").innerText = `Your Score: ${scoreData.score} / ${scoreData.totalQuestions}`;
    } catch (error) {
        console.error("Error fetching quiz score:", error);
    }
}

fetchQuestions();

