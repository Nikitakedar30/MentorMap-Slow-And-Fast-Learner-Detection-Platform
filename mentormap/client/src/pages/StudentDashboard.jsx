import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StudentProgress from './StudentProgress';

const API = 'http://localhost:5000/api';
const getApi = () => axios.create({ baseURL: API, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

const YEAR_LABELS = { FE:'First Year', SE:'Second Year', TE:'Third Year', BE:'Final Year' };
const YEAR_COLORS = { FE:'#2d4fea', SE:'#0ea86e', TE:'#f5620a', BE:'#6930c3' };
const YEAR_SUBJECTS = {
  FE: [
    'Engineering Mathematics-I',
    'Engineering Physics / Engineering Chemistry',
    'Basic Electronics Engineering / Basic Electrical Engineering',
    'Engineering Graphics / Engineering Mechanics',
    'Fundamentals of Programming Languages',
    'Manufacturing Practice / Workshop / Design Thinking and Idea Lab',
    'Professional Communication Skills',
    'Co-Curricular Course-I',
    'Engineering Mathematics-II',
    'Engineering Chemistry / Engineering Physics',
    'Basic Electrical Engineering / Basic Electronics Engineering',
    'Engineering Mechanics / Engineering Graphics',
    'Programming and Problem Solving',
    'Design Thinking Lab / Manufacturing Practice Workshop',
    'Indian Knowledge System',
    'Co-Curricular Course-II',
  ],
  SE: [
    'Data Structures & Algorithms',
    'Object Oriented Programming',
    'Basics of Computer Network',
    'Data Structures & Algorithms Lab',
    'Object Oriented Programming Lab',
    'Digital Electronics and Logic Design',
    'Principles of Management & Entrepreneurship',
    'Universal Human Values',
    'Community Engagement Project',
    'Database Management System',
    'Computer Graphics',
    'Probability & Statistics',
    'Database Management System Lab',
    'Computer Graphics Lab',
    'Processor Architecture',
    'Digital Marketing and Social Media',
    'Modern Indian Language (Marathi/Hindi)',
    'E-Commerce',
    'Environmental Studies',
  ],
  TE: [
    'Theory of Computation',
    'Operating Systems',
    'Machine Learning',
    'Human Computer Interaction',
    'Elective-I (Design and Analysis of Algorithm / Advanced Database and Management System / Design Thinking / Internet of Things)',
    'Operating Systems Lab',
    'Human Computer Interaction Lab',
    'Laboratory Practice-I',
    'Seminar',
    'Computer Networks & Security',
    'Data Science and Big Data Analytics',
    'Web Application Development',
    'Elective-II (Artificial Intelligence / Cyber Security / Cloud Computing / Software Modeling and Design)',
    'Computer Networks & Security Lab',
    'DS & BDA Lab',
    'Laboratory Practice-II',
  ],
  BE: [
    'Information and Storage Retrieval',
    'Software Project Management',
    'Deep Learning',
    'Elective-III (Mobile Computing / High Performance Computing / Multimedia Technology / Smart Computing)',
    'Elective-IV (Bioinformatics / Introduction to DevOps / Computer Vision / Wireless Communications)',
    'Lab Practice-III',
    'Lab Practice-IV',
    'Project Stage-I',
    'Distributed Systems',
    'Elective-V (Software Defined Networks / Social Computing / Natural Language Processing / Soft Computing / Game Engineering)',
    'Elective-VI (Ethical Hacking and Security / Augmented and Virtual Reality / Business Analytics and Intelligence / Blockchain Technology)',
    'Startup and Entrepreneurship',
    'Lab Practice-V',
    'Lab Practice-VI',
    'Project Stage-II',
  ],
};

const NAV = [
  { id:'dashboard', icon:'⬛', label:'Dashboard'     },
  { id:'materials', icon:'📚', label:'Study Materials'},
  { id:'quizzes',   icon:'✏️', label:'Quizzes'        },
  { id:'progress',  icon:'📊', label:'My Progress'   },
  { id:'timeline',  icon:'📈', label:'My Timeline'   },
  { id:'aiteacher', icon:'🤖', label:'AI Teacher'    },
];

// ── Donut Chart ───────────────────────────────────────────────
function DonutChart({ pct, color, size, sw }) {
  const sz=size||80, stroke=sw||9, r=(sz-stroke)/2, circ=2*Math.PI*r;
  const dash=(Math.min(100,pct||0)/100)*circ;
  return (
    <div style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
      <svg width={sz} height={sz} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color+'20'} strokeWidth={stroke}/>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={dash+' '+circ} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1s ease', filter:'drop-shadow(0 2px 4px '+color+'44)' }}/>
      </svg>
      <div style={{ position:'absolute', textAlign:'center' }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:sz*0.17, fontWeight:800, color, lineHeight:1 }}>{Math.round(pct||0)}%</div>
      </div>
    </div>
  );
}

// ── Mini Bar Chart ────────────────────────────────────────────
function MiniBar({ data, color, height }) {
  const h=height||50; const max=Math.max(...data.map(d=>d.v),1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:h }}>
      {data.map((d,i)=>(
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end' }}>
          <div style={{ width:'100%', background:color, borderRadius:'3px 3px 0 0', height:Math.max(3,(d.v/max)*(h-14))+'px', transition:'height 0.8s ease', opacity:0.6+(i/data.length)*0.4 }}/>
          <div style={{ fontSize:9, color:'var(--hint)', lineHeight:1 }}>{d.l}</div>
        </div>
      ))}
    </div>
  );
}

