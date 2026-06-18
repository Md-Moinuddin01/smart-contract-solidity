const examples = [
  {
    id: "simple-storage",
    title: "Simple Storage",
    file: "contracts/SimpleStorage.sol",
    category: "storage",
    difficulty: "Start",
    summary: "Stores one unsigned number, emits an event, and exposes a tiny read function.",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleStorage {
    uint256 private favoriteNumber;

    event FavoriteNumberChanged(uint256 indexed oldValue, uint256 indexed newValue);

    function setFavoriteNumber(uint256 newValue) external {
        uint256 oldValue = favoriteNumber;
        favoriteNumber = newValue;
        emit FavoriteNumberChanged(oldValue, newValue);
    }

    function getFavoriteNumber() external view returns (uint256) {
        return favoriteNumber;
    }
}`
  },
  {
    id: "counter",
    title: "Counter",
    file: "contracts/Counter.sol",
    category: "storage",
    difficulty: "Start",
    summary: "Shows state updates, custom errors, and bounded decrement logic.",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;

    error CounterIsZero();

    event CountChanged(uint256 indexed count);

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function decrement() external {
        if (count == 0) revert CounterIsZero();
        count -= 1;
        emit CountChanged(count);
    }
}`
  },
  {
    id: "todo-list",
    title: "Todo List",
    file: "contracts/TodoList.sol",
    category: "patterns",
    difficulty: "Core",
    summary: "Uses structs, arrays, mappings, and events for a small note-taking contract.",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TodoList {
    struct Todo {
        string text;
        bool completed;
        address owner;
    }

    Todo[] private todos;

    event TodoCreated(uint256 indexed id, address indexed owner, string text);
    event TodoToggled(uint256 indexed id, bool completed);

    modifier onlyOwner(uint256 id) {
        require(todos[id].owner == msg.sender, "Not the todo owner");
        _;
    }

    function create(string calldata text) external {
        todos.push(Todo({ text: text, completed: false, owner: msg.sender }));
        emit TodoCreated(todos.length - 1, msg.sender, text);
    }

    function toggle(uint256 id) external onlyOwner(id) {
        todos[id].completed = !todos[id].completed;
        emit TodoToggled(id, todos[id].completed);
    }

    function get(uint256 id) external view returns (Todo memory) {
        return todos[id];
    }
}`
  },
  {
    id: "owned-notes",
    title: "Owned Notes",
    file: "contracts/OwnedNotes.sol",
    category: "access",
    difficulty: "Core",
    summary: "Introduces an owner, a modifier, custom errors, and controlled note updates.",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract OwnedNotes {
    address public owner;
    string private note;

    error NotOwner(address caller);

    event NoteUpdated(address indexed editor, string newNote);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    constructor(string memory initialNote) {
        owner = msg.sender;
        note = initialNote;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    function updateNote(string calldata newNote) external onlyOwner {
        note = newNote;
        emit NoteUpdated(msg.sender, newNote);
    }

    function readNote() external view returns (string memory) {
        return note;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}`
  },
  {
    id: "ether-vault",
    title: "Ether Vault",
    file: "contracts/EtherVault.sol",
    category: "payments",
    difficulty: "Careful",
    summary: "Demonstrates deposits, withdrawals, checks-effects-interactions, and receive().",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EtherVault {
    mapping(address => uint256) public balances;

    error NothingToWithdraw();
    error TransferFailed();

    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        require(msg.value > 0, "Send ETH");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        balances[msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }
}`
  },
  {
    id: "allow-list",
    title: "Allow List",
    file: "contracts/AllowList.sol",
    category: "access",
    difficulty: "Core",
    summary: "A compact mapping pattern for permissions and feature gating.",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AllowList {
    address public admin;
    mapping(address => bool) public allowed;

    error NotAdmin();

    event AccessChanged(address indexed account, bool allowed);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    function setAllowed(address account, bool value) external onlyAdmin {
        allowed[account] = value;
        emit AccessChanged(account, value);
    }

    function canEnter(address account) external view returns (bool) {
        return allowed[account];
    }
}`
  }
];

