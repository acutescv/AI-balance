/**
 * AI Balance - Web Version
 * Empty knowledge base with user-defined subjects
 */

// ==================== DATA MANAGEMENT ====================

class UserData {
    constructor() {
        this.loadFromStorage();
    }

    loadFromStorage() {
        const data = localStorage.getItem('aibalance_user');
        if (data) {
            const parsed = JSON.parse(data);
            this.username = parsed.username || '';
            this.grade = parsed.grade || '';
            this.points = parsed.points || 0;
            this.badges = parsed.badges || [];
            this.subjects = parsed.subjects || [];
            this.searches = parsed.searches || [];
            this.answers = parsed.answers || {};
            this.reflections = parsed.reflections || [];
            this.assessmentHistory = parsed.assessmentHistory || [];
            this.reflectionScore = parsed.reflectionScore || 0;
        } else {
            this.username = '';
            this.grade = '';
            this.points = 0;
            this.badges = [];
            this.subjects = [];
            this.searches = [];
            this.answers = {};
            this.reflections = [];
            this.assessmentHistory = [];
            this.reflectionScore = 0;
        }
    }

    saveToStorage() {
        const data = {
            username: this.username,
            grade: this.grade,
            points: this.points,
            badges: this.badges,
            subjects: this.subjects,
            searches: this.searches.slice(-50), // Keep last 50
            answers: this.answers,
            reflections: this.reflections.slice(-100), // Keep last 100
            assessmentHistory: this.assessmentHistory.slice(-10),
            reflectionScore: this.reflectionScore
        };
        localStorage.setItem('aibalance_user', JSON.stringify(data));
    }

    addPoints(points) {
        this.points += points;
        this.checkBadges();
        this.saveToStorage();
        this.updatePointsDisplay();
        return this.points;
    }

    checkBadges() {
        // Independent Thinker - 3+ own answers
        if (Object.keys(this.answers).length >= 3 && !this.badges.includes('Independent Thinker')) {
            this.badges.push('Independent Thinker');
        }

        // Knowledge Seeker - 10+ searches
        if (this.searches.length >= 10 && !this.badges.includes('Knowledge Seeker')) {
            this.badges.push('Knowledge Seeker');
        }

        // Reflection Master - 5+ reflections
        if (this.reflections.length >= 5 && !this.badges.includes('Reflection Master')) {
            this.badges.push('Reflection Master');
        }

        // Subject Explorer - 3+ subjects
        if (this.subjects.length >= 3 && !this.badges.includes('Subject Explorer')) {
            this.badges.push('Subject Explorer');
        }

        // Balance Keeper - 100+ points
        if (this.points >= 100 && !this.badges.includes('Balance Keeper')) {
            this.badges.push('Balance Keeper');
        }
    }

    addSearch(subject, query, result) {
        this.searches.push({
            subject,
            query,
            result: result.substring(0, 100) + '...',
            timestamp: new Date().toISOString()
        });
        this.saveToStorage();
    }

    addAnswer(subject, query, answer) {
        const key = `${subject}:${query}`;
        this.answers[key] = {
            answer,
            timestamp: new Date().toISOString()
        };
        this.addPoints(5);
    }

    addReflection(subject, query, reflection) {
        this.reflections.push({
            subject,
            query,
            reflection,
            timestamp: new Date().toISOString()
        });
        // Calculate reflection score based on length
        const words = reflection.split(' ').length;
        this.reflectionScore += Math.floor(words / 5);
        this.addPoints(10);
    }

    addAssessmentResult(score, category) {
        this.assessmentHistory.push({
            score,
            category,
            timestamp: new Date().toISOString()
        });
        this.addPoints(Math.floor(score / 5));
    }

    updatePointsDisplay() {
        const pointsElements = document.querySelectorAll('#points, #total-points');
        pointsElements.forEach(el => {
            if (el) el.textContent = this.points;
        });
    }
}

// ==================== KNOWLEDGE FETCHER ====================

