import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, BrainCircuit, RefreshCw, Trophy, ArrowRight, Target } from 'lucide-react';

const ALL_QUESTIONS = [
  // Logic & Math
  { id: 1, category: 'Logical Reasoning', question: 'Find the next number in the series: 3, 6, 11, 18, 27, ?', options: ['34', '36', '38', '40'], correct: 2 },
  { id: 2, category: 'Quantitative Aptitude', question: 'If A can do a work in 10 days and B can do it in 15 days, how long will they take if they work together?', options: ['5 days', '6 days', '8 days', '12 days'], correct: 1 },
  { id: 6, category: 'Logical Reasoning', question: 'If A is the brother of B, B is the sister of C, and C is the father of D, how is D related to A?', options: ['Nephew/Niece', 'Cousin', 'Uncle', 'Brother'], correct: 0 },
  { id: 7, category: 'Quantitative Aptitude', question: 'The sum of ages of 5 children born at intervals of 3 years each is 50 years. What is the age of the youngest child?', options: ['4 years', '8 years', '10 years', 'None of these'], correct: 0 },
  { id: 11, category: 'Logical Reasoning', question: 'Which word does not belong with the others?', options: ['Tulip', 'Rose', 'Bud', 'Daisy'], correct: 2 },
  { id: 12, category: 'Quantitative Aptitude', question: 'A train 125 m long passes a man, running at 5 km/hr in the same direction, in 10 seconds. What is the speed of the train?', options: ['45 km/hr', '50 km/hr', '54 km/hr', '55 km/hr'], correct: 1 },
  { id: 16, category: 'Quantitative Aptitude', question: 'What is the probability of getting a sum of 9 from two throws of a dice?', options: ['1/6', '1/8', '1/9', '1/12'], correct: 2 },
  { id: 17, category: 'Logical Reasoning', question: 'Pointing to a photograph of a boy Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?', options: ['Brother', 'Uncle', 'Cousin', 'Father'], correct: 3 },
  { id: 18, category: 'Verbal Ability', question: 'Choose the correct synonym for "Benevolent":', options: ['Cruel', 'Friendly', 'Generous', 'Strict'], correct: 2 },
  { id: 19, category: 'Verbal Ability', question: 'Choose the correct antonym for "Obscure":', options: ['Clear', 'Hidden', 'Dark', 'Unknown'], correct: 0 },

  // Programming & CS Fundamentals
  { id: 3, category: 'Technical - Databases', question: 'Which SQL keyword is used to sort the result-set?', options: ['ORDER BY', 'SORT BY', 'GROUP BY', 'ORDER'], correct: 0 },
  { id: 4, category: 'Technical - Data Structures', question: 'Which data structure follows the Last-In-First-Out (LIFO) principle?', options: ['Queue', 'Tree', 'Stack', 'Linked List'], correct: 2 },
  { id: 5, category: 'Technical - Web Development', question: 'Which HTTP status code signifies that the requested resource was not found?', options: ['200 OK', '403 Forbidden', '404 Not Found', '500 Internal Error'], correct: 2 },
  { id: 8, category: 'Technical - Networking', question: 'Which layer of the OSI model does a router operate at?', options: ['Physical', 'Data Link', 'Network', 'Transport'], correct: 2 },
  { id: 9, category: 'Technical - Algorithms', question: 'What is the worst-case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correct: 2 },
  { id: 10, category: 'Technical - Programming', question: 'Which OOP concept restricts direct access to some components?', options: ['Polymorphism', 'Inheritance', 'Encapsulation', 'Abstraction'], correct: 2 },
  { id: 13, category: 'Technical - Databases', question: 'Which property ensures transactions are saved permanently even if the system crashes?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correct: 3 },
  { id: 14, category: 'Technical - Web', question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], correct: 0 },
  { id: 15, category: 'Technical - Software Engineering', question: 'Which phase of the SDLC involves creating the architecture of the system?', options: ['Planning', 'Design', 'Implementation', 'Testing'], correct: 1 },
  { id: 20, category: 'Technical - Data Structures', question: 'In a binary search tree, which traversal visits nodes in ascending order?', options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], correct: 1 },
  { id: 21, category: 'Technical - Operating Systems', question: 'What is a context switch?', options: ['Switching users', 'Saving state to switch CPU processes', 'Switching network protocols', 'A hardware failure'], correct: 1 },
  
  // Advanced AI & Big Data
  { id: 22, category: 'Technical - Machine Learning', question: 'Which algorithm is commonly used for classifying images?', options: ['Linear Regression', 'CNN', 'K-Means', 'Decision Tree'], correct: 1 },
  { id: 23, category: 'Technical - Machine Learning', question: 'What does "Overfitting" mean in ML?', options: ['Model learns noise instead of signal', 'Model is too simple', 'Model requires more data', 'Model trains too fast'], correct: 0 },
  { id: 24, category: 'Technical - Big Data', question: 'Which framework is fundamentally known for distributed storage and MapReduce processing?', options: ['MongoDB', 'Hadoop', 'Cassandra', 'Spark'], correct: 1 },
  { id: 25, category: 'Technical - AI', question: 'What does NLP stand for in Artificial Intelligence?', options: ['Natural Language Processing', 'Neural Logic Programming', 'Network Layer Protocol', 'Node Learning Pattern'], correct: 0 },
  { id: 26, category: 'Technical - Python', question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '9', 'Error'], correct: 1 },
  { id: 27, category: 'Technical - Python', question: 'Which keyword is used to handle exceptions in Python?', options: ['catch', 'except', 'throw', 'finally'], correct: 1 },
  { id: 28, category: 'Technical - JavaScript', question: 'Which keyword is used to declare a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'], correct: 2 },
  { id: 29, category: 'Technical - DevOps', question: 'Which tool is primarily used for organizing containers into clusters?', options: ['Jenkins', 'Docker Compose', 'Kubernetes', 'Ansible'], correct: 2 },
  { id: 30, category: 'Technical - Git', question: 'Which Git command merges a branch into your current branch?', options: ['git fetch', 'git clone', 'git merge', 'git push'], correct: 2 }
];