const lessons = [
  {
    id: "contract-anatomy",
    title: "Contract Anatomy",
    level: "01",
    duration: "7 min",
    topic: "Basics",
    exampleId: "simple-storage",
    summary: "A Solidity file usually starts with a license, a pragma, and one or more contract definitions.",
    notes: [
      "The SPDX license line tells tooling and readers how the code is licensed.",
      "The pragma pins the compiler range. For beginners, use a recent fixed family such as ^0.8.24.",
      "A contract is like a small program with state variables and functions living at an address.",
      "Public and external functions can be called from outside the contract. Internal and private functions stay inside."
    ],
    checklist: ["Name the compiler version", "Find the state variable", "Identify the write function"]
  },
  {
    id: "state-events",
    title: "State and Events",
    level: "02",
    duration: "8 min",
    topic: "Storage",
    exampleId: "counter",
    summary: "State changes cost gas, so good contracts make those changes intentional and observable.",
    notes: [
      "State variables are stored on chain and survive after a transaction ends.",
      "Events are cheaper than storing extra data and help apps index what happened.",
      "Custom errors are usually cheaper than long revert strings and make failures clearer.",
      "Since Solidity 0.8, arithmetic overflow and underflow revert automatically."
    ],
    checklist: ["Spot every storage write", "Emit events after changes", "Use a clear revert reason"]
  },
  {
    id: "arrays-structs",
    title: "Structs, Arrays, and Mappings",
    level: "03",
    duration: "12 min",
    topic: "Data",
    exampleId: "todo-list",
    summary: "Most useful contracts combine structured records with lookup tables and events.",
    notes: [
      "Structs group related fields, which keeps function signatures and storage easier to read.",
      "Arrays are convenient for ordered lists, but reading large arrays can become expensive.",
      "Mappings are key-value storage. They are excellent for balances, permissions, and ownership.",
      "Modifiers can guard functions, but keep their logic short and obvious."
    ],
    checklist: ["Use structs for records", "Use mappings for lookup", "Avoid unbounded loops in writes"]
  },
  {
    id: "access-control",
    title: "Access Control",
    level: "04",
    duration: "10 min",
    topic: "Security",
    exampleId: "owned-notes",
    summary: "Access checks decide who may change sensitive state. Make the rule visible in the code.",
    notes: [
      "The deployer is often the first owner, but ownership should be transferable when the app needs it.",
      "Modifiers such as onlyOwner keep repeated authorization logic in one place.",
      "Never allow ownership to move to address(0), because that can lock admin actions forever.",
      "Emit an event when authority changes so off-chain tools can track it."
    ],
    checklist: ["Guard admin functions", "Reject zero address owner", "Emit authority-change events"]
  },
  {
    id: "ether-flow",
    title: "Receiving and Sending ETH",
    level: "05",
    duration: "14 min",
    topic: "Value",
    exampleId: "ether-vault",
    summary: "ETH movement needs extra care because external calls can trigger other code.",
    notes: [
      "A receive() function lets the contract accept plain ETH transfers.",
      "The checks-effects-interactions pattern means validate first, update storage second, call outside last.",
      "Use call for ETH transfers, then verify the boolean success result.",
      "Set a balance to zero before sending to reduce reentrancy risk."
    ],
    checklist: ["Check msg.value", "Update balances before transfer", "Handle failed transfers"]
  },
  {
    id: "permissions",
    title: "Mappings for Permissions",
    level: "06",
    duration: "9 min",
    topic: "Patterns",
    exampleId: "allow-list",
    summary: "Permission maps are a simple building block for gated features and allow lists.",
    notes: [
      "A mapping(address => bool) can answer access questions in constant time.",
      "Store the admin address publicly so readers know who can change the list.",
      "Use one function for changing access and emit an event every time the value changes.",
      "For bigger systems, graduate to role-based access control instead of a single admin."
    ],
    checklist: ["Protect the setter", "Emit access updates", "Keep read helpers simple"]
  }
];