class KnowledgeFetcher {
    constructor() {
        // Local knowledge base for common topics
        this.localKnowledge = {
            math: {
                algebra: 'Algebra uses letters (like x and y) to represent numbers in equations.',
                geometry: 'Geometry studies shapes, sizes, and properties of space.',
                calculus: 'Calculus studies how things change continuously.',
                fractions: 'Fractions represent parts of a whole, like 1/2 or 3/4.',
                equations: 'Equations show that two expressions are equal, like 2x + 3 = 7.'
            },
            science: {
                physics: 'Physics studies matter, energy, and how they interact.',
                chemistry: 'Chemistry studies substances and their reactions.',
                biology: 'Biology studies living organisms and life processes.',
                cells: 'Cells are the basic building blocks of all living things.',
                gravity: 'Gravity is the force that pulls objects toward each other.'
            },
            history: {
                ancient: 'Ancient history covers early civilizations up to 500 CE.',
                medieval: 'Medieval history spans from 500 to 1500 CE.',
                modern: 'Modern history covers 1500 CE to the present.',
                ww2: 'World War II (1939-1945) was a global conflict.',
                renaissance: 'The Renaissance was a period of cultural rebirth in Europe.'
            },
            language: {
                grammar: 'Grammar is the set of rules for using a language.',
                vocabulary: 'Vocabulary is the collection of words in a language.',
                writing: 'Writing is the process of expressing ideas through text.',
                poetry: 'Poetry uses rhythmic and aesthetic qualities of language.'
            }
        };
    }

    fetch(subject, query) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                const queryLower = query.toLowerCase();
                const subjectLower = subject.toLowerCase();

                // Try to find in local knowledge
                for (let [subj, topics] of Object.entries(this.localKnowledge)) {
                    if (subjectLower.includes(subj) || subj.includes(subjectLower)) {
                        for (let [topic, info] of Object.entries(topics)) {
                            if (queryLower.includes(topic) || topic.includes(queryLower)) {
                                resolve({
                                    title: `${subject}: ${query}`,
                                    content: info,
                                    source: 'Local Knowledge Base',
                                    offline: true
                                });
                                return;
                            }
                        }
                    }
                }

                // If not found, provide learning guidance
                resolve({
                    title: `Learning: ${query}`,
                    content: this.generateGuidance(subject, query),
                    source: 'AI Balance Guide',
                    offline: true
                });
            }, 1000);
        });
    }

    generateGuidance(subject, query) {
        return `To learn about "${query}" in ${subject}:

📚 Recommended Steps:
1. Think about what you already know about this topic
2. Write down any questions you have
3. Break it down into smaller concepts
4. Try to explain it in your own words

🔍 Where to Find Information:
• Your textbooks and class notes
• Ask your teacher for recommendations
• Visit your school or local library
• Use educational websites like Khan Academy
• Search for educational videos on YouTube

💡 Learning Tips:
• Take notes while you learn
• Try to teach it to someone else
• Create examples of your own
• Connect it to things you already know
• Practice with exercises and problems

Remember: Learning is a journey. Take it one step at a time!`;
    }
}

// ==================== APP INITIALIZATION ====================

const userData = new UserData();
const fetcher = new KnowledgeFetcher();

// Screen manager
const screens = {
    welcome: document.getElementById('welcome-screen'),
    subjects: document.getElementById('subjects-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    thinkfirst: document.getElementById('thinkfirst-screen'),
    assessment: document.getElementById('assessment-screen'),
    progress: document.getElementById('progress-screen')
};

let currentScreen = 'welcome';

// Assessment state
let assessmentCurrent = 0;
let assessmentAnswers = [];
const assessmentQuestions = [
    "I try to solve problems myself before seeking help.",
    "I reflect on what I learn from information I find.",
    "I set limits on how much time I spend learning online.",
    "I verify information from multiple sources when possible.",
    "I take notes while learning new things.",
    "I ask questions when I don't understand something.",
    "I connect new information to what I already know."
];

// ==================== SCREEN MANAGEMENT ====================

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        currentScreen = screenName;
        
        // Refresh screen content
        switch(screenName) {
            case 'subjects':
                refreshSubjectsList();
                break;
            case 'dashboard':
                refreshDashboard();
                break;
            case 'thinkfirst':
                refreshThinkFirst();
                break;
            case 'progress':
                refreshProgress();
                break;
            case 'assessment':
                resetAssessment();
                break;
        }
    }
}