const getRandomQuestions = (num) => {
  const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const AptitudeTest = () => {
  const navigate = useNavigate();
  const [testQuestions, setTestQuestions] = useState(() => getRandomQuestions(5));
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const activeQuestion = testQuestions[currentQ];

  const handleSelectOption = (idx) => {
    setAnswers({ ...answers, [currentQ]: idx });
  };

  const handleNext = () => {
    if (currentQ < testQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    testQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score += 20; // 5 questions total
    });
    // Save to local storage to sync with Dashboard
    localStorage.setItem('aptitudeScore', score.toString());
    return score;
  };

  // Persists the aptitude score to the backend so the Dashboard can
  // auto-populate it from the database on next visit.
  const persistScoreToDB = async (score) => {
    try {
      const stored = JSON.parse(localStorage.getItem('aiCampusUser'));
      if (!stored?.id) return;

      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      await axios.post(`${API_BASE}/assessments`, {
        user_id: stored.id,
        aptitude: score,
        // Pass current best-guess values so the assessment record is complete
        cgpa: stored.cgpa || 7.0,
        programming: score,   // aptitude test covers programming logic
        technical: score,
        communication: 70,
        projects: 0,
        internships: 0,
        certifications: 0,
      });
    } catch (err) {
      console.warn('Could not persist aptitude score to DB:', err);
    }
  };

  const resetTest = () => {
    setTestQuestions(getRandomQuestions(5));
    setCurrentQ(0);
    setAnswers({});
    setIsFinished(false);
  };

  const score = calculateScore();

  // Persist to DB once when the test is finished (score won't change after this)
  React.useEffect(() => {
    if (isFinished) {
      persistScoreToDB(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      {/* Hero Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-6 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-sky-600 rounded-2xl shadow-lg shadow-sky-100 dark:shadow-none">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-light-text-primary dark:text-white tracking-tight">Readiness Assessment</h1>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium mt-0.5 uppercase tracking-tighter">Neuro-Aptitude & Technical Proficiency Engine</p>
            </div>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="card-3d relative overflow-hidden shadow-premium dark:shadow-premium-dark">
          {/* Progress Bar */}
          <div className="w-full bg-light-elevated dark:bg-dark-elevated h-1.5">
            <div 
              className="bg-sky-600 h-1.5 transition-all duration-500 ease-out shadow-glow-sky"
              style={{ width: `${((currentQ) / testQuestions.length) * 100}%` }}
            />
          </div>
          <div className="p-8">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/10">
                  Assessment Phase {currentQ + 1} / {testQuestions.length}
                </span>
                <span className="ml-3 text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest">
                  // {activeQuestion.category}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-light-text-primary dark:text-white mb-8 tracking-tight leading-[1.3]">
              {activeQuestion.question}
            </h2>

            <div className="space-y-4">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQ] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group h-20 ${
                      isSelected 
                        ? 'border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-100 dark:shadow-none' 
                        : 'border-light-border dark:border-white/[0.05] bg-light-elevated/30 dark:bg-white/[0.02] text-light-text-primary dark:text-dark-text-primary hover:border-sky-500/50'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-tight">{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white' : 'border-light-border dark:border-white/10 group-hover:border-sky-500/50'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-sky-600 rounded-full animate-pulse-slow"></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={handleNext}
                disabled={answers[currentQ] === undefined}
                className={`px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${
                  answers[currentQ] !== undefined
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-100 dark:shadow-none hover:-translate-y-0.5 active:scale-95'
                    : 'bg-light-elevated dark:bg-dark-elevated text-light-text-muted dark:text-dark-text-muted cursor-not-allowed'
                }`}
              >
                {currentQ < testQuestions.length - 1 ? 'Analyze Next' : 'Submit Matrix'} 
                {currentQ < testQuestions.length - 1 ? <ArrowRight className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="card-3d relative overflow-hidden shadow-premium dark:shadow-premium-dark">
          <div className="h-48 w-full bg-sky-600 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent_70%)]" />
            <Trophy className="w-24 h-24 text-white drop-shadow-2xl z-10 animate-fade-in" />
          </div>
          
          <div className="p-10 flex flex-col items-center text-center -mt-12 relative z-10">
            <div className={`w-36 h-36 rounded-3xl flex flex-col items-center justify-center border-4 shadow-2xl bg-white dark:bg-dark-surface ${
              score >= 80 ? 'text-emerald-600 border-emerald-500 shadow-emerald-100' : score >= 60 ? 'text-amber-600 border-amber-500 shadow-amber-100' : 'text-rose-600 border-rose-500 shadow-rose-100'
            }`}>
              <span className="text-4xl font-black">{score}%</span>
              <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">Readiness</span>
            </div>
            
            <h2 className="text-3xl font-black text-light-text-primary dark:text-white mt-8 tracking-tight">
              {score >= 80 ? 'Elite Performance' : score >= 60 ? 'Domain Qualified' : 'Development Required'}
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-4 max-w-lg mx-auto text-sm font-bold leading-relaxed">
              {score >= 80 
                ? "Neural analysis confirms peak readiness. Your grasp of logic and technical architecture puts you in the top 5% of applicants."
                : score >= 60
                ? "Assessment successful. You maintain a strong foundation for placement. Minor calibration in technical depth recommended."
                : "Initial readiness signature detected. Focused synchronization with growth paths required to optimize for top-tier hiring."}
            </p>

            <div className="mt-12 flex gap-4 w-full sm:w-auto">
              <button 
                onClick={resetTest}
                className="flex-1 sm:flex-none px-8 py-4 bg-light-elevated hover:bg-light-base text-light-text-primary dark:bg-white/5 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-light-border dark:border-white/10"
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Recalibrate
                </div>
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 sm:flex-none px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-sky-100 dark:shadow-none hover:-translate-y-0.5 duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  Analytics <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeTest;