const quiz = [
  {
    question: "What does a Solidity pragma usually control?",
    options: ["The compiler version range", "The wallet that deploys the contract", "The current ETH price"],
    answer: 0,
    explain: "The pragma tells the compiler which Solidity versions are allowed for the file."
  },
  {
    question: "Why emit an event after changing important state?",
    options: ["So apps and indexers can track what happened", "So the transaction becomes free", "So private variables become encrypted"],
    answer: 0,
    explain: "Events are useful for off-chain indexing and user interfaces that need a history of contract activity."
  },
  {
    question: "Which order matches checks-effects-interactions?",
    options: ["Validate, update storage, make external calls", "Make external calls, update storage, validate", "Update storage, validate, make external calls"],
    answer: 0,
    explain: "This order reduces risk when a contract sends ETH or calls another contract."
  },
  {
    question: "What is a mapping best suited for?",
    options: ["Fast key-value lookup", "Rendering a website", "Compressing source code"],
    answer: 0,
    explain: "Mappings are a core Solidity key-value structure, often used for balances, ownership, and permissions."
  }
];

const glossary = [
  ["ABI", "The interface format that apps use to call contract functions and decode results."],
  ["Address", "A 20-byte identifier for an account or contract on an EVM chain."],
  ["Calldata", "Read-only function input data. It is commonly used for external function parameters."],
  ["Event", "A log entry emitted by a contract so off-chain apps can track activity."],
  ["Gas", "The execution fee paid for computation, storage writes, and transaction work."],
  ["Modifier", "A reusable wrapper for function checks, often used for access control."],
  ["msg.sender", "The address that directly called the current function."],
  ["Reentrancy", "A bug class where an external call re-enters before state is safely finalized."],
  ["Storage", "Persistent contract data kept on chain."],
  ["View", "A function marker for code that reads state without changing it."]
];

const state = {
  activeLesson: 0,
  activeFilter: "all",
  query: "",
  completed: new Set(JSON.parse(localStorage.getItem("scnr-progress") || "[]")),
  quizIndex: 0,
  score: 0,
  answered: false,
  motion: localStorage.getItem("scnr-motion") !== "off"
};

const $ = (selector) => document.querySelector(selector);

const lessonList = $("#lessonList");
const lessonKicker = $("#lessonKicker");
const lessonTitle = $("#lessonTitle");
const lessonSummary = $("#lessonSummary");
const lessonBody = $("#lessonBody");
const lessonChecklist = $("#lessonChecklist");
const exampleFile = $("#exampleFile");
const exampleTitle = $("#exampleTitle");
const exampleCode = $("#exampleCode");
const exampleGrid = $("#exampleGrid");
const toast = $("#toast");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return value.toLowerCase().trim();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 1900);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast(`${label} copied`);
}

function saveProgress() {
  localStorage.setItem("scnr-progress", JSON.stringify([...state.completed]));
}

function updateMetrics() {
  $("#lessonCount").textContent = lessons.length;
  $("#exampleCount").textContent = examples.length;
  const progress = Math.round((state.completed.size / lessons.length) * 100);
  $("#progressCount").textContent = `${progress}%`;
}