// ==================== WELCOME SCREEN ====================

const usernameInput = document.getElementById('username');
const gradeSelect = document.getElementById('grade-level');
const startBtn = document.getElementById('start-btn');

usernameInput.addEventListener('input', checkWelcomeInputs);
gradeSelect.addEventListener('change', checkWelcomeInputs);

function checkWelcomeInputs() {
    if (usernameInput.value.trim() && gradeSelect.value) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

startBtn.addEventListener('click', () => {
    userData.username = usernameInput.value.trim();
    userData.grade = gradeSelect.value;
    userData.saveToStorage();
    showScreen('subjects');
});

// ==================== SUBJECTS SCREEN ====================

const newSubjectInput = document.getElementById('new-subject');
const addSubjectBtn = document.getElementById('add-subject-btn');
const subjectsList = document.getElementById('subjects-list');
const continueDashboard = document.getElementById('continue-dashboard');

addSubjectBtn.addEventListener('click', addSubject);
newSubjectInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSubject();
});

function addSubject() {
    const subject = newSubjectInput.value.trim();
    if (!subject) {
        showMessage('Please enter a subject');
        return;
    }
    
    if (userData.subjects.includes(subject)) {
        showMessage('Subject already exists');
        return;
    }
    
    userData.subjects.push(subject);
    userData.saveToStorage();
    newSubjectInput.value = '';
    refreshSubjectsList();
}

function refreshSubjectsList() {
    subjectsList.innerHTML = '';
    
    if (userData.subjects.length === 0) {
        subjectsList.innerHTML = '<div class="empty-message">No subjects yet. Add your first subject above!</div>';
        continueDashboard.disabled = true;
        return;
    }
    
    userData.subjects.forEach(subject => {
        const item = document.createElement('div');
        item.className = 'subject-item';
        item.innerHTML = `
            <span>${subject}</span>
            <button onclick="removeSubject('${subject}')"><i class="fas fa-times"></i></button>
        `;
        subjectsList.appendChild(item);
    });
    
    continueDashboard.disabled = false;
}

window.removeSubject = (subject) => {
    userData.subjects = userData.subjects.filter(s => s !== subject);
    userData.saveToStorage();
    refreshSubjectsList();
};

continueDashboard.addEventListener('click', () => {
    if (userData.subjects.length > 0) {
        showScreen('dashboard');
    }
});

// ==================== DASHBOARD SCREEN ====================

function refreshDashboard() {
    document.getElementById('subject-count').textContent = userData.subjects.length;
    document.getElementById('search-count').textContent = userData.searches.length;
    document.getElementById('badge-count').textContent = userData.badges.length;
    userData.updatePointsDisplay();
    
    // Recent activity
    const activityList = document.getElementById('activity-list');
    if (userData.searches.length > 0) {
        const recent = userData.searches.slice(-3).reverse();
        activityList.innerHTML = recent.map(s => `
            <div class="activity-item">
                <small>${new Date(s.timestamp).toLocaleDateString()}</small>
                <p><strong>${s.subject}:</strong> ${s.query}</p>
            </div>
        `).join('');
    } else {
        activityList.innerHTML = '<p class="empty-message">No activity yet</p>';
    }
}

// Menu cards
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
        const screen = card.dataset.screen;
        if (screen) showScreen(screen);
    });
});

// ==================== THINK FIRST SCREEN ====================

const thinkSubject = document.getElementById('think-subject');
const thinkQuery = document.getElementById('think-query');
const userAnswer = document.getElementById('user-answer');
const submitAnswer = document.getElementById('submit-answer');
const searchInfo = document.getElementById('search-info');
const infoResult = document.getElementById('info-result');
const infoTitle = document.getElementById('info-title');
const infoContent = document.getElementById('info-content');
const infoSource = document.getElementById('info-source');

let lastQuery = '';
let lastSubject = '';

function refreshThinkFirst() {
    // Update subject dropdown
    thinkSubject.innerHTML = '<option value="">Select Subject</option>';
    userData.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        thinkSubject.appendChild(option);
    });
    
    // Clear inputs
    thinkQuery.value = '';
    userAnswer.value = '';
    infoResult.style.display = 'none';
}

