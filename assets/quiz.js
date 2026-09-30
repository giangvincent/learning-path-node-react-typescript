/* ==========================================================================
   KinLink course — quiz component (assets/quiz.js)

   Classic script (NOT a module) so lessons work when opened from file://.

   Usage in a lesson:

     <div class="quiz" data-quiz>
       <script type="application/json">
         [
           {
             "q": "Question stem?",
             "options": ["One", "Two", "Three", "Four"],
             "answer": 0,
             "why": "Why the answer is right, and why the others are not."
           }
         ]
       </script>
     </div>

   Options are shuffled at render time, so "answer" may be any index in the
   source. Write every option at the same length so length gives no clue.
   ========================================================================== */

(function () {
  "use strict";

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function shuffle(list) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function readQuestions(root) {
    var node = root.querySelector('script[type="application/json"]');
    if (!node) return [];
    try {
      var parsed = JSON.parse(node.textContent);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function buildCard(question, index) {
    var card = el("div", "q-card");
    card.appendChild(el("p", "q-stem", index + 1 + ". " + question.q));

    var correctText = question.options[question.answer];
    var list = el("div", "q-options");

    shuffle(question.options).forEach(function (text, i) {
      var label = el("label", "q-option");
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "quiz-q" + index;
      input.value = String(i);
      label.dataset.correct = text === correctText ? "true" : "false";
      label.appendChild(input);
      label.appendChild(el("span", "q-option-text", text));
      list.appendChild(label);
    });

    card.appendChild(list);

    var why = el("p", "q-why", question.why);
    why.hidden = true;
    card.appendChild(why);

    return card;
  }

  function markCard(card) {
    var chosen = card.querySelector("input:checked");
    var options = card.querySelectorAll(".q-option");
    for (var i = 0; i < options.length; i++) {
      options[i].classList.remove("correct", "incorrect");
    }
    if (chosen) {
      var label = chosen.closest(".q-option");
      var isRight = label.dataset.correct === "true";
      label.classList.add(isRight ? "correct" : "incorrect");
      if (!isRight) {
        for (var k = 0; k < options.length; k++) {
          if (options[k].dataset.correct === "true") {
            options[k].classList.add("correct");
          }
        }
      }
      card.querySelector(".q-why").hidden = false;
      return isRight;
    }
    card.querySelector(".q-why").hidden = false;
    return false;
  }

  function mount(root) {
    var questions = readQuestions(root);
    if (!questions.length) return;

    root.innerHTML = "";
    root.appendChild(el("p", "quiz-heading", "Retrieval practice"));

    var cards = questions.map(function (question, index) {
      var card = buildCard(question, index);
      root.appendChild(card);
      return card;
    });

    var actions = el("div", "quiz-actions");
    var check = el("button", null, "Check answers");
    check.type = "button";
    var reset = el("button", "secondary", "Try again");
    reset.type = "button";
    var score = el("span", "quiz-score", "");
    actions.appendChild(check);
    actions.appendChild(reset);
    actions.appendChild(score);
    root.appendChild(actions);

    check.addEventListener("click", function () {
      var right = 0;
      var answered = 0;
      cards.forEach(function (card) {
        if (card.querySelector("input:checked")) answered++;
        if (markCard(card)) right++;
      });
      if (answered < cards.length) {
        score.textContent =
          "Answer all " + cards.length + " first (" + answered + " done)";
        return;
      }
      score.textContent = right + " / " + cards.length + " correct";
    });

    reset.addEventListener("click", function () {
      root.innerHTML = "";
      mount(root);
    });
  }

  function autoMount() {
    var nodes = document.querySelectorAll("[data-quiz]");
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }

  window.KinQuiz = { mount: mount };
})();