function filteredLessons() {
  const query = normalize(state.query);
  if (!query) return lessons;
  return lessons.filter((lesson) => {
    const example = examples.find((item) => item.id === lesson.exampleId);
    return [lesson.title, lesson.summary, lesson.topic, ...lesson.notes, example?.title, example?.code]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

function renderLessonList() {
  const list = filteredLessons();
  lessonList.innerHTML = list
    .map((lesson) => {
      const originalIndex = lessons.findIndex((item) => item.id === lesson.id);
      const done = state.completed.has(lesson.id);
      return `
        <button class="lesson-tab ${originalIndex === state.activeLesson ? "active" : ""} ${done ? "done" : ""}" type="button" data-lesson="${originalIndex}">
          <span class="lesson-index">${lesson.level}</span>
          <span>
            <span class="lesson-name">${escapeHtml(lesson.title)}</span>
            <span class="lesson-meta">${escapeHtml(lesson.topic)} / ${lesson.duration}</span>
          </span>
          <span class="lesson-status" aria-hidden="true"></span>
        </button>
      `;
    })
    .join("");

  if (!list.length) {
    lessonList.innerHTML = `<p class="empty-state">No lessons match this search.</p>`;
  }
}

function renderActiveLesson() {
  const lesson = lessons[state.activeLesson];
  const example = examples.find((item) => item.id === lesson.exampleId);
  const isDone = state.completed.has(lesson.id);

  lessonKicker.textContent = `${lesson.level} / ${lesson.topic} / ${lesson.duration}`;
  lessonTitle.textContent = lesson.title;
  lessonSummary.textContent = lesson.summary;
  lessonBody.innerHTML = lesson.notes.map((note) => `<div class="note-row">${escapeHtml(note)}</div>`).join("");
  lessonChecklist.innerHTML = lesson.checklist
    .map((item) => `<div class="check-item"><span aria-hidden="true">OK</span>${escapeHtml(item)}</div>`)
    .join("");
  exampleFile.textContent = example.file;
  exampleTitle.textContent = example.title;
  exampleCode.textContent = example.code;
  $("#completeLesson").innerHTML = `<span aria-hidden="true">${isDone ? "OK" : "+"}</span>${isDone ? "Completed" : "Mark Complete"}`;
  updateMetrics();
}

function renderExamples() {
  const query = normalize(state.query);
  const items = examples.filter((example) => {
    const matchesFilter = state.activeFilter === "all" || example.category === state.activeFilter;
    const matchesQuery = !query || [example.title, example.summary, example.category, example.file, example.code].join(" ").toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  exampleGrid.innerHTML = items
    .map(
      (example) => `
      <article class="example-card">
        <div class="card-topline">
          <span class="pill">${escapeHtml(example.difficulty)}</span>
          <span class="pill">${escapeHtml(example.category)}</span>
        </div>
        <h3>${escapeHtml(example.title)}</h3>
        <p>${escapeHtml(example.summary)}</p>
        <div class="mini-code"><pre><code>${escapeHtml(example.code.split("\\n").slice(0, 9).join("\\n"))}</code></pre></div>
        <div class="card-actions">
          <button class="secondary-action open-example" type="button" data-example="${example.id}">Open</button>
          <button class="copy-button copy-example" type="button" data-example="${example.id}" data-tip="Copy code">Copy</button>
        </div>
      </article>
    `
    )
    .join("");

  if (!items.length) {
    exampleGrid.innerHTML = `<p class="empty-state">No contract examples match this view.</p>`;
  }
}

function renderQuiz() {
  const item = quiz[state.quizIndex];
  $("#quizStep").textContent = `Question ${state.quizIndex + 1} of ${quiz.length}`;
  $("#quizScore").textContent = `Score ${state.score}`;
  $("#quizQuestion").textContent = item.question;
  $("#quizFeedback").textContent = "";
  state.answered = false;
  $("#quizOptions").innerHTML = item.options
    .map((option, index) => `<button class="quiz-option" type="button" data-option="${index}">${escapeHtml(option)}</button>`)
    .join("");
}

function chooseQuizOption(index) {
  if (state.answered) return;
  const item = quiz[state.quizIndex];
  state.answered = true;
  const buttons = [...document.querySelectorAll(".quiz-option")];
  buttons.forEach((button, buttonIndex) => {
    if (buttonIndex === item.answer) button.classList.add("correct");
    if (buttonIndex === index && index !== item.answer) button.classList.add("wrong");
  });
  if (index === item.answer) state.score += 1;
  $("#quizScore").textContent = `Score ${state.score}`;
  $("#quizFeedback").textContent = item.explain;
}

function renderGlossary() {
  const query = normalize($("#glossarySearch").value || "");
  const rows = glossary.filter(([term, meaning]) => `${term} ${meaning}`.toLowerCase().includes(query));
  $("#glossaryList").innerHTML = rows.map(([term, meaning]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(meaning)}</dd></div>`).join("");
}

function showLesson(index) {
  state.activeLesson = Math.max(0, Math.min(index, lessons.length - 1));
  renderLessonList();
  renderActiveLesson();
}

function bindEvents() {
  $("#searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderLessonList();
    renderExamples();
  });

  lessonList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lesson]");
    if (!button) return;
    showLesson(Number(button.dataset.lesson));
    $("#lessonPanel").focus({ preventScroll: true });
  });

  $("#completeLesson").addEventListener("click", () => {
    const lesson = lessons[state.activeLesson];
    if (state.completed.has(lesson.id)) {
      state.completed.delete(lesson.id);
      showToast("Lesson marked open");
    } else {
      state.completed.add(lesson.id);
      showToast("Lesson completed");
    }
    saveProgress();
    renderLessonList();
    renderActiveLesson();
  });

  $("#prevLesson").addEventListener("click", () => showLesson(state.activeLesson - 1));
  $("#nextLesson").addEventListener("click", () => showLesson(state.activeLesson + 1));

  $("#resetProgress").addEventListener("click", () => {
    state.completed.clear();
    saveProgress();
    renderLessonList();
    renderActiveLesson();
    showToast("Progress reset");
  });

  $("#copyCurrent").addEventListener("click", () => {
    const lesson = lessons[state.activeLesson];
    const example = examples.find((item) => item.id === lesson.exampleId);
    copyText(example.code, example.file);
  });

  document.querySelector(".filter-strip").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderExamples();
  });

  exampleGrid.addEventListener("click", (event) => {
    const copyButton = event.target.closest(".copy-example");
    const openButton = event.target.closest(".open-example");
    const target = copyButton || openButton;
    if (!target) return;

    const example = examples.find((item) => item.id === target.dataset.example);
    if (copyButton) {
      copyText(example.code, example.file);
      return;
    }

    const lessonIndex = lessons.findIndex((lesson) => lesson.exampleId === example.id);
    if (lessonIndex >= 0) {
      showLesson(lessonIndex);
      document.querySelector("#notes").scrollIntoView({ behavior: state.motion ? "smooth" : "auto" });
    }
  });

  $("#quizOptions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-option]");
    if (!button) return;
    chooseQuizOption(Number(button.dataset.option));
  });

  $("#nextQuestion").addEventListener("click", () => {
    state.quizIndex = (state.quizIndex + 1) % quiz.length;
    renderQuiz();
  });

  $("#restartQuiz").addEventListener("click", () => {
    state.quizIndex = 0;
    state.score = 0;
    renderQuiz();
  });

  $("#glossarySearch").addEventListener("input", renderGlossary);

  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("scnr-theme", document.body.classList.contains("light") ? "light" : "dark");
  });

  $("#motionToggle").addEventListener("click", () => {
    state.motion = !state.motion;
    document.body.classList.toggle("no-motion", !state.motion);
    localStorage.setItem("scnr-motion", state.motion ? "on" : "off");
    $("#motionToggle").setAttribute("data-tip", state.motion ? "Pause motion" : "Resume motion");
    showToast(state.motion ? "Motion resumed" : "Motion paused");
  });
}

function revealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((item) => observer.observe(item));
}

function initTheme() {
  if (localStorage.getItem("scnr-theme") === "light") {
    document.body.classList.add("light");
  }
  document.body.classList.toggle("no-motion", !state.motion);
}

function initCanvas() {
  const canvas = $("#chain-canvas");
  const ctx = canvas.getContext("2d");
  const dots = Array.from({ length: 64 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00045,
    vy: (Math.random() - 0.5) * 0.00045,
    size: index % 8 === 0 ? 2.2 : 1.3
  }));

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function step() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    dots.forEach((dot) => {
      if (state.motion) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > 1) dot.vx *= -1;
        if (dot.y < 0 || dot.y > 1) dot.vy *= -1;
      }
    });

    for (let i = 0; i < dots.length; i += 1) {
      const a = dots[i];
      const ax = a.x * width;
      const ay = a.y * height;
      for (let j = i + 1; j < dots.length; j += 1) {
        const b = dots[j];
        const bx = b.x * width;
        const by = b.y * height;
        const distance = Math.hypot(ax - bx, ay - by);
        if (distance < 150) {
          ctx.globalAlpha = (150 - distance) / 520;
          ctx.strokeStyle = "#3de8d5";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.68;
      ctx.fillStyle = i % 5 === 0 ? "#f5bd4f" : "#3de8d5";
      ctx.beginPath();
      ctx.arc(ax, ay, a.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize);
  resize();
  step();
}

function init() {
  initTheme();
  updateMetrics();
  renderLessonList();
  renderActiveLesson();
  renderExamples();
  renderQuiz();
  renderGlossary();
  bindEvents();
  revealOnScroll();
  initCanvas();
}

init();