submitAnswer.addEventListener('click', () => {
    const subject = thinkSubject.value;
    const query = thinkQuery.value.trim();
    const answer = userAnswer.value.trim();
    
    if (!subject) {
        showMessage('Please select a subject');
        return;
    }
    
    if (!query) {
        showMessage('Please enter a question');
        return;
    }
    
    if (!answer) {
        showMessage('Please write your answer first');
        return;
    }
    
    userData.addAnswer(subject, query, answer);
    showMessage(`✓ Answer saved! +5 points (Total: ${userData.points})`);
    userAnswer.value = '';
});

searchInfo.addEventListener('click', async () => {
    const subject = thinkSubject.value;
    const query = thinkQuery.value.trim();
    
    if (!subject) {
        showMessage('Please select a subject');
        return;
    }
    
    if (!query) {
        showMessage('Please enter a question');
        return;
    }
    
    lastSubject = subject;
    lastQuery = query;
    
    // Show loading
    searchInfo.disabled = true;
    searchInfo.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    
    // Fetch information
    const result = await fetcher.fetch(subject, query);
    
    // Display results
    infoTitle.textContent = result.title;
    infoContent.textContent = result.content;
    infoSource.textContent = `Source: ${result.source}`;
    infoResult.style.display = 'block';
    
    // Reset button
    searchInfo.disabled = false;
    searchInfo.innerHTML = '<i class="fas fa-search"></i> Get Information';
    
    // Save search
    userData.addSearch(subject, query, result.content);
    
    // Check if user submitted answer for this query
    const key = `${subject}:${query}`;
    if (userData.answers[key]) {
        // Show reflection modal
        showReflectionModal(subject, query);
    }
});

// ==================== REFLECTION MODAL ====================

const reflectionModal = document.getElementById('reflection-modal');
const reflectionText = document.getElementById('reflection-text');
const saveReflection = document.getElementById('save-reflection');
const skipReflection = document.getElementById('skip-reflection');

let currentReflectionSubject = '';
let currentReflectionQuery = '';

function showReflectionModal(subject, query) {
    currentReflectionSubject = subject;
    currentReflectionQuery = query;
    reflectionText.value = '';
    reflectionModal.classList.add('active');
}

saveReflection.addEventListener('click', () => {
    const reflection = reflectionText.value.trim();
    if (reflection) {
        userData.addReflection(currentReflectionSubject, currentReflectionQuery, reflection);
        showMessage(`✓ Reflection saved! +10 points (Total: ${userData.points})`);
    }
    reflectionModal.classList.remove('active');
});

skipReflection.addEventListener('click', () => {
    reflectionModal.classList.remove('active');
});

// ==================== ASSESSMENT SCREEN ====================

const questionNum = document.getElementById('question-num');
const questionText = document.getElementById('question-text');
const answersGrid = document.getElementById('answers-grid');
const resultsModal = document.getElementById('results-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const resultPoints = document.getElementById('result-points');
const closeResults = document.getElementById('close-results');

function resetAssessment() {
    assessmentCurrent = 0;
    assessmentAnswers = [];
    showQuestion(0);
}

function showQuestion(index) {
    questionNum.textContent = `${index + 1}/${assessmentQuestions.length}`;
    questionText.textContent = assessmentQuestions[index];
    
    const answers = ['Never', 'Sometimes', 'Often', 'Always'];
    answersGrid.innerHTML = '';
    
    answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(answer);
        answersGrid.appendChild(btn);
    });
}

function selectAnswer(answer) {
    assessmentAnswers.push(answer);
    
    if (assessmentCurrent < assessmentQuestions.length - 1) {
        assessmentCurrent++;
        showQuestion(assessmentCurrent);
    } else {
        calculateAssessmentResults();
    }
}

function calculateAssessmentResults() {
    const scoreMap = { 'Never': 1, 'Sometimes': 2, 'Often': 3, 'Always': 4 };
    const total = assessmentAnswers.reduce((sum, a) => sum +