// ── AI Teacher Component ──────────────────────────────────────
function AITeacher({ userYear }) {
  const [messages, setMessages] = useState([{
    role:'assistant',
    text:`Hello! 👋 I am your AI Teacher for **${YEAR_LABELS[userYear]||'Engineering'}**.\n\nI can explain any topic from your subjects in **simple language**:\n\n${(YEAR_SUBJECTS[userYear]||[]).slice(0,6).map(s=>'📘 '+s).join('\n')}\n${(YEAR_SUBJECTS[userYear]||[]).length>6?'...and more\n':''}\nJust ask me anything — I will explain it clearly!`
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollIntoView({behavior:'smooth'}); },[messages]);

  const KNOWLEDGE = {
    // Mathematics
    'matrices': `**Matrices — Simple Explanation**\n\nA matrix is just a table of numbers arranged in rows and columns.\n\n**Example:**\n| 1 2 |\n| 3 4 |\n\nThis is a 2×2 matrix (2 rows, 2 columns).\n\n**Key Operations:**\n1. **Addition** — Add corresponding elements\n2. **Multiplication** — Row × Column method\n3. **Determinant** — For 2×2: (ad - bc)\n4. **Inverse** — A matrix divided by its determinant\n\n**Why important?** Used in solving systems of equations, computer graphics, and machine learning.`,
    'differentiation': `**Differentiation — Made Simple**\n\nDifferentiation finds the **rate of change** — how fast something is changing.\n\n**Think of it this way:** If you are driving, differentiation tells you your speed at any moment.\n\n**Basic Rules:**\n1. d/dx(xⁿ) = nxⁿ⁻¹ (Power rule)\n2. d/dx(constant) = 0\n3. d/dx(sin x) = cos x\n4. d/dx(eˣ) = eˣ\n\n**Example:** d/dx(x³) = 3x²\n\n**Real use:** Finding maximum and minimum values, optimization problems.`,
    'integration': `**Integration — Simple Explanation**\n\nIntegration is the **reverse of differentiation**. It finds the area under a curve.\n\n**Think of it this way:** If differentiation is speed, integration gives you total distance traveled.\n\n**Basic Rules:**\n1. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C\n2. ∫sin x dx = -cos x + C\n3. ∫eˣ dx = eˣ + C\n4. ∫1/x dx = ln|x| + C\n\n**Example:** ∫3x² dx = x³ + C\n\n**C is the constant of integration** — always add it for indefinite integrals.`,

    // Data Structures
    'linked list': `**Linked List — Simple Explanation**\n\nA linked list is a chain of nodes where each node contains:\n1. **Data** — the actual value\n2. **Pointer** — address of the next node\n\n**Visual:** [10|→] → [20|→] → [30|NULL]\n\n**Types:**\n- **Singly Linked List** — one direction only\n- **Doubly Linked List** — forward and backward pointers\n- **Circular Linked List** — last node points back to first\n\n**Operations:**\n- Insert: O(1) at beginning, O(n) at end\n- Delete: O(1) if node pointer known\n- Search: O(n)\n\n**vs Array:** Arrays have fixed size and fast access. Linked lists have dynamic size but slower access.`,
    'stack': `**Stack — Simple Explanation**\n\nA stack follows **LIFO — Last In, First Out** principle.\n\nThink of a **stack of plates**: you can only add or remove from the top!\n\n**Operations:**\n1. **Push** — Add element on top — O(1)\n2. **Pop** — Remove top element — O(1)\n3. **Peek/Top** — See top element without removing — O(1)\n4. **isEmpty** — Check if stack is empty\n\n**Real-world uses:**\n- Browser back button history\n- Undo feature in editors\n- Function call management\n- Expression evaluation\n\n**Implementation:** Can use Array or Linked List`,
    'queue': `**Queue — Simple Explanation**\n\nA queue follows **FIFO — First In, First Out** principle.\n\nThink of a **ticket counter queue**: first person in line gets served first!\n\n**Operations:**\n1. **Enqueue** — Add at rear — O(1)\n2. **Dequeue** — Remove from front — O(1)\n3. **Front** — See front element\n4. **Rear** — See last element\n\n**Types:**\n- Simple Queue\n- Circular Queue\n- Priority Queue\n- Deque (Double-ended)\n\n**Real uses:** CPU scheduling, print spooler, BFS in graphs`,
    'sorting': `**Sorting Algorithms — Complete Guide**\n\n**1. Bubble Sort** — Compare adjacent, swap if wrong order\n- Time: O(n²), Space: O(1)\n- Good for: small, nearly-sorted data\n\n**2. Selection Sort** — Find minimum, put in correct position\n- Time: O(n²), Space: O(1)\n\n**3. Insertion Sort** — Insert each element in correct position\n- Time: O(n²) worst, O(n) best\n- Good for: small or nearly sorted data\n\n**4. Merge Sort** — Divide and conquer, merge sorted halves\n- Time: O(n log n), Space: O(n)\n- Stable sort\n\n**5. Quick Sort** — Pick pivot, partition around it\n- Time: O(n log n) average, O(n²) worst\n- Most practical in real use\n\n**6. Heap Sort** — Use heap data structure\n- Time: O(n log n), Space: O(1)`,

    // OOP Java
    'inheritance': `**Inheritance in Java — Simple Explanation**\n\nInheritance means a **child class gets properties and methods of parent class**.\n\nThink of it like: A Dog IS an Animal. Dog inherits all Animal properties.\n\n\`\`\`java\nclass Animal {\n    String name;\n    void eat() { System.out.println("Eating"); }\n}\n\nclass Dog extends Animal {\n    void bark() { System.out.println("Woof!"); }\n}\n\nDog d = new Dog();\nd.eat();  // Inherited from Animal\nd.bark(); // Dog's own method\n\`\`\`\n\n**Types of Inheritance in Java:**\n1. Single — one parent, one child\n2. Multilevel — A→B→C\n3. Hierarchical — one parent, many children\n\n**Note:** Java does NOT support multiple inheritance with classes (uses interfaces instead).`,
    'polymorphism': `**Polymorphism — Simple Explanation**\n\nPolymorphism means **one name, many forms**.\n\nThink of it like: A person IS a student at college, IS a child at home, IS a customer at a shop — same person, different roles!\n\n**Two Types:**\n\n**1. Compile-time (Method Overloading)**\n\`\`\`java\nclass Calculator {\n    int add(int a, int b) { return a+b; }\n    double add(double a, double b) { return a+b; }\n    // Same name, different parameters\n}\n\`\`\`\n\n**2. Runtime (Method Overriding)**\n\`\`\`java\nclass Animal {\n    void sound() { System.out.println("Some sound"); }\n}\nclass Dog extends Animal {\n    void sound() { System.out.println("Woof"); } // Overrides parent\n}\n\`\`\``,
    'encapsulation': `**Encapsulation — Simple Explanation**\n\nEncapsulation means **hiding data inside a class** and providing controlled access through methods.\n\nThink of it like a **capsule medicine** — the ingredients are hidden inside, you just take the capsule!\n\n\`\`\`java\nclass BankAccount {\n    private double balance; // Hidden!\n    \n    // Controlled access\n    public double getBalance() {\n        return balance;\n    }\n    \n    public void deposit(double amount) {\n        if (amount > 0) balance += amount;\n    }\n}\n\`\`\`\n\n**Benefits:**\n- Data security and hiding\n- Control over data modification\n- Easy to change internal implementation\n- Better code organization`,

    // DBMS
    'normalization': `**Normalization — Simple Explanation**\n\nNormalization is the process of **organizing database tables to reduce data redundancy** (duplication) and improve data integrity.\n\n**Normal Forms:**\n\n**1NF (First Normal Form)**\n- Each column has atomic (single) values\n- No repeating groups\n- Has a primary key\n\n**2NF (Second Normal Form)**\n- Must be in 1NF\n- No partial dependency (non-key attribute depends on FULL primary key)\n\n**3NF (Third Normal Form)**\n- Must be in 2NF\n- No transitive dependency (non-key attribute depends on another non-key attribute)\n\n**BCNF (Boyce-Codd Normal Form)**\n- Stricter version of 3NF\n\n**Why normalize?** Reduces storage, prevents update anomalies, maintains consistency.`,
    'sql': `**SQL — Complete Beginner Guide**\n\nSQL (Structured Query Language) is used to communicate with databases.\n\n**Basic Commands:**\n\n**1. SELECT — Retrieve data**\n\`\`\`sql\nSELECT * FROM students;\nSELECT name, marks FROM students WHERE marks > 60;\n\`\`\`\n\n**2. INSERT — Add data**\n\`\`\`sql\nINSERT INTO students (name, marks) VALUES ('Rahul', 85);\n\`\`\`\n\n**3. UPDATE — Modify data**\n\`\`\`sql\nUPDATE students SET marks = 90 WHERE name = 'Rahul';\n\`\`\`\n\n**4. DELETE — Remove data**\n\`\`\`sql\nDELETE FROM students WHERE marks < 35;\n\`\`\`\n\n**5. JOIN — Combine tables**\n\`\`\`sql\nSELECT s.name, c.course\nFROM students s\nJOIN courses c ON s.id = c.student_id;\n\`\`\``,

    // Networks
    'osi model': `**OSI Model — 7 Layers Explained Simply**\n\nThe OSI model explains how data travels from one computer to another through a network.\n\n**Mnemonic: "Please Do Not Throw Sausage Pizza Away"**\n\n7. **Application** — User interfaces (HTTP, FTP, Email)\n6. **Presentation** — Data formatting, encryption (SSL)\n5. **Session** — Manages sessions between applications\n4. **Transport** — Reliable delivery (TCP, UDP)\n3. **Network** — Routing and IP addressing (IP, ICMP)\n2. **Data Link** — Frame transmission (MAC address, Ethernet)\n1. **Physical** — Actual cables, signals (Ethernet cable, WiFi)\n\n**Data Flow:**\nSender: Application→Physical (encapsulation)\nReceiver: Physical→Application (decapsulation)\n\n**TCP vs UDP:**\n- TCP: Reliable, ordered, slower (web pages)\n- UDP: Fast, no guarantee (video streaming)`,

    // Operating Systems
    'process scheduling': `**Process Scheduling — Simple Explanation**\n\nThe OS decides which process gets CPU time and when.\n\n**Types of Schedulers:**\n1. **Long-term** — Decides which programs enter the ready queue\n2. **Short-term (CPU Scheduler)** — Decides which process runs next\n3. **Medium-term** — Handles swapping\n\n**Scheduling Algorithms:**\n\n**1. FCFS (First Come First Serve)**\n- Simple, non-preemptive\n- Can cause convoy effect\n\n**2. SJF (Shortest Job First)**\n- Minimum average waiting time\n- Requires knowing burst time in advance\n\n**3. Round Robin**\n- Each process gets a time quantum\n- Good for time-sharing systems\n- Most used in practice\n\n**4. Priority Scheduling**\n- Higher priority executes first\n- Can cause starvation\n\n**Key Terms:** Burst Time, Waiting Time, Turnaround Time, Response Time`,
    'deadlock': `**Deadlock — Simple Explanation**\n\nDeadlock occurs when two or more processes are **waiting for each other to release resources** — like a circular standoff!\n\n**Real-life Example:**\nPerson A holds a knife, wants a fork.\nPerson B holds a fork, wants a knife.\nBoth wait forever — DEADLOCK!\n\n**Four Conditions (ALL must be true):**\n1. **Mutual Exclusion** — Resource held by one process at a time\n2. **Hold and Wait** — Process holds resource while waiting for another\n3. **No Preemption** — Resources cannot be forcibly taken\n4. **Circular Wait** — P1→P2→P3→P1 circular dependency\n\n**Handling Deadlocks:**\n- **Prevention** — Remove one of the 4 conditions\n- **Avoidance** — Banker's Algorithm\n- **Detection & Recovery** — Find and break deadlocks\n- **Ignorance** — Ostrich algorithm (used in some OS!)`,

    // Machine Learning
    'supervised learning': `**Supervised Learning — Simple Explanation**\n\nSupervised learning is training a model using **labeled data** — examples where we know the correct answer.\n\n**Analogy:** A teacher showing solved problems → student learns → solves new problems.\n\n**Two Types:**\n\n**1. Classification** — Predict a category\n- Examples: Spam/Not Spam, Disease detection\n- Algorithms: Logistic Regression, Decision Tree, SVM, KNN\n\n**2. Regression** — Predict a number\n- Examples: House price, Stock prediction\n- Algorithms: Linear Regression, Polynomial Regression\n\n**Training Process:**\n1. Collect labeled data\n2. Split: 80% train, 20% test\n3. Train model on training data\n4. Evaluate on test data\n5. Tune hyperparameters\n6. Deploy\n\n**Evaluation Metrics:** Accuracy, Precision, Recall, F1-Score, MSE, RMSE`,
    'neural network': `**Neural Networks — Simple Explanation**\n\nNeural networks are inspired by the **human brain** — connected neurons that learn from examples.\n\n**Structure:**\n\n🟦 Input Layer → 🟩 Hidden Layers → 🟥 Output Layer\n\nEach connection has a **weight** that gets adjusted during training.\n\n**How it learns:**\n1. Forward pass — data flows through network\n2. Calculate error (loss)\n3. Backpropagation — adjust weights to reduce error\n4. Repeat thousands of times\n\n**Activation Functions:**\n- **ReLU** — max(0,x) — most common in hidden layers\n- **Sigmoid** — output between 0-1, for binary classification\n- **Softmax** — output probabilities, for multi-class\n\n**Types:**\n- CNN — Convolutional Neural Network (images)\n- RNN — Recurrent Neural Network (sequences, text)\n- Transformer — Attention mechanism (GPT, BERT)\n\n**Libraries:** TensorFlow, PyTorch, Keras`,

    // Web Technology
    'html': `**HTML — Simple Explanation**\n\nHTML (HyperText Markup Language) is the **skeleton of every webpage**.\n\n**Basic Structure:**\n\`\`\`html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello World!</h1>\n    <p>This is a paragraph.</p>\n    <a href="https://google.com">Click here</a>\n    <img src="photo.jpg" alt="My photo">\n  </body>\n</html>\n\`\`\`\n\n**Common Tags:**\n- h1 to h6 — Headings\n- p — Paragraph\n- div — Container block\n- span — Inline container\n- ul/ol/li — Lists\n- table/tr/td — Tables\n- form/input/button — Forms\n- a — Links\n- img — Images`,
    'css': `**CSS — Simple Explanation**\n\nCSS (Cascading Style Sheets) makes HTML look **beautiful** — adding colors, fonts, layouts!\n\n**Three Ways to Apply CSS:**\n1. **Inline** — inside the HTML tag\n2. **Internal** — inside style tag in head\n3. **External** — separate .css file (recommended)\n\n**Selectors:**\n\`\`\`css\n/* Element selector */\np { color: blue; }\n\n/* Class selector */\n.card { background: white; }\n\n/* ID selector */\n#header { font-size: 24px; }\n\n/* Flexbox layout */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n}\n\n/* Grid layout */\n.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n}\n\`\`\`\n\n**Box Model:** Margin → Border → Padding → Content`,
    'javascript': `**JavaScript — Simple Explanation**\n\nJavaScript makes webpages **interactive and dynamic**!\n\n**Variables:**\n\`\`\`javascript\nlet name = "Rahul";     // Can change\nconst age = 20;          // Cannot change\nvar old = "avoid this"; // Old way\n\`\`\`\n\n**Functions:**\n\`\`\`javascript\nfunction greet(name) {\n    return "Hello " + name;\n}\n// Arrow function\nconst add = (a, b) => a + b;\n\`\`\`\n\n**DOM Manipulation:**\n\`\`\`javascript\n// Get element\nconst btn = document.getElementById('myBtn');\n\n// Change content\nbtn.innerHTML = 'Clicked!';\n\n// Add event\nbtn.addEventListener('click', () => {\n    alert('Button clicked!');\n});\n\`\`\`\n\n**Array Methods:**\n\`\`\`javascript\nconst nums = [1,2,3,4,5];\nnums.map(x => x*2);    // [2,4,6,8,10]\nnums.filter(x => x>2); // [3,4,5]\nnums.reduce((a,b) => a+b, 0); // 15\n\`\`\``,

    // Cloud / Security
    'cloud computing': `**Cloud Computing — Simple Explanation**\n\nCloud computing means using **servers, storage, and services over the internet** instead of local hardware.\n\n**Think of it like:** Electricity from the grid — you don't own the power plant, you just use electricity when needed!\n\n**Three Service Models:**\n\n**1. IaaS (Infrastructure as a Service)**\n- Rent virtual machines, storage, networking\n- Examples: AWS EC2, Azure VMs, Google Compute Engine\n- You manage: OS, applications, data\n\n**2. PaaS (Platform as a Service)**\n- Rent a platform to build and deploy apps\n- Examples: Heroku, Google App Engine\n- You manage: only your application and data\n\n**3. SaaS (Software as a Service)**\n- Use software over the internet\n- Examples: Gmail, Office 365, Zoom\n- You manage: nothing!\n\n**Deployment Models:**\n- Public Cloud — shared infrastructure\n- Private Cloud — dedicated to one organization\n- Hybrid Cloud — combination of both`,
    'machine learning': `**Machine Learning — Full Guide**\n\nML is a branch of AI where computers **learn from data** without being explicitly programmed for every task.\n\n**Types of ML:**\n\n**1. Supervised Learning** — Labeled training data\n- Classification: KNN, SVM, Decision Tree\n- Regression: Linear, Polynomial, Ridge\n\n**2. Unsupervised Learning** — No labels\n- Clustering: K-Means, DBSCAN\n- Dimensionality Reduction: PCA\n\n**3. Reinforcement Learning** — Agent learns by rewards\n- Games, robotics, self-driving cars\n\n**ML Pipeline:**\n1. Collect data\n2. Clean and preprocess\n3. Exploratory data analysis\n4. Feature engineering\n5. Model selection\n6. Train and validate\n7. Hyperparameter tuning\n8. Deploy and monitor\n\n**Important Concepts:**\n- Overfitting vs Underfitting\n- Bias-Variance Tradeoff\n- Cross-Validation\n- Feature Importance`,
  };

  const generateAnswer = (question) => {
  const q = question.toLowerCase().trim();

  // ── Greetings ─────────────────────────────────────────────
  if (q === 'hi' || q === 'hello' || q.includes('hello') || q.includes('hey')) {
    return `Hello! Great to see you! 😊\n\nI am your AI Teacher for **${YEAR_LABELS[userYear] || 'Engineering'}**. Ask me anything about your subjects!\n\n${(YEAR_SUBJECTS[userYear] || []).slice(0, 6).map(s => '📘 ' + s).join('\n')}\n\nJust ask like:\n- "Explain Deep Learning"\n- "What is Distributed Systems?"\n- "How does Machine Learning work?"`;
  }
  if (q.includes('thank')) return `You are very welcome! 😊\n\nKeep asking questions — that is the best way to learn!\n\nIs there anything else you would like me to explain?`;
  if (q.includes('how are you')) return `I am doing great and ready to help you learn! ⚡\n\nWhat would you like to study today?`;

  // ── Math calculations ─────────────────────────────────────
  const calcMatch = q.match(/what is (\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(\d+(?:\.\d+)?)/);
  if (calcMatch) {
    const a = parseFloat(calcMatch[1]), op = calcMatch[2], b = parseFloat(calcMatch[3]);
    let res;
    if (op === '+') res = a + b;
    else if (op === '-') res = a - b;
    else if (op === '*' || op === 'x' || op === '×') res = a * b;
    else if (op === '/' || op === '÷') res = b !== 0 ? parseFloat((a/b).toFixed(4)) : 'undefined';
    if (res !== undefined) return `**${a} ${op} ${b} = ${res}**\n\nAnswer: **${res}**`;
  }

  // ══════════════════════════════════════════════════════════
  // FE SUBJECTS
  // ══════════════════════════════════════════════════════════

  if (q.includes('engineering mathematics') || q.includes('engineering math') || (q.includes('calculus') && userYear === 'FE')) {
    return `**Engineering Mathematics — Complete Guide**\n\n**What is it?**\nEngineering Mathematics forms the mathematical foundation for all engineering subjects. It covers calculus, algebra, matrices, and differential equations.\n\n**Key Topics in Semester I (Engineering Mathematics-I):**\n\n**1. Matrices and Determinants**\n- A matrix is a rectangular array of numbers\n- 2×2 determinant: |A| = ad - bc\n- Used to solve systems of linear equations\n- Applications: Computer graphics, machine learning\n\n**2. Differential Calculus**\n- Derivative measures rate of change\n- d/dx(xⁿ) = nxⁿ⁻¹ (Power Rule)\n- d/dx(sin x) = cos x\n- d/dx(eˣ) = eˣ\n- d/dx(ln x) = 1/x\n\n**Example:** d/dx(x³ + 2x) = 3x² + 2\n\n**3. Integral Calculus**\n- Integration = reverse of differentiation\n- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C\n- ∫sin x dx = -cos x + C\n\n**4. Differential Equations**\n- Equations involving derivatives\n- dy/dx = f(x) — Ordinary differential equation\n- Used in physics, signal processing, control systems\n\n**Semester II (Engineering Mathematics-II):**\n- Complex Numbers: z = a + bi\n- Laplace Transforms — for circuit analysis\n- Vector Calculus — gradient, divergence, curl\n- Fourier Series — signal decomposition\n\n**Real Engineering Uses:**\n- Signal processing uses Fourier transforms\n- Control systems use Laplace transforms\n- Machine learning uses linear algebra and calculus`;
  }

  if (q.includes('engineering physics') || q.includes('engineering chemistry')) {
    return `**Engineering Physics & Chemistry — Key Concepts**\n\n**Engineering Physics:**\n\n**1. Mechanics**\n- Newton's Laws: F = ma\n- Work = Force × displacement\n- Energy conservation: KE + PE = constant\n\n**2. Waves and Optics**\n- Wave equation: v = fλ\n- Interference — constructive and destructive\n- Lasers — Light Amplification by Stimulated Emission of Radiation\n\n**3. Electromagnetism**\n- Ohm's Law: V = IR\n- Faraday's Law — electromagnetic induction\n- Maxwell's equations — foundation of electronics\n\n**4. Quantum Mechanics (basics)**\n- Photoelectric effect — Einstein's equation: E = hf\n- Wave-particle duality\n- Heisenberg uncertainty principle\n\n**Engineering Chemistry:**\n\n**1. Electrochemistry**\n- Galvanic cells — convert chemical energy to electrical\n- Electrolysis — electrical energy to chemical\n- Battery technology — lithium-ion batteries\n\n**2. Polymers**\n- Long chain molecules: plastics, rubber, fibres\n- Thermoplastics vs thermosetting plastics\n\n**3. Corrosion**\n- Oxidation of metals (rusting)\n- Prevention: galvanization, coating, cathodic protection\n\n**4. Water Treatment**\n- Hardness of water — calcium and magnesium salts\n- Softening methods: lime-soda, ion exchange\n- Applications in industrial processes`;
  }

  if (q.includes('programming') && (q.includes('problem') || q.includes('solving') || q.includes('c language') || userYear === 'FE')) {
    return `**Programming and Problem Solving (C Language) — Complete Guide**\n\n**What is Programming?**\nProgramming means giving step-by-step instructions to a computer to solve a problem.\n\n**C Language Basics:**\n\n**Structure of a C Program:**\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n\`\`\`\n\n**Data Types:**\n- int — whole numbers (4 bytes)\n- float — decimal numbers (4 bytes)\n- double — more precise decimals (8 bytes)\n- char — single character (1 byte)\n\n**Control Structures:**\n\`\`\`c\n// If-else\nif (marks >= 60) {\n    printf("Pass");\n} else {\n    printf("Fail");\n}\n\n// For loop\nfor (int i = 0; i < 5; i++) {\n    printf("%d ", i);\n}\n\n// While loop\nint n = 1;\nwhile (n <= 10) {\n    printf("%d\\n", n++);\n}\n\`\`\`\n\n**Functions:**\n\`\`\`c\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int result = add(5, 3);  // result = 8\n    return 0;\n}\n\`\`\`\n\n**Arrays:**\n\`\`\`c\nint marks[5] = {90, 85, 78, 92, 88};\nfor (int i = 0; i < 5; i++) {\n    printf("Mark %d: %d\\n", i+1, marks[i]);\n}\n\`\`\`\n\n**Pointers (important!):**\n\`\`\`c\nint x = 10;\nint *ptr = &x;  // ptr stores address of x\nprintf("%d", *ptr);  // prints 10 (value at address)\n\`\`\`\n\n**Problem Solving Steps:**\n1. Understand the problem\n2. Plan algorithm (flowchart or pseudocode)\n3. Write code\n4. Test with sample inputs\n5. Debug and optimize`;
  }

  // ══════════════════════════════════════════════════════════
  // SE SUBJECTS
  // ══════════════════════════════════════════════════════════

  if (q.includes('data structure') || q.includes('dsa') || q.includes('linked list') || q.includes('stack') || q.includes('queue')) {
    return `**Data Structures & Algorithms — Complete Guide**\n\n**What are Data Structures?**\nData structures are ways to organize and store data in memory for efficient access and modification.\n\n**1. Arrays**\n- Fixed-size sequential collection\n- Access: O(1) — constant time\n- Search: O(n) — linear time\n\n**2. Linked Lists**\nEach node contains data + pointer to next node.\n\`\`\`\n[10|→] → [20|→] → [30|NULL]\n\`\`\`\n- Singly Linked: one direction\n- Doubly Linked: forward + backward pointers\n- Insert at beginning: O(1)\n- Search: O(n)\n\n**3. Stack (LIFO — Last In First Out)**\nThink of a stack of plates!\n- Push — add to top: O(1)\n- Pop — remove from top: O(1)\n- Uses: undo feature, function calls, expression evaluation\n\n**4. Queue (FIFO — First In First Out)**\nThink of a ticket counter line!\n- Enqueue — add at rear: O(1)\n- Dequeue — remove from front: O(1)\n- Uses: CPU scheduling, BFS, print spooler\n\n**5. Trees**\n- Binary Search Tree: left < parent < right\n- Traversals: Inorder (sorted), Preorder, Postorder\n- Height: O(log n) for balanced tree\n\n**6. Sorting Algorithms**\n| Algorithm | Best | Average | Worst | Space |\n|-----------|------|---------|-------|-------|\n| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |\n| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |\n| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |\n\n**7. Graphs**\n- Vertices (nodes) + Edges (connections)\n- BFS — Level-by-level traversal (uses Queue)\n- DFS — Go deep first (uses Stack/Recursion)\n- Dijkstra's algorithm — shortest path\n\n**Key Rule:** Choose data structure based on your most frequent operation!`;
  }

  if (q.includes('object oriented') || q.includes('oop') || q.includes('java') || q.includes('inheritance') || q.includes('polymorphism') || q.includes('encapsulation') || q.includes('abstraction')) {
    return `**Object Oriented Programming (Java) — Complete Guide**\n\n**Four Pillars of OOP:**\n\n**1. Encapsulation — Hiding data inside a class**\n\`\`\`java\nclass BankAccount {\n    private double balance;  // Hidden!\n    \n    public void deposit(double amount) {\n        if (amount > 0) balance += amount;\n    }\n    public double getBalance() { return balance; }\n}\n\`\`\`\n\n**2. Inheritance — Child gets parent's properties**\n\`\`\`java\nclass Animal {\n    String name;\n    void eat() { System.out.println("Eating"); }\n}\n\nclass Dog extends Animal {\n    void bark() { System.out.println("Woof!"); }\n}\n\nDog d = new Dog();\nd.eat();   // From Animal\nd.bark();  // Dog's own\n\`\`\`\n\n**3. Polymorphism — One name, many forms**\n\`\`\`java\n// Method Overloading (compile-time)\nclass Calculator {\n    int add(int a, int b) { return a+b; }\n    double add(double a, double b) { return a+b; }\n}\n\n// Method Overriding (runtime)\nclass Animal { void sound() { System.out.println("..."); } }\nclass Dog extends Animal {\n    @Override\n    void sound() { System.out.println("Woof"); }\n}\n\`\`\`\n\n**4. Abstraction — Show only what is needed**\n\`\`\`java\ninterface Shape {\n    double area();  // Abstract method\n}\n\nclass Circle implements Shape {\n    double radius;\n    Circle(double r) { this.radius = r; }\n    public double area() { return 3.14 * radius * radius; }\n}\n\`\`\`\n\n**Java Important Concepts:**\n- **Interface** — 100% abstraction, multiple inheritance\n- **Abstract class** — partial abstraction\n- **Constructor** — called when object is created\n- **static** — belongs to class, not object\n- **final** — cannot be changed/overridden\n- **try-catch** — exception handling\n\n**Collections Framework:**\n- ArrayList — dynamic array\n- HashMap — key-value pairs\n- HashSet — unique elements\n- LinkedList — doubly linked list`;
  }

  if (q.includes('database') || q.includes('dbms') || q.includes('sql') || q.includes('normalization') || q.includes('er diagram')) {
    return `**Database Management System (DBMS) — Complete Guide**\n\n**What is DBMS?**\nA DBMS is software that manages databases — stores, retrieves, and manipulates data efficiently.\n\n**SQL Commands:**\n\`\`\`sql\n-- Create table\nCREATE TABLE Students (\n    id INT PRIMARY KEY,\n    name VARCHAR(50),\n    marks INT,\n    year VARCHAR(5)\n);\n\n-- Insert data\nINSERT INTO Students VALUES (1, 'Rahul', 85, 'SE');\n\n-- Select data\nSELECT * FROM Students WHERE marks > 60;\nSELECT name, marks FROM Students ORDER BY marks DESC;\n\n-- Update\nUPDATE Students SET marks = 90 WHERE name = 'Rahul';\n\n-- Delete\nDELETE FROM Students WHERE marks < 40;\n\n-- Join\nSELECT s.name, c.course\nFROM Students s\nINNER JOIN Courses c ON s.id = c.student_id;\n\n-- Aggregate functions\nSELECT AVG(marks), MAX(marks), MIN(marks) FROM Students;\nSELECT year, COUNT(*) FROM Students GROUP BY year;\n\`\`\`\n\n**Normalization — Reducing Redundancy:**\n- **1NF** — Atomic values, no repeating groups\n- **2NF** — 1NF + No partial dependency\n- **3NF** — 2NF + No transitive dependency\n- **BCNF** — Stricter form of 3NF\n\n**ER Diagram Components:**\n- **Entity** — Rectangle (e.g., Student, Course)\n- **Attribute** — Ellipse (e.g., name, roll_no)\n- **Relationship** — Diamond (e.g., Enrolls)\n- **Primary Key** — Underlined attribute\n\n**ACID Properties (Transactions):**\n- **Atomicity** — All or nothing\n- **Consistency** — Data remains valid\n- **Isolation** — Transactions don't interfere\n- **Durability** — Changes are permanent\n\n**Indexing:** Speeds up queries using B-tree or Hash structures\n**Views:** Virtual tables based on queries`;
  }

  if (q.includes('computer network') || q.includes('osi') || q.includes('tcp') || q.includes('ip address') || q.includes('networking')) {
    return `**Computer Networks — Complete Guide**\n\n**OSI Model — 7 Layers (mnemonic: "Please Do Not Throw Sausage Pizza Away")**\n\n7. **Application** — HTTP, FTP, SMTP, DNS (User interface)\n6. **Presentation** — Encryption, compression, data format\n5. **Session** — Manages sessions between applications\n4. **Transport** — TCP (reliable), UDP (fast) — Port numbers\n3. **Network** — IP addressing, routing (IP, ICMP, ARP)\n2. **Data Link** — MAC addresses, frames (Ethernet, WiFi)\n1. **Physical** — Cables, signals, bits\n\n**TCP vs UDP:**\n| Feature | TCP | UDP |\n|---------|-----|-----|\n| Reliability | Yes (ACK) | No |\n| Speed | Slower | Faster |\n| Connection | Connection-oriented | Connectionless |\n| Use | Web, Email, FTP | Video streaming, DNS, Gaming |\n\n**IP Addressing:**\n- IPv4: 32-bit → 192.168.1.100\n- IPv6: 128-bit → 2001:0db8::8a2e:0370:7334\n- Subnet mask: 255.255.255.0 = /24\n- Private ranges: 10.x.x.x, 172.16.x.x, 192.168.x.x\n\n**HTTP/HTTPS:**\n- HTTP: HyperText Transfer Protocol (port 80)\n- HTTPS: Secure with SSL/TLS (port 443)\n- Methods: GET, POST, PUT, DELETE\n\n**DNS (Domain Name System):**\n- Translates domain names to IP addresses\n- You type google.com → DNS returns 142.250.80.46\n\n**Network Topologies:**\n- **Star** — All connected to central switch (most common)\n- **Bus** — All on one cable\n- **Ring** — Circular connection\n- **Mesh** — Every node connected to every other\n\n**Protocols you must know:**\n- HTTP/HTTPS — Web\n- FTP — File transfer\n- SMTP/POP3/IMAP — Email\n- SSH — Secure remote access\n- DHCP — Automatic IP assignment`;
  }

  if (q.includes('operating system') || (q.includes('os') && (q.includes('explain') || q.includes('what is') || q.includes('process'))) || q.includes('scheduling') || q.includes('deadlock') || q.includes('memory management')) {
    return `**Operating Systems — Complete Guide**\n\n**What is an OS?**\nAn Operating System manages computer hardware resources and provides services for programs.\n\n**Functions of OS:**\n- Process Management\n- Memory Management\n- File System Management\n- I/O Device Management\n- Security and Protection\n\n**Process Scheduling Algorithms:**\n\n**1. FCFS (First Come First Serve)**\n- Non-preemptive, simple\n- Problem: Convoy effect (long process blocks short ones)\n\n**2. SJF (Shortest Job First)**\n- Minimum average waiting time\n- Non-preemptive version most common\n\n**3. Round Robin (most used in practice)**\n- Each process gets a time quantum (e.g., 20ms)\n- Fair for all processes\n- Good for time-sharing systems\n\n**4. Priority Scheduling**\n- Higher priority runs first\n- Problem: Starvation of low-priority processes\n- Solution: Aging — increase priority over time\n\n**Memory Management:**\n- **Paging** — Fixed-size blocks (pages), no external fragmentation\n- **Segmentation** — Variable-size blocks based on logical units\n- **Virtual Memory** — Use disk as extension of RAM\n- **Page Replacement:** FIFO, LRU (Least Recently Used), Optimal\n\n**Deadlock — 4 Conditions (ALL must hold):**\n1. Mutual Exclusion — resource held by one at a time\n2. Hold and Wait — process holds and waits for more\n3. No Preemption — resources cannot be forcibly taken\n4. Circular Wait — P1→P2→P3→P1\n\n**Deadlock Handling:**\n- Prevention — break one condition\n- Avoidance — Banker's Algorithm\n- Detection & Recovery — find and break deadlock\n\n**File System:**\n- FAT32, NTFS (Windows), ext4 (Linux)\n- Directory structure: hierarchical tree\n- Inode — metadata about a file`;
  }

  // ══════════════════════════════════════════════════════════
  // TE SUBJECTS
  // ══════════════════════════════════════════════════════════

  if (q.includes('theory of computation') || q.includes('automata') || q.includes('turing machine') || q.includes('finite automata') || q.includes('toc')) {
    return `**Theory of Computation — Complete Guide**\n\n**What is TOC?**\nTheory of Computation studies what problems computers can and cannot solve, and how efficiently.\n\n**1. Finite Automata (FA)**\nA machine with finite states that accepts or rejects strings.\n\n**DFA (Deterministic Finite Automata):**\n- For each state + input → exactly ONE next state\n- M = (Q, Σ, δ, q₀, F)\n  - Q = set of states\n  - Σ = input alphabet\n  - δ = transition function\n  - q₀ = start state\n  - F = set of final/accept states\n\n**NFA (Non-deterministic FA):**\n- For each state + input → can go to MULTIPLE states\n- Every NFA can be converted to equivalent DFA\n\n**2. Regular Languages**\n- Accepted by finite automata\n- Described by regular expressions\n- Examples: (a|b)*, a*b+, [0-9]+\n- Closed under union, concatenation, star\n\n**3. Context-Free Grammars (CFG)**\n- Productions: A → α (A is a variable, α is a string)\n- Accepted by Pushdown Automata (PDA)\n- Example: S → aSb | ε (generates aⁿbⁿ)\n- Used in: Programming language parsers\n\n**4. Pushdown Automata (PDA)**\n- Finite automaton + stack memory\n- Can recognize context-free languages\n- Stack helps match balanced brackets, etc.\n\n**5. Turing Machine**\n- Infinite tape, read/write head\n- Can simulate any algorithm\n- Decides: halts in accept or reject state\n- Undecidable problems: Halting Problem\n\n**Chomsky Hierarchy:**\n- Type 0: Recursively enumerable (Turing Machine)\n- Type 1: Context-sensitive\n- Type 2: Context-free (PDA)\n- Type 3: Regular (Finite Automata)\n\n**Pumping Lemma:**\n- Proves a language is NOT regular\n- If L is regular, any long enough string can be pumped`;
  }

  if (q.includes('machine learning') || q.includes('supervised') || q.includes('unsupervised') || q.includes('neural network') || q.includes('deep learning') || q.includes('classification') || q.includes('regression')) {
    return `**Machine Learning — Complete Guide**\n\n**What is ML?**\nML allows computers to learn from data and make predictions without being explicitly programmed for every task.\n\n**Three Types of ML:**\n\n**1. Supervised Learning (labeled data)**\nTraining data has correct answers.\n- **Classification** — predict categories\n  - Algorithms: Logistic Regression, SVM, Decision Tree, KNN, Random Forest\n  - Example: Spam detection, disease diagnosis\n- **Regression** — predict numbers\n  - Algorithms: Linear Regression, Polynomial, Ridge, Lasso\n  - Example: House price, stock prediction\n\n**Linear Regression:**\ny = mx + b\n- m = slope, b = intercept\n- Find best fit line minimizing MSE (Mean Squared Error)\n\n**2. Unsupervised Learning (no labels)**\n- **Clustering:** K-Means, DBSCAN, Hierarchical\n- **Dimensionality Reduction:** PCA (Principal Component Analysis)\n- Example: Customer segmentation, anomaly detection\n\n**K-Means Algorithm:**\n1. Choose K cluster centers randomly\n2. Assign each point to nearest center\n3. Update centers to mean of points in cluster\n4. Repeat until convergence\n\n**3. Reinforcement Learning**\n- Agent takes actions, gets rewards/penalties\n- Goal: maximize total reward\n- Examples: Chess AI, self-driving cars, robotics\n\n**Model Evaluation:**\n- **Accuracy** = (TP + TN) / Total\n- **Precision** = TP / (TP + FP)\n- **Recall** = TP / (TP + FN)\n- **F1 Score** = 2 × (Precision × Recall) / (Precision + Recall)\n- **Cross-validation** — split data multiple ways to test\n\n**Overfitting vs Underfitting:**\n- Overfitting: memorizes training data, fails on new data → use regularization, more data, dropout\n- Underfitting: too simple, bad on both → use more complex model\n\n**Important Algorithms:**\n- Decision Trees — tree of if-else rules\n- Random Forest — many decision trees ensemble\n- SVM — find maximum margin hyperplane\n- KNN — classify based on K nearest neighbors`;
  }

  if (q.includes('deep learning') || q.includes('cnn') || q.includes('rnn') || q.includes('lstm') || q.includes('transformer') || q.includes('backpropagation')) {
    return `**Deep Learning — Complete Guide**\n\n**What is Deep Learning?**\nDeep Learning is Machine Learning using Neural Networks with many layers. Inspired by the human brain.\n\n**Neural Network Structure:**\n\`\`\`\nInput Layer → Hidden Layer 1 → Hidden Layer 2 → Output Layer\n   [x₁]           [h₁]              [h₁]           [ŷ]\n   [x₂]     →     [h₂]      →       [h₂]     →     \n   [x₃]           [h₃]              [h₃]           \n\`\`\`\n\n**How Neural Networks Learn:**\n1. **Forward Pass** — data flows through layers\n2. **Loss Calculation** — compare prediction vs actual\n3. **Backpropagation** — calculate gradients using chain rule\n4. **Weight Update** — w = w - learning_rate × gradient\n5. Repeat for thousands of iterations (epochs)\n\n**Activation Functions:**\n- **ReLU:** f(x) = max(0, x) — most common in hidden layers\n- **Sigmoid:** f(x) = 1/(1+e⁻ˣ) — output 0 to 1, binary classification\n- **Softmax:** converts scores to probabilities (multi-class)\n- **Tanh:** output -1 to 1\n\n**Key Architectures:**\n\n**CNN (Convolutional Neural Network):**\n- Best for images\n- Layers: Convolution → Pooling → Fully Connected\n- Convolution extracts features (edges, shapes)\n- Pooling reduces dimensions\n- Applications: Image recognition, Face detection\n\n**RNN (Recurrent Neural Network):**\n- Best for sequences (text, time series)\n- Has memory — output feeds back as input\n- Problem: Vanishing gradient\n\n**LSTM (Long Short-Term Memory):**\n- Solves vanishing gradient in RNN\n- Gates: Input gate, Forget gate, Output gate\n- Applications: Language translation, speech recognition\n\n**Transformer:**\n- Self-attention mechanism\n- Parallel processing (faster than RNN)\n- Foundation of GPT, BERT, ChatGPT\n- Applications: NLP, image generation\n\n**Regularization Techniques:**\n- **Dropout** — randomly deactivate neurons during training\n- **Batch Normalization** — normalize layer inputs\n- **L1/L2 Regularization** — penalize large weights\n\n**Frameworks:** TensorFlow, PyTorch, Keras`;
  }

  if (q.includes('web') && (q.includes('technology') || q.includes('development') || q.includes('application')) || q.includes('html') || q.includes('css') || q.includes('javascript') || q.includes('react') || q.includes('node')) {
    return `**Web Technology / Web Application Development — Complete Guide**\n\n**Frontend (Client-side):**\n\n**HTML — Structure:**\n\`\`\`html\n<!DOCTYPE html>\n<html>\n  <head><title>My Page</title></head>\n  <body>\n    <h1>Welcome</h1>\n    <p>This is a paragraph</p>\n    <a href="https://google.com">Click here</a>\n    <img src="photo.jpg" alt="Photo">\n    <button onclick="sayHello()">Click Me</button>\n  </body>\n</html>\n\`\`\`\n\n**CSS — Styling:**\n\`\`\`css\nbody { font-family: Arial; background: #f0f0f0; }\nh1   { color: blue; font-size: 24px; }\n.card { background: white; border-radius: 10px; padding: 20px; }\n\n/* Flexbox layout */\n.container { display: flex; justify-content: center; gap: 16px; }\n\n/* Grid layout */\n.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }\n\`\`\`\n\n**JavaScript — Behaviour:**\n\`\`\`javascript\n// Variables\nlet name = "Rahul";\nconst PI = 3.14;\n\n// Function\nfunction greet(name) {\n    return "Hello, " + name;\n}\n\n// DOM manipulation\ndocument.getElementById("btn").addEventListener("click", () => {\n    alert("Button clicked!");\n});\n\n// Fetch API\nfetch("https://api.example.com/data")\n    .then(res => res.json())\n    .then(data => console.log(data));\n\`\`\`\n\n**Backend (Server-side):**\n\n**Node.js + Express:**\n\`\`\`javascript\nconst express = require("express");\nconst app = express();\n\napp.get("/students", (req, res) => {\n    res.json([{ name: "Rahul", year: "SE" }]);\n});\n\napp.listen(3000, () => console.log("Server running!"));\n\`\`\`\n\n**REST API Methods:**\n- GET — fetch data\n- POST — create new data\n- PUT/PATCH — update data\n- DELETE — remove data\n\n**MEAN/MERN Stack:**\n- MongoDB (database) + Express (backend) + React/Angular (frontend) + Node.js (runtime)`;
  }

  if (q.includes('computer network') && q.includes('security') || q.includes('cybersecurity') || q.includes('cyber security') || q.includes('encryption') || q.includes('cryptography')) {
    return `**Computer Networks & Security — Complete Guide**\n\n**Network Security Goals (CIA Triad):**\n- **Confidentiality** — only authorized access\n- **Integrity** — data not tampered with\n- **Availability** — system accessible when needed\n\n**Cryptography:**\n\n**Symmetric Encryption:**\n- Same key for encrypt and decrypt\n- Fast but key distribution problem\n- Examples: AES (Advanced Encryption Standard), DES\n- AES-256 is current gold standard\n\n**Asymmetric Encryption:**\n- Public key + Private key pair\n- Public key encrypts, Private key decrypts\n- Slow but solves key distribution\n- Examples: RSA, ECC\n- Used in HTTPS, digital signatures\n\n**Hashing:**\n- One-way function — cannot reverse\n- Same input always gives same output\n- Algorithms: MD5 (weak), SHA-256, SHA-3\n- Uses: Password storage, file integrity\n\n**Network Attacks:**\n- **Man-in-the-Middle** — attacker intercepts communication\n- **DDoS** — Distributed Denial of Service — flood server with requests\n- **Phishing** — fake websites to steal credentials\n- **SQL Injection** — malicious SQL in input fields\n- **XSS** — Cross-Site Scripting — inject scripts into web pages\n- **Brute Force** — try all password combinations\n\n**Security Mechanisms:**\n- **Firewall** — filter network traffic by rules\n- **VPN** — encrypted tunnel for private communication\n- **IDS/IPS** — Intrusion Detection/Prevention System\n- **SSL/TLS** — secure HTTPS connections\n- **2FA** — Two-Factor Authentication\n\n**Digital Certificate:**\n- Issued by Certificate Authority (CA)\n- Binds public key to identity\n- Used in HTTPS to verify website identity`;
  }

  // ══════════════════════════════════════════════════════════
  // BE SUBJECTS
  // ══════════════════════════════════════════════════════════

  if (q.includes('information') && q.includes('storage') || q.includes('information retrieval') || q.includes('isr')) {
    return `**Information and Storage Retrieval — Complete Guide**\n\n**What is Information Retrieval (IR)?**\nIR is the process of finding relevant information from a large collection of documents based on user queries.\n\n**IR System Components:**\n1. **Document Collection** — corpus of text documents\n2. **Indexer** — builds index from documents\n3. **Query Processor** — parses user queries\n4. **Ranking Engine** — ranks results by relevance\n\n**Text Preprocessing Steps:**\n1. **Tokenization** — split text into words/tokens\n2. **Stop word removal** — remove common words (the, is, a)\n3. **Stemming** — reduce words to root (running → run)\n4. **Lemmatization** — proper root form (better → good)\n\n**Indexing:**\n- **Inverted Index** — maps words to documents containing them\n  - Word: "database" → Documents: [doc1, doc3, doc7]\n- Allows fast query processing\n\n**Retrieval Models:**\n\n**1. Boolean Model**\n- Queries using AND, OR, NOT\n- Example: "database AND security"\n- No ranking — just match or no match\n\n**2. Vector Space Model**\n- Documents and queries as vectors\n- Similarity using **cosine similarity**\n- cosine(A,B) = A·B / (|A| × |B|)\n- Uses TF-IDF weighting\n\n**TF-IDF (Term Frequency — Inverse Document Frequency):**\n- TF = (times term appears in doc) / (total words in doc)\n- IDF = log(total docs / docs containing term)\n- TF-IDF = TF × IDF\n- High score = term is important in this document\n\n**3. Probabilistic Model (BM25)**\n- Best Match 25 — used by modern search engines\n\n**Evaluation Metrics:**\n- **Precision** = relevant retrieved / total retrieved\n- **Recall** = relevant retrieved / total relevant\n- **F1 Score** = harmonic mean of precision and recall\n- **MAP** — Mean Average Precision\n\n**Storage Systems:**\n- **RAID** — Redundant Array of Independent Disks\n- RAID 0: Striping (speed), RAID 1: Mirroring (backup)\n- RAID 5: Striping + Parity (balance)\n- **NoSQL Databases:** MongoDB, Cassandra, Redis\n- **Distributed Storage:** HDFS, Amazon S3`;
  }

  if (q.includes('software project') || q.includes('project management') || q.includes('spm') || q.includes('software engineering')) {
    return `**Software Project Management — Complete Guide**\n\n**What is SPM?**\nSPM involves planning, organizing, and controlling software development projects to deliver on time, within budget, and with required quality.\n\n**SDLC (Software Development Life Cycle) Models:**\n\n**1. Waterfall Model**\n- Sequential phases: Requirements → Design → Code → Test → Deploy\n- Simple but inflexible — hard to go back\n- Good for: Well-defined, stable requirements\n\n**2. Agile Model (most popular today)**\n- Iterative sprints (1-4 weeks each)\n- Working software delivered every sprint\n- Customer feedback incorporated continuously\n- Frameworks: Scrum, Kanban, XP\n\n**Scrum Framework:**\n- **Sprint** — 2-4 week development cycle\n- **Product Backlog** — list of all features\n- **Sprint Backlog** — features for current sprint\n- **Daily Standup** — 15-min daily meeting\n- **Sprint Review** — demo to stakeholders\n- **Sprint Retrospective** — team improvement meeting\n\n**3. DevOps**\n- Development + Operations working together\n- CI/CD: Continuous Integration / Continuous Deployment\n- Tools: Jenkins, Docker, Kubernetes, Git\n\n**Project Planning:**\n- **WBS** — Work Breakdown Structure — decompose project into tasks\n- **Gantt Chart** — timeline visualization of tasks\n- **PERT Chart** — network diagram of task dependencies\n- **Critical Path** — longest path determining project duration\n\n**Cost Estimation:**\n- **COCOMO** — Constructive Cost Model\n  - Effort = a × (KLOC)^b\n- **Function Point Analysis** — count functional requirements\n\n**Risk Management:**\n1. Risk Identification\n2. Risk Analysis (probability × impact)\n3. Risk Planning (mitigation strategies)\n4. Risk Monitoring\n\n**Software Quality:**\n- **ISO 9001** — Quality Management Standard\n- **CMMI** — Capability Maturity Model Integration (levels 1-5)\n- **Testing:** Unit → Integration → System → Acceptance`;
  }

  if (q.includes('distributed') || q.includes('distributed system') || q.includes('distributed computing')) {
    return `**Distributed Systems — Complete Guide**\n\n**What is a Distributed System?**\nA distributed system is a collection of computers that appear to users as a single coherent system.\n\n**Example:** Google, Amazon, Netflix — run on thousands of servers worldwide\n\n**Key Challenges:**\n- **Network partitions** — network failures separate nodes\n- **Partial failures** — some components fail, others work\n- **Concurrency** — multiple processes running simultaneously\n- **Consistency** — all nodes see same data\n\n**CAP Theorem (Brewer's Theorem):**\nA distributed system can only guarantee 2 of 3:\n- **C**onsistency — all nodes see same data at same time\n- **A**vailability — every request gets a response\n- **P**artition tolerance — system works despite network failures\n\n**Examples:**\n- CP systems: MongoDB, HBase (consistent + partition tolerant)\n- AP systems: Cassandra, DynamoDB (available + partition tolerant)\n- CA systems: Traditional RDBMS (only without partitions)\n\n**Consensus Algorithms:**\n- **Paxos** — agree on a value despite failures\n- **Raft** — easier to understand than Paxos, used in etcd, Consul\n- **PBFT** — Byzantine Fault Tolerance\n\n**Distributed File Systems:**\n- **HDFS** — Hadoop Distributed File System\n  - NameNode (metadata) + DataNodes (actual data)\n  - Replication factor = 3 (default)\n- **GFS** — Google File System\n- **Ceph** — open source\n\n**Load Balancing:**\n- Round Robin — distribute requests equally\n- Least Connections — send to least busy server\n- Consistent Hashing — used in caching (Memcached, Redis)\n\n**MapReduce:**\n\`\`\`\nMap Phase: Split data, apply function to each chunk\nShuffle: Group by key\nReduce Phase: Combine results\n\`\`\`\n\n**Microservices:**\n- Break application into small independent services\n- Each service: single responsibility\n- Communication: REST API or Message Queue (Kafka, RabbitMQ)\n- Benefits: Independent deployment, scalability, fault isolation\n\n**Replication Strategies:**\n- Master-Slave: One master writes, slaves read\n- Master-Master: Multiple masters can write\n- Synchronous vs Asynchronous replication`;
  }

  if (q.includes('natural language') || q.includes('nlp') || q.includes('natural language processing')) {
    return `**Natural Language Processing (NLP) — Complete Guide**\n\n**What is NLP?**\nNLP enables computers to understand, interpret, and generate human language.\n\n**NLP Pipeline:**\n1. **Text Input** — raw text\n2. **Tokenization** — split into words/sentences\n3. **Preprocessing** — lowercasing, punctuation removal\n4. **POS Tagging** — label each word (noun, verb, adjective)\n5. **Named Entity Recognition** — identify persons, places, organizations\n6. **Parsing** — understand sentence structure\n7. **Semantic Analysis** — understand meaning\n\n**Text Representation:**\n\n**Bag of Words (BoW):**\n- Represent text as word count vector\n- Ignores word order\n- Simple but effective for classification\n\n**TF-IDF:**\n- Word importance = frequency × inverse document frequency\n- Better than simple counting\n\n**Word Embeddings:**\n- **Word2Vec** — similar words have similar vectors\n- **GloVe** — Global Vectors for word representation\n- **BERT** — Bidirectional, context-aware representations\n- "king" - "man" + "woman" = "queen" (vector arithmetic!)\n\n**Key NLP Tasks:**\n\n**1. Sentiment Analysis**\n- Classify text as positive, negative, neutral\n- Applications: Product reviews, social media monitoring\n\n**2. Machine Translation**\n- Google Translate, DeepL\n- Transformer models (seq2seq with attention)\n\n**3. Text Classification**\n- Spam detection, topic categorization\n- Algorithms: Naive Bayes, SVM, BERT\n\n**4. Question Answering**\n- Extract answers from passages\n- Models: BERT, GPT, T5\n\n**5. Text Generation**\n- GPT-3/4, ChatGPT\n- Autoregressive — predict next word\n\n**Transformer Architecture:**\n- Self-attention mechanism\n- Encoder-Decoder structure\n- Parallel processing\n- Foundation of modern NLP\n\n**Famous Models:**\n- BERT (Google) — bidirectional understanding\n- GPT-4 (OpenAI) — text generation\n- T5 — text-to-text framework`;
  }

  if (q.includes('cloud computing') || q.includes('aws') || q.includes('azure') || q.includes('iaas') || q.includes('paas') || q.includes('saas')) {
    return `**Cloud Computing — Complete Guide**\n\n**What is Cloud Computing?**\nCloud computing means using servers, storage, and services over the internet instead of local hardware.\n\n**Think of electricity:** You don't own a power plant — you just use electricity when needed!\n\n**Service Models:**\n\n**1. IaaS (Infrastructure as a Service)**\n- Rent: Virtual machines, storage, networking\n- You manage: OS, applications, data\n- Examples: AWS EC2, Azure VMs, Google Compute Engine\n- Use when: Full control needed, custom configurations\n\n**2. PaaS (Platform as a Service)**\n- Rent: Development platform, databases, runtime\n- You manage: Only application code and data\n- Examples: Heroku, Google App Engine, AWS Elastic Beanstalk\n- Use when: Focus on development, not infrastructure\n\n**3. SaaS (Software as a Service)**\n- Use: Complete software over internet\n- You manage: Nothing!\n- Examples: Gmail, Office 365, Zoom, Salesforce\n- Use when: Just need to use software\n\n**Deployment Models:**\n- **Public Cloud** — shared infrastructure (AWS, Azure, GCP)\n- **Private Cloud** — dedicated to one organization\n- **Hybrid Cloud** — combination of both\n- **Multi-Cloud** — using multiple cloud providers\n\n**Key Cloud Concepts:**\n\n**Virtualization:**\n- One physical server runs multiple virtual machines\n- Hypervisor: VMware, Hyper-V, KVM\n- Containers: Docker (lightweight, portable)\n\n**Containerization (Docker):**\n\`\`\`dockerfile\nFROM node:18\nWORKDIR /app\nCOPY package.json .\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n\`\`\`\n\n**Kubernetes (K8s):**\n- Orchestrate containers at scale\n- Auto-scaling, load balancing, self-healing\n- Pods, Services, Deployments, Namespaces\n\n**Serverless Computing:**\n- AWS Lambda, Azure Functions\n- No server management — just write functions\n- Pay only when code runs\n\n**Cloud Storage:**\n- Object Storage: AWS S3, Azure Blob\n- Block Storage: AWS EBS\n- File Storage: AWS EFS`;
  }

  if (q.includes('blockchain') || q.includes('cryptocurrency') || q.includes('bitcoin') || q.includes('ethereum') || q.includes('smart contract')) {
    return `**Blockchain Technology — Complete Guide**\n\n**What is Blockchain?**\nBlockchain is a distributed, decentralized, immutable ledger that records transactions across many computers.\n\nThink of it as a **Google Sheet shared with everyone** — anyone can read, no one can secretly edit old rows!\n\n**How Blockchain Works:**\n\n**Block Structure:**\n\`\`\`\n┌─────────────────────────────────┐\n│ Block #3                        │\n│ Previous Hash: abc123...        │\n│ Timestamp: 2024-01-15 10:30     │\n│ Data: [Transaction 1, 2, 3...]  │\n│ Nonce: 48293                    │\n│ Current Hash: def456...         │\n└─────────────────────────────────┘\n\`\`\`\n\n**Blockchain Chain:**\nBlock 1 ← Block 2 ← Block 3 ← Block 4\n- Each block contains previous block's hash\n- Change one block → all subsequent hashes change → detected!\n\n**Consensus Mechanisms:**\n\n**Proof of Work (PoW):**\n- Miners solve complex mathematical puzzles\n- First to solve adds block and gets reward\n- Used by: Bitcoin\n- Problem: High energy consumption\n\n**Proof of Stake (PoS):**\n- Validators stake cryptocurrency as collateral\n- Selected based on stake amount\n- Used by: Ethereum 2.0, Cardano\n- More energy efficient\n\n**Smart Contracts:**\n- Self-executing code on blockchain\n- Automatically enforces terms\n- Language: Solidity (Ethereum)\n\`\`\`solidity\ncontract SimpleStorage {\n    uint storedData;\n    \n    function set(uint x) public {\n        storedData = x;\n    }\n    \n    function get() public view returns (uint) {\n        return storedData;\n    }\n}\n\`\`\`\n\n**Blockchain Applications:**\n- **DeFi** — Decentralized Finance\n- **NFTs** — Non-Fungible Tokens\n- **Supply Chain** — track products from manufacturer to consumer\n- **Healthcare** — secure patient records\n- **Voting Systems** — tamper-proof elections\n\n**Bitcoin vs Ethereum:**\n| Feature | Bitcoin | Ethereum |\n|---------|---------|----------|\n| Purpose | Digital currency | Smart contract platform |\n| Symbol | BTC | ETH |\n| Consensus | PoW | PoS |\n| Smart Contracts | No | Yes |`;
  }

  if (q.includes('iot') || q.includes('internet of things') || q.includes('embedded')) {
    return `**IoT & Embedded Systems — Complete Guide**\n\n**What is IoT?**\nInternet of Things — physical devices connected to internet, collecting and sharing data.\n\nExamples: Smart home devices, fitness trackers, industrial sensors, smart cities\n\n**IoT Architecture (4 Layers):**\n\n**1. Perception Layer (Device Layer)**\n- Sensors: temperature, humidity, motion, light\n- Actuators: motors, LEDs, relays\n- Microcontrollers: Arduino, ESP32, Raspberry Pi\n\n**2. Network Layer**\n- Connectivity: WiFi, Bluetooth, Zigbee, Z-Wave, LoRa, 4G/5G\n- Protocols: MQTT, CoAP, HTTP, WebSocket\n\n**3. Processing Layer**\n- Edge Computing — process data near the device\n- Cloud platforms: AWS IoT, Azure IoT Hub, Google Cloud IoT\n\n**4. Application Layer**\n- Smart Home, Healthcare, Agriculture, Manufacturing\n\n**MQTT Protocol:**\n- Lightweight messaging for IoT\n- Publish-Subscribe model\n- Broker handles message routing\n\`\`\`python\nimport paho.mqtt.client as mqtt\n\nclient = mqtt.Client()\nclient.connect("broker.mqtt.com", 1883)\nclient.publish("sensors/temperature", "25.5")\n\`\`\`\n\n**Arduino Programming (C++):**\n\`\`\`cpp\nconst int ledPin = 13;\nconst int sensorPin = A0;\n\nvoid setup() {\n    pinMode(ledPin, OUTPUT);\n    Serial.begin(9600);\n}\n\nvoid loop() {\n    int sensorValue = analogRead(sensorPin);\n    Serial.println(sensorValue);\n    if (sensorValue > 500) {\n        digitalWrite(ledPin, HIGH);\n    }\n    delay(1000);\n}\n\`\`\`\n\n**Embedded Systems Concepts:**\n- **Microcontroller vs Microprocessor:**\n  - MCU: CPU + RAM + ROM + I/O all on one chip (Arduino)\n  - MPU: Only CPU, needs external components (Raspberry Pi)\n- **RTOS** — Real-Time Operating System (FreeRTOS)\n- **Interrupts** — hardware signals that pause main program\n- **PWM** — Pulse Width Modulation for motor/LED control\n- **I2C, SPI, UART** — communication protocols between chips\n\n**IoT Security Challenges:**\n- Many devices with default passwords\n- Limited computing power for security\n- Firmware updates difficult\n- Large attack surface`;
  }

  if (q.includes('artificial intelligence') || (q.includes('ai') && !q.includes('ai teacher'))) {
    return `**Artificial Intelligence — Complete Guide**\n\n**What is AI?**\nAI is the simulation of human intelligence in machines — making them think, learn, and solve problems.\n\n**Types of AI:**\n- **Narrow AI** — specific tasks (Siri, AlphaGo, spam filter)\n- **General AI** — human-level intelligence (not yet achieved)\n- **Super AI** — beyond human intelligence (theoretical)\n\n**AI Branches:**\n\n**1. Machine Learning**\n- Supervised, Unsupervised, Reinforcement Learning\n- Models learn from data without explicit programming\n\n**2. Natural Language Processing**\n- Understanding and generating human language\n- ChatGPT, Google Translate, voice assistants\n\n**3. Computer Vision**\n- Understanding images and videos\n- Face recognition, medical imaging, self-driving cars\n\n**4. Expert Systems**\n- Rule-based systems that mimic expert knowledge\n- Medical diagnosis systems, chess programs\n\n**5. Robotics**\n- AI + physical systems\n- Industrial robots, surgical robots, drones\n\n**Search Algorithms:**\n\n**Uninformed Search:**\n- BFS — breadth-first search\n- DFS — depth-first search\n- Iterative Deepening\n\n**Informed Search:**\n- Greedy Best-First Search\n- A* Algorithm — uses heuristic function f(n) = g(n) + h(n)\n  - g(n) = cost from start to node n\n  - h(n) = estimated cost from n to goal\n\n**Knowledge Representation:**\n- Propositional Logic\n- First-Order Predicate Logic\n- Semantic Networks\n- Frames and Ontologies\n\n**Planning:**\n- STRIPS — Stanford Research Institute Problem Solver\n- State space search\n- Goal-based agents\n\n**Game Playing:**\n- Minimax Algorithm\n- Alpha-Beta Pruning\n- Monte Carlo Tree Search (used in AlphaGo)\n\n**AI Ethics:**\n- Bias in AI systems\n- Privacy concerns\n- Autonomous weapons\n- Job displacement\n- Explainability (black box problem)`;
  }

  if (q.includes('information security') || q.includes('info security') || q.includes('cyber') || (q.includes('security') && userYear === 'BE')) {
    return `**Information Security — Complete Guide**\n\n**What is Information Security?**\nInformation Security protects data from unauthorized access, modification, disclosure, or destruction.\n\n**CIA Triad:**\n- **Confidentiality** — only authorized people see data\n- **Integrity** — data is accurate and unaltered\n- **Availability** — authorized users can access data when needed\n\n**Cryptography:**\n\n**Symmetric Encryption:**\n- Same secret key for encrypt/decrypt\n- AES (Advanced Encryption Standard) — most secure today\n  - AES-128, AES-192, AES-256 bit keys\n- DES — old, 56-bit key (broken!)\n- 3DES — Triple DES, more secure but slow\n\n**Asymmetric Encryption:**\n- Public key (share with everyone) + Private key (keep secret)\n- RSA — most common, 2048 or 4096 bit keys\n- ECC (Elliptic Curve) — smaller keys, same security\n\n**Digital Signatures:**\n1. Hash the message\n2. Encrypt hash with private key = signature\n3. Recipient decrypts with public key and verifies hash\n\n**PKI (Public Key Infrastructure):**\n- Certificate Authority (CA) issues digital certificates\n- Used in HTTPS (TLS/SSL)\n- Certificate binds public key to identity\n\n**Common Attacks:**\n- **Phishing** — fake emails/sites to steal credentials\n- **SQL Injection** — malicious SQL in input: \`OR '1'='1'\`\n- **XSS** — inject scripts into web pages\n- **CSRF** — Cross-Site Request Forgery\n- **Buffer Overflow** — overflow memory to execute malicious code\n- **Man-in-the-Middle** — intercept communications\n- **Ransomware** — encrypt files and demand payment\n\n**Security Controls:**\n- **Firewalls** — filter traffic by rules\n- **IDS/IPS** — detect/prevent intrusions\n- **VPN** — encrypted private tunnel\n- **WAF** — Web Application Firewall\n- **MFA** — Multi-Factor Authentication\n\n**Security Standards:**\n- ISO 27001 — Information Security Management\n- NIST Cybersecurity Framework\n- OWASP Top 10 — web application vulnerabilities\n- GDPR — data privacy regulation`;
  }

  if (q.includes('startup') || q.includes('entrepreneurship')) {
    return `**Startup and Entrepreneurship — Complete Guide**\n\n**What is Entrepreneurship?**\nEntrepreneurship is the process of creating, launching, and running a new business while taking financial risks.\n\n**Types of Startups:**\n- **Bootstrapped** — self-funded by founder\n- **VC-backed** — funded by venture capitalists\n- **Unicorn** — startup valued at $1 billion+\n- **Deep Tech** — based on scientific/technical innovation\n\n**Startup Journey Stages:**\n1. **Idea Stage** — identify problem and solution\n2. **Validation** — test if people want your solution\n3. **MVP (Minimum Viable Product)** — simplest working version\n4. **Product-Market Fit** — your product solves a real problem well\n5. **Growth** — scale the business\n6. **Exit** — IPO or acquisition\n\n**Business Model Canvas:**\n9 key components:\n1. Value Proposition — what problem you solve\n2. Customer Segments — who your customers are\n3. Channels — how you reach customers\n4. Customer Relationships — how you interact\n5. Revenue Streams — how you make money\n6. Key Resources — what you need\n7. Key Activities — what you must do\n8. Key Partnerships — who you work with\n9. Cost Structure — what you spend on\n\n**Funding Stages:**\n- **Bootstrapping** — use own money\n- **Friends & Family** — early informal funding\n- **Angel Investment** — wealthy individuals, ₹25L-2Cr typically\n- **Seed Funding** — ₹1-5Cr from early-stage VCs\n- **Series A/B/C** — larger rounds as business grows\n- **IPO** — Initial Public Offering on stock exchange\n\n**Indian Startup Ecosystem:**\n- Government: Startup India, Make in India\n- Unicorns: Byju's, Zomato, Swiggy, Meesho, CRED\n- Incubators: IIT/IIM incubation centers, NASSCOM\n- Funding: Sequoia, Accel, Matrix Partners India`;
  }

  // ── Default response ─────────────────────────────────────
  const yearSubjects = YEAR_SUBJECTS[userYear] || [];
  const randomSubj   = yearSubjects[Math.floor(Math.random() * yearSubjects.length)] || 'your subject';
  return `Great question! Let me help you with that.\n\nI have detailed knowledge on all your ${YEAR_LABELS[userYear] || 'Engineering'} subjects:\n\n${yearSubjects.map((s, i) => (i < 10 ? '📘 **' + s + '**' : null)).filter(Boolean).join('\n')}\n\nTry asking me specifically like:\n- "Explain ${randomSubj}"\n- "What is ${yearSubjects[1] || 'Data Structures'}?"\n- "How does ${yearSubjects[2] || 'Machine Learning'} work?"\n\nWhat would you like to learn today? 🎓`;
};

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim(); setInput(''); setLoading(true);
    setMessages(p=>[...p,{role:'user',text:userMsg}]);
    await new Promise(r=>setTimeout(r,600+Math.random()*400));
    const response = generateAnswer(userMsg);
    setMessages(p=>[...p,{role:'assistant',text:response}]);
    setLoading(false);
  };

  const formatText = (text) => {
  // Handle code blocks
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts = text.split(codeBlockRegex);

  return parts.map((part, partIdx) => {
    if (partIdx % 2 === 1) {
      // Code block
      return (
        <pre key={partIdx} style={{ background:'#1a1a2e', color:'#e8e6e0', borderRadius:10, padding:'14px 16px', overflowX:'auto', fontSize:12, lineHeight:1.8, margin:'10px 0', fontFamily:'monospace', border:'1px solid rgba(255,255,255,0.1)' }}>
          <code>{part.trim()}</code>
        </pre>
      );
    }

    // Regular text — split into lines
    return part.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height:6 }} />;

      // Process inline bold **text**
      const renderBold = (str) => {
        const segments = str.split(/\*\*(.*?)\*\*/g);
        return segments.map((seg, j) => j % 2 === 1 ? <strong key={j} style={{ color:'#0f1535' }}>{seg}</strong> : seg);
      };

      // Heading line — entire line is bold (starts and ends with **)
      if (/^\*\*.*\*\*$/.test(line.trim())) {
        const heading = line.trim().replace(/^\*\*/, '').replace(/\*\*$/, '');
        return (
          <div key={partIdx+'-'+i} style={{ fontWeight:800, fontSize:14, color:'#0f1535', marginTop:14, marginBottom:4, paddingBottom:4, borderBottom:'1px solid #f0f4ff' }}>
            {heading}
          </div>
        );
      }

      // Bullet point lines — start with - or •
      if (/^[-•]\s/.test(line.trim())) {
        const content = line.trim().replace(/^[-•]\s/, '');
        return (
          <div key={partIdx+'-'+i} style={{ display:'flex', gap:8, marginLeft:12, marginBottom:4, alignItems:'flex-start' }}>
            <span style={{ color:'#2d4fea', fontWeight:700, flexShrink:0, marginTop:2, fontSize:13 }}>•</span>
            <span style={{ fontSize:13, lineHeight:1.7, color:'#2a3550' }}>{renderBold(content)}</span>
          </div>
        );
      }

      // Numbered list
      if (/^\d+[.)]\s/.test(line.trim())) {
        const numMatch = line.trim().match(/^(\d+)[.)]\s(.*)/);
        if (numMatch) {
          return (
            <div key={partIdx+'-'+i} style={{ display:'flex', gap:8, marginLeft:12, marginBottom:4, alignItems:'flex-start' }}>
              <span style={{ color:'#2d4fea', fontWeight:700, flexShrink:0, minWidth:20, fontSize:13 }}>{numMatch[1]}.</span>
              <span style={{ fontSize:13, lineHeight:1.7, color:'#2a3550' }}>{renderBold(numMatch[2])}</span>
            </div>
          );
        }
      }

      // Inline code with backticks
      if (line.includes('`')) {
        const codeParts = line.split(/`([^`]+)`/g);
        return (
          <div key={partIdx+'-'+i} style={{ marginBottom:3, lineHeight:1.7, fontSize:13, color:'#2a3550' }}>
            {codeParts.map((p,j) => j%2===1
              ? <code key={j} style={{ background:'#eef1ff', padding:'2px 7px', borderRadius:5, fontFamily:'monospace', fontSize:12, color:'#2d4fea', border:'1px solid #bbc5f8' }}>{p}</code>
              : renderBold(p)
            )}
          </div>
        );
      }

      // Regular line
      return (
        <div key={partIdx+'-'+i} style={{ marginBottom:3, lineHeight:1.75, fontSize:13, color:'#2a3550' }}>
          {renderBold(line)}
        </div>
      );
    });
  });
};

  const suggestions = userYear === 'FE'
  ? ['Explain Engineering Mathematics-I', 'What is Programming and Problem Solving?', 'Explain Engineering Physics', 'What is Engineering Mechanics?']
  : userYear === 'SE'
  ? ['Explain Data Structures & Algorithms', 'What is Database Management System?', 'Explain Object Oriented Programming', 'What is Computer Networks?']
  : userYear === 'TE'
  ? ['Explain Theory of Computation', 'What is Machine Learning?', 'Explain Operating Systems', 'What is Web Application Development?']
  : ['Explain Deep Learning', 'What is Distributed Systems?', 'Explain Software Project Management', 'What is Information and Storage Retrieval?'];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 110px)', maxHeight:750 }}>
      <div style={{ background:'rgba(255,255,255,0.93)', border:'1.5px solid rgba(255,255,255,0.95)', borderRadius:'18px 18px 0 0', padding:'14px 22px', display:'flex', alignItems:'center', gap:12, backdropFilter:'blur(8px)', boxShadow:'0 2px 10px rgba(15,21,53,0.06)' }}>
        <div style={{ width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,boxShadow:'0 4px 12px rgba(45,79,234,0.3)' }}>🤖</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15 }}>AI Teacher — {YEAR_LABELS[userYear]||'Engineering'}</div>
          <div style={{ fontSize:11, color:'var(--fast)', display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:'var(--fast)',animation:'pulse 2s infinite' }}/>
            Online · All {userYear} subjects covered
          </div>
        </div>
        <div style={{ fontSize:11, color:'var(--muted)', background:'var(--bg)', padding:'4px 10px', borderRadius:20, border:'1px solid var(--border)', fontWeight:600 }}>
          {(YEAR_SUBJECTS[userYear]||[]).length} Subjects
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 22px', background:'rgba(255,255,255,0.65)', backdropFilter:'blur(4px)', display:'flex', flexDirection:'column', gap:14 }}>
        {messages.map((msg,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start', gap:10, alignItems:'flex-start' }}>
            {msg.role==='assistant'&&<div style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,marginTop:2 }}>🤖</div>}
            <div style={{ maxWidth:'78%', padding:'12px 16px', borderRadius:msg.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background:msg.role==='user'?'linear-gradient(135deg,#2d4fea,#6b8aff)':'rgba(255,255,255,0.97)', color:msg.role==='user'?'#fff':'var(--text)', fontSize:13.5, boxShadow:msg.role==='user'?'0 4px 14px rgba(45,79,234,0.3)':'0 2px 10px rgba(15,21,53,0.08)', border:msg.role==='user'?'none':'1px solid rgba(221,227,245,0.8)', lineHeight:1.6 }}>
              {msg.role==='assistant' ? formatText(msg.text) : msg.text}
            </div>
            {msg.role==='user'&&<div style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#f5620a,#ff9a5c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,marginTop:2,color:'#fff',fontWeight:700 }}>
              {(localStorage.getItem('user')?JSON.parse(localStorage.getItem('user')).name||'S':'S')[0].toUpperCase()}
            </div>}
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0 }}>🤖</div>
            <div style={{ padding:'14px 18px', borderRadius:'18px 18px 18px 4px', background:'rgba(255,255,255,0.97)', border:'1px solid rgba(221,227,245,0.8)', display:'flex', gap:5, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--muted)', marginRight:4 }}>Thinking</span>
              {[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:'50%',background:'var(--accent)',animation:'bounce 1.2s ease-in-out '+(i*0.2)+'s infinite' }}/>)}
            </div>
          </div>
        )}
        <div ref={chatRef}/>
      </div>

      <div style={{ padding:'8px 22px', background:'rgba(255,255,255,0.8)', backdropFilter:'blur(4px)', borderTop:'1px solid var(--border)', display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none' }}>
        {suggestions.map((s,i)=>(
          <button key={i} onClick={()=>setInput(s)}
            style={{ padding:'5px 12px', border:'1.5px solid var(--border)', borderRadius:20, background:'var(--surface)', color:'var(--muted)', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', transition:'all 0.15s', fontWeight:500, flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)';e.currentTarget.style.background='#eef1ff';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)';e.currentTarget.style.background='var(--surface)';}}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 22px', background:'rgba(255,255,255,0.93)', border:'1.5px solid rgba(255,255,255,0.95)', borderRadius:'0 0 18px 18px', backdropFilter:'blur(8px)', display:'flex', gap:10, alignItems:'flex-end' }}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
          placeholder="Ask about any subject... Press Enter to send"
          rows={2} style={{ flex:1, padding:'11px 16px', border:'2px solid var(--border)', borderRadius:14, fontFamily:'inherit', fontSize:14, resize:'none', background:'var(--bg)', color:'var(--text)', outline:'none', lineHeight:1.5, maxHeight:100, transition:'border 0.2s' }}
          onFocus={e=>e.target.style.borderColor='var(--accent)'}
          onBlur={e=>e.target.style.borderColor='var(--border)'} />
        <button onClick={sendMessage} disabled={loading||!input.trim()}
          style={{ width:44,height:44,borderRadius:14,border:'none',background:loading||!input.trim()?'var(--border)':'linear-gradient(135deg,#2d4fea,#6b8aff)',color:'#fff',fontSize:20,cursor:loading||!input.trim()?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s',boxShadow:loading||!input.trim()?'none':'0 4px 14px rgba(45,79,234,0.4)' }}>
          ↑
        </button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function StudentDashboard() {
  const [tab, setTab]       = useState('dashboard');
  const [me, setMe]         = useState(null);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const yearColor = YEAR_COLORS[user.year] || '#2d4fea';
  const yearLabel = YEAR_LABELS[user.year] || 'Engineering';

  useEffect(() => {
    const api = getApi();
    Promise.all([api.get('/students/me'), api.get('/materials'), api.get('/quiz')])
      .then(([mR,matR,qR]) => { setMe(mR.data); setMaterials(matR.data); setQuizzes(qR.data); })
      .catch(err => { if(err.response?.status===401){localStorage.clear();navigate('/login');} })
      .finally(()=>setLoading(false));
  },[]);

  const markComplete = async (id) => {
    await getApi().post('/materials/complete/'+id);
    setMe(p=>({...p,progress:[...(p.progress||[]),{materialId:id,completed:true}]}));
  };

  const isCompleted = (id) => me?.progress?.some(p=>String(p.materialId)===String(id)&&p.completed);
  const completedCount = materials.filter(m=>isCompleted(m._id)).length;
  const pct = materials.length>0 ? Math.round(completedCount/materials.length*100) : 0;
  const quizCount = me?.quizHistory?.length || 0;
  const remaining = materials.length - completedCount;

  const logout = () => { localStorage.clear(); navigate('/login'); };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'linear-gradient(135deg,#0f1535,#1a2560)' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44,height:44,border:'3px solid rgba(255,255,255,0.2)',borderTopColor:'#2d4fea',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 14px' }}/>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>Loading your dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'linear-gradient(135deg,#f0f4ff 0%,#e8f0ff 50%,#f5f0ff 100%)' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 ${yearColor}44}50%{box-shadow:0 0 0 8px transparent}}
      `}</style>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div style={{ width:252, display:'flex', flexDirection:'column', flexShrink:0, background:'linear-gradient(180deg,#0f1535 0%,#1a2260 100%)', backdropFilter:'blur(14px)', borderRight:'1px solid rgba(255,255,255,0.08)', minHeight:'100vh', boxShadow:'4px 0 24px rgba(0,0,0,0.2)' }}>

        {/* Logo */}
        <div style={{ padding:'22px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <img src="/logo.png.jpeg" alt="logo" style={{ width:42,height:42,borderRadius:12,objectFit:'contain',background:'rgba(255,255,255,0.08)',padding:4 }} onError={e=>e.target.style.display='none'} />
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:800, color:'#fff', letterSpacing:-0.5 }}>MentorMap</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Student Portal</div>
            </div>
          </div>

          {/* Student info card */}
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:14, padding:'12px 14px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,'+yearColor+','+yearColor+'88)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#fff',flexShrink:0,animation:'glow 3s ease infinite' }}>
                {(user.name||'S')[0].toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {user.year && <span style={{ fontSize:10, fontWeight:800, background:yearColor+'33', color:yearColor, padding:'3px 10px', borderRadius:20, border:'1px solid '+yearColor+'44' }}>📅 {user.year}</span>}
              <span style={{ fontSize:10, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', padding:'3px 10px', borderRadius:20 }}>{yearLabel}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:'6px 10px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>setTab(n.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, fontSize:13, cursor:'pointer', marginBottom:3, border:'none', width:'100%', textAlign:'left', fontFamily:"'Inter',sans-serif", fontWeight:tab===n.id?700:500, transition:'all 0.18s',
                background:tab===n.id?yearColor+' !important':undefined,
                backgroundColor:tab===n.id?yearColor:'transparent',
                color:tab===n.id?'#fff':'rgba(255,255,255,0.45)',
                boxShadow:tab===n.id?'0 4px 14px '+yearColor+'44':'none',
                transform:tab===n.id?'translateX(4px)':'none' }}>
              <span style={{ fontSize:16 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id==='aiteacher'&&<span style={{ marginLeft:'auto', width:8,height:8,borderRadius:'50%',background:'#0ea86e',animation:'pulse 2s infinite',flexShrink:0 }}/>}
              {n.id==='quizzes'&&quizzes.length>0&&<span style={{ marginLeft:'auto', fontSize:10, background:yearColor, color:'#fff', padding:'2px 7px', borderRadius:10, fontWeight:700 }}>{quizzes.length}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding:'12px 14px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={logout} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            style={{ width:'100%', padding:'9px 0', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:10, background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>

        {/* ── DASHBOARD ───────────────────────────── */}
        {tab === 'dashboard' && (
          <div style={{ animation:'fadeUp 0.4s ease forwards' }}>

            {/* Header */}
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:800, color:'#0f1535', marginBottom:4 }}>
                Welcome back, {user.name?.split(' ')[0]} 👋
              </h2>
              <p style={{ color:'#5a6490', fontSize:14 }}>
                {yearLabel} · {YEAR_SUBJECTS[user.year]?.length||0} subjects · Your learning overview
              </p>
            </div>

            {/* Top stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:24 }}>
              {/* Materials donut */}
              <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:20, padding:'20px', boxShadow:'0 4px 20px rgba(45,79,234,0.08)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#2d4fea,#6b8aff)' }}/>
                <div style={{ fontSize:11, fontWeight:700, color:'#8899bb', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>📚 Materials</div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <DonutChart pct={pct} color="#2d4fea" size={72} sw={8}/>
                  <div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:22, fontWeight:800, color:'#0f1535', lineHeight:1 }}>{completedCount}/{materials.length}</div>
                    <div style={{ fontSize:11, color:'#8899bb', marginTop:4 }}>Completed</div>
                    <div style={{ fontSize:10, color:'#b0bec5', marginTop:2 }}>{remaining} remaining</div>
                  </div>
                </div>
              </div>

              {/* Quizzes bar */}
              <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:20, padding:'20px', boxShadow:'0 4px 20px rgba(14,168,110,0.08)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#0ea86e,#4fd4a0)' }}/>
                <div style={{ fontSize:11, fontWeight:700, color:'#8899bb', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>✏️ Quizzes</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:26, fontWeight:800, color:'#0f1535', marginBottom:6 }}>{quizCount}</div>
                <MiniBar data={[{v:Math.max(1,quizCount-3),l:'W1'},{v:Math.max(1,quizCount-1),l:'W2'},{v:Math.max(2,quizCount),l:'W3'},{v:quizCount,l:'Now'}]} color="#0ea86e" height={50}/>
              </div>

              {/* Activity dots */}
              <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:20, padding:'20px', boxShadow:'0 4px 20px rgba(245,98,10,0.08)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#f5620a,#ff9a5c)' }}/>
                <div style={{ fontSize:11, fontWeight:700, color:'#8899bb', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>🔥 Activity</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:26, fontWeight:800, color:'#0f1535', marginBottom:8 }}>{completedCount+quizCount}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
                  {Array.from({length:28},(_,i)=>{
                    const active = i < (completedCount+quizCount)%28;
                    return <div key={i} style={{ aspectRatio:'1', borderRadius:3, background:active?'#f5620a':'#f0f4ff', opacity:active?0.4+(i/28)*0.6:0.3, transition:'all 0.3s' }}/>;
                  })}
                </div>
              </div>

              {/* Performance */}
              <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:20, padding:'20px', boxShadow:'0 4px 20px rgba(105,48,195,0.08)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#6930c3,#9b59f5)' }}/>
                <div style={{ fontSize:11, fontWeight:700, color:'#8899bb', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>⭐ Performance</div>
                {[
                  { label:'Materials', val:pct, color:'#2d4fea' },
                  { label:'Quizzes', val:Math.min(100,quizCount*14), color:'#0ea86e' },
                  { label:'Overall', val:Math.round((pct+Math.min(100,quizCount*14))/2), color:'#6930c3' },
                ].map(item=>(
                  <div key={item.label} style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                      <span style={{ color:'#8899bb', fontWeight:500 }}>{item.label}</span>
                      <span style={{ fontWeight:700, color:item.color }}>{item.val}%</span>
                    </div>
                    <div style={{ background:'#f0f4ff', borderRadius:4, height:6, overflow:'hidden' }}>
                      <div style={{ height:6, borderRadius:4, background:item.color, width:item.val+'%', transition:'width 1s ease' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Progress Section */}
            <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:22, padding:28, marginBottom:22, boxShadow:'0 6px 28px rgba(45,79,234,0.08)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-40, top:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,'+yearColor+'10 0%,transparent 70%)', pointerEvents:'none' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, position:'relative', zIndex:1 }}>
                <div>
                  <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:700, color:'#0f1535', marginBottom:4 }}>Overall Progress — {yearLabel}</h3>
                  <div style={{ fontSize:13, color:'#8899bb' }}>{completedCount} of {materials.length} materials · {quizCount} quizzes</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:38, fontWeight:800, color:pct>=70?'#0ea86e':pct>=40?yearColor:'#f5620a', lineHeight:1 }}>{pct}%</div>
                  <div style={{ fontSize:11, color:'#8899bb', marginTop:2 }}>completion</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ position:'relative', marginBottom:16 }}>
                <div style={{ background:'#f0f4ff', borderRadius:12, height:18, overflow:'hidden' }}>
                  <div style={{ height:18, borderRadius:12, width:pct+'%', transition:'width 1s ease', position:'relative', overflow:'hidden',
                    background:pct>=70?'linear-gradient(90deg,#0ea86e,#4fd4a0,#0ea86e)':pct>=40?'linear-gradient(90deg,'+yearColor+','+yearColor+'88,'+yearColor+')':'linear-gradient(90deg,#f5620a,#ff9a5c,#f5620a)', backgroundSize:'200% 100%' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation:'shimmer 2.5s linear infinite' }}/>
                    {pct>12&&<span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'rgba(255,255,255,0.9)', fontWeight:700 }}>{pct}%</span>}
                  </div>
                </div>
                {[25,50,75].map(m=>(
                  <div key={m} style={{ position:'absolute', left:m+'%', top:-4, transform:'translateX(-50%)' }}>
                    <div style={{ width:2, height:26, background:pct>=m?'rgba(255,255,255,0.6)':'rgba(0,0,0,0.1)', transition:'background 0.5s' }}/>
                    <div style={{ fontSize:9, color:pct>=m?'#0ea86e':'#b0bec5', fontWeight:700, marginTop:2 }}>{m}%</div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
                {[
                  { label:'Completed', value:completedCount, color:'#2d4fea', bg:'#eef1ff', border:'#bbc5f8' },
                  { label:'Remaining', value:remaining, color:'#f5620a', bg:'#fff4ee', border:'#fcd0b0' },
                  { label:'Quizzes', value:quizCount, color:'#0ea86e', bg:'#e8faf3', border:'#9ee8c8' },
                  { label:'Total', value:materials.length, color:'#6930c3', bg:'#f3eeff', border:'#c9a8f5' },
                ].map(s=>(
                  <div key={s.label} style={{ background:s.bg, border:'1px solid '+s.border, borderRadius:12, padding:'10px 14px', textAlign:'center' }}>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:10, color:'#8899bb', fontWeight:500, marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Learning breakdown */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#8899bb', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Learning Breakdown</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { label:'Materials Read', value:pct, icon:'📚', color:'#2d4fea', bg:'#eef1ff' },
                    { label:'Quiz Activity', value:Math.min(100,quizCount*14), icon:'✏️', color:'#0ea86e', bg:'#e8faf3' },
                    { label:'Consistency', value:Math.min(100,(completedCount+quizCount)*8), icon:'🔥', color:'#f5620a', bg:'#fff4ee' },
                    { label:'Overall Score', value:Math.round((pct+Math.min(100,quizCount*14))/2), icon:'⭐', color:'#6930c3', bg:'#f3eeff' },
                  ].map(item=>(
                    <div key={item.label} style={{ background:item.bg, borderRadius:12, padding:'12px 14px', border:'1px solid '+item.color+'22' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:14 }}>{item.icon}</span>
                          <span style={{ fontSize:11, fontWeight:600, color:'#5a6490' }}>{item.label}</span>
                        </div>
                        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, fontWeight:700, color:item.color }}>{item.value}%</span>
                      </div>
                      <div style={{ background:'rgba(255,255,255,0.6)', borderRadius:4, height:7, overflow:'hidden' }}>
                        <div style={{ height:7, borderRadius:4, background:item.color, width:item.value+'%', transition:'width 1s ease', opacity:0.85 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subjects for this year */}
            <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:20, padding:'22px 24px', marginBottom:20, boxShadow:'0 4px 16px rgba(45,79,234,0.06)' }}>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:'#0f1535', marginBottom:16 }}>
                📘 Your Subjects — {yearLabel}
              </h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {(YEAR_SUBJECTS[user.year]||[]).map((s,i)=>(
                  <span key={i} style={{ fontSize:12, background:yearColor+'10', border:'1.5px solid '+yearColor+'33', color:yearColor, padding:'5px 12px', borderRadius:20, fontWeight:600 }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Available quizzes */}
            {quizzes.length > 0 && (
              <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:20, padding:'22px 24px', boxShadow:'0 4px 16px rgba(45,79,234,0.06)' }}>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:'#0f1535', marginBottom:16 }}>Available Quizzes</h3>
                {quizzes.slice(0,3).map(q=>(
                  <div key={q._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f0f4ff' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:'#0f1535' }}>{q.title}</div>
                      <div style={{ fontSize:11, color:'#8899bb', marginTop:2 }}>{q.questions?.length} questions · {q.quizType||'paragraph'}</div>
                    </div>
                    <button onClick={()=>navigate('/quiz/'+q._id)}
                      style={{ padding:'8px 18px', background:'linear-gradient(135deg,'+yearColor+','+yearColor+'88)', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 10px '+yearColor+'33' }}>
                      Start →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MATERIALS ───────────────────────────── */}
        {tab === 'materials' && (
          <div style={{ animation:'fadeUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:'#0f1535', marginBottom:4 }}>Study Materials</h2>
              <p style={{ color:'#8899bb', fontSize:14 }}>{materials.length} materials for {yearLabel}</p>
            </div>
            {materials.length === 0 && (
              <div style={{ background:'#fff', borderRadius:16, padding:'48px 32px', textAlign:'center', border:'1px solid #e8eeff' }}>
                <div style={{ fontSize:52, marginBottom:14 }}>📭</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:'#0f1535', marginBottom:6 }}>No materials yet</div>
                <div style={{ fontSize:14, color:'#8899bb' }}>Your teacher will upload study materials soon</div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {materials.map(m=>(
                <div key={m._id} style={{ background:'#fff', border:'1px solid '+(isCompleted(m._id)?'#9ee8c8':'#e8eeff'), borderRadius:16, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 10px rgba(45,79,234,0.05)', transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 6px 20px rgba(45,79,234,0.1)'; e.currentTarget.style.transform='translateY(-1px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 10px rgba(45,79,234,0.05)'; e.currentTarget.style.transform='none';}}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, flex:1, minWidth:0 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:isCompleted(m._id)?'#e8faf3':'#eef1ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,border:'1.5px solid '+(isCompleted(m._id)?'#9ee8c8':'#bbc5f8') }}>
                      {m.fileType==='video'?'🎬':m.fileType==='pdf'?'📄':m.fileType==='link'?'🔗':'📝'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:14, color:'#0f1535', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {m.subject&&<span style={{ fontSize:11, background:yearColor+'12', color:yearColor, padding:'2px 8px', borderRadius:8, fontWeight:600, border:'1px solid '+yearColor+'33' }}>{m.subject}</span>}
                        {m.description&&<span style={{ fontSize:11, color:'#8899bb' }}>{m.description.slice(0,50)}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, marginLeft:12 }}>
                    {m.fileUrl&&<a href={m.fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding:'7px 14px', background:'#eef1ff', border:'1px solid #bbc5f8', borderRadius:10, color:'#2d4fea', fontSize:12, fontWeight:600, textDecoration:'none', transition:'all 0.15s' }}>Open →</a>}
                    {isCompleted(m._id)
                      ? <span style={{ fontSize:12, fontWeight:700, color:'#0ea86e', background:'#e8faf3', padding:'7px 14px', borderRadius:10, border:'1px solid #9ee8c8' }}>✓ Done</span>
                      : <button onClick={()=>markComplete(m._id)} style={{ padding:'7px 14px', background:'linear-gradient(135deg,#0ea86e,#4fd4a0)', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 10px rgba(14,168,110,0.3)', transition:'all 0.15s' }}>Mark Done</button>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZZES ─────────────────────────────── */}
        {tab === 'quizzes' && (
          <div style={{ animation:'fadeUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:'#0f1535', marginBottom:4 }}>Quizzes</h2>
              <p style={{ color:'#8899bb', fontSize:14 }}>{quizzes.length} quizzes available for {yearLabel}</p>
            </div>
            {quizzes.length === 0 && (
              <div style={{ background:'#fff', borderRadius:16, padding:'48px 32px', textAlign:'center', border:'1px solid #e8eeff' }}>
                <div style={{ fontSize:52, marginBottom:14 }}>📝</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:'#0f1535', marginBottom:6 }}>No quizzes yet</div>
                <div style={{ fontSize:14, color:'#8899bb' }}>Your teacher will create quizzes soon</div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {quizzes.map(q=>{
                const typeColors = { paragraph:'#2d4fea', video:'#f5620a', pdf:'#6930c3' };
                const tc = typeColors[q.quizType]||'#2d4fea';
                return (
                  <div key={q._id} style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:16, padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 10px rgba(45,79,234,0.05)', borderLeft:'4px solid '+tc, transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 6px 20px rgba(45,79,234,0.1)'; e.currentTarget.style.transform='translateX(4px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 10px rgba(45,79,234,0.05)'; e.currentTarget.style.transform='none';}}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:'#0f1535', marginBottom:5 }}>{q.title}</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontSize:11, background:tc+'12', color:tc, padding:'3px 10px', borderRadius:20, fontWeight:700, border:'1px solid '+tc+'33' }}>
                          {q.quizType==='video'?'🎬':q.quizType==='pdf'?'📄':'📖'} {q.quizType||'Paragraph'}
                        </span>
                        <span style={{ fontSize:11, background:'#f0f4ff', color:'#5a6490', padding:'3px 10px', borderRadius:20 }}>{q.questions?.length||0} questions</span>
                        {q.subject&&<span style={{ fontSize:11, background:yearColor+'12', color:yearColor, padding:'3px 10px', borderRadius:20, fontWeight:600 }}>{q.subject}</span>}
                      </div>
                    </div>
                    <button onClick={()=>navigate('/quiz/'+q._id)}
                      style={{ padding:'10px 22px', background:'linear-gradient(135deg,'+tc+','+tc+'99)', border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px '+tc+'33', transition:'all 0.2s', flexShrink:0, marginLeft:12 }}>
                      Start Quiz →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PROGRESS ────────────────────────────── */}
        {tab === 'progress' && (
          <div style={{ animation:'fadeUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:'#0f1535', marginBottom:4 }}>My Progress</h2>
              <p style={{ color:'#8899bb', fontSize:14 }}>Detailed view of your learning journey</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'Completion', value:pct, color:'#2d4fea', icon:'📚', bg:'#eef1ff' },
                { label:'Quiz Activity', value:Math.min(100,quizCount*14), color:'#0ea86e', icon:'✏️', bg:'#e8faf3' },
                { label:'Overall Score', value:Math.round((pct+Math.min(100,quizCount*14))/2), color:'#6930c3', icon:'⭐', bg:'#f3eeff' },
              ].map(item=>(
                <div key={item.label} style={{ background:'#fff', border:'1px solid '+item.color+'22', borderRadius:20, padding:'24px 20px', textAlign:'center', boxShadow:'0 4px 16px '+item.color+'12' }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
                  <DonutChart pct={item.value} color={item.color} size={100} sw={10}/>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0f1535', marginTop:10 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', border:'1px solid #e8eeff', borderRadius:20, padding:24, boxShadow:'0 4px 16px rgba(45,79,234,0.06)' }}>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", marginBottom:16 }}>Material Completion</h3>
              {materials.length === 0 && <div style={{ color:'#8899bb', fontSize:13 }}>No materials yet.</div>}
              {materials.map(m=>(
                <div key={m._id} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:'#0f1535' }}>{m.title}</span>
                    <span style={{ fontSize:12, color:isCompleted(m._id)?'#0ea86e':'#b0bec5', fontWeight:700 }}>{isCompleted(m._id)?'✓ 100%':'0%'}</span>
                  </div>
                  <div style={{ background:'#f0f4ff', borderRadius:4, height:7, overflow:'hidden' }}>
                    <div style={{ height:7, borderRadius:4, background:'linear-gradient(90deg,#2d4fea,#6b8aff)', width:isCompleted(m._id)?'100%':'0%', transition:'width 0.8s ease' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE ────────────────────────────── */}
        {tab === 'timeline' && (
          <div style={{ animation:'fadeUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:'#0f1535', marginBottom:4 }}>My Progress Timeline 📈</h2>
              <p style={{ color:'#8899bb', fontSize:14 }}>Your complete learning journey from day one</p>
            </div>
            <StudentProgress isAdmin={false} />
          </div>
        )}

        {/* ── AI TEACHER ──────────────────────────── */}
        {tab === 'aiteacher' && (
          <div style={{ animation:'fadeUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:'#0f1535', marginBottom:4 }}>AI Teacher 🤖</h2>
              <p style={{ color:'#8899bb', fontSize:14 }}>Ask anything about your {yearLabel} subjects — get simple, clear explanations instantly</p>
            </div>
            <AITeacher userYear={user.year} />
          </div>
        )}

      </div>
    </div>
  );
}