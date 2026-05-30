"""Seed database with sample data.

Usage:
    cd backend
    python -m app.seed

Creates:
    - 1 admin user (admin@edupath.com / password123)
    - 1 instructor user (instructor@edupath.com / password123)
    - 1 student user (student@edupath.com / password123)
    - 2 courses with 3 modules each
    - 2-3 lessons per module with rich content
"""
import uuid
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.models.user import User
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson


def seed():
    engine = create_engine(settings.database_url)

    with Session(engine) as db:
        # Check if data already exists
        existing = db.scalar(select(User).limit(1))
        if existing:
            print("Database already seeded. Skipping.")
            return

        # --- Users ---
        admin = User(
            id=uuid.uuid4(),
            email="admin@edupath.com",
            name="Admin User",
            role="admin",
            password_hash=hash_password("password123"),
        )
        instructor = User(
            id=uuid.uuid4(),
            email="instructor@edupath.com",
            name="Dr. Sarah Chen",
            role="instructor",
            password_hash=hash_password("password123"),
        )
        student = User(
            id=uuid.uuid4(),
            email="student@edupath.com",
            name="Alex Johnson",
            role="student",
            password_hash=hash_password("password123"),
        )
        db.add_all([admin, instructor, student])
        db.flush()

        # --- Course 1: Introduction to Machine Learning ---
        course1 = Course(
            id=uuid.uuid4(),
            title="Introduction to Machine Learning",
            description="Learn the fundamentals of machine learning, from linear regression to neural networks. Perfect for beginners with basic Python knowledge.",
            instructor_id=instructor.id,
        )
        db.add(course1)
        db.flush()

        # Module 1.1
        mod1_1 = Module(
            id=uuid.uuid4(), course_id=course1.id,
            title="What is Machine Learning?",
            description="Understanding the basics and types of ML",
            position=0,
        )
        db.add(mod1_1)
        db.flush()

        lessons_mod1_1 = [
            Lesson(module_id=mod1_1.id, title="Definition and History", position=0,
                   content="Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. The concept dates back to the 1950s when Alan Turing proposed the idea of machines that could learn from examples.\n\nThe term 'machine learning' was coined by Arthur Samuel in 1959. Since then, the field has evolved dramatically, driven by increases in computational power and the availability of large datasets.\n\nKey milestones include the development of neural networks in the 1980s, support vector machines in the 1990s, and the deep learning revolution starting in 2012 with AlexNet winning the ImageNet competition."),
            Lesson(module_id=mod1_1.id, title="Types of Machine Learning", position=1,
                   content="Machine learning can be broadly categorized into three types:\n\n1. Supervised Learning: The model learns from labeled training data. Examples include classification (spam detection, image recognition) and regression (price prediction, temperature forecasting).\n\n2. Unsupervised Learning: The model finds patterns in unlabeled data. Examples include clustering (customer segmentation, anomaly detection) and dimensionality reduction (PCA, t-SNE).\n\n3. Reinforcement Learning: The model learns by interacting with an environment and receiving rewards or penalties. Examples include game playing (AlphaGo), robotics, and autonomous vehicles.\n\nEach type has its own algorithms, use cases, and evaluation metrics. Understanding when to apply each type is fundamental to machine learning practice."),
            Lesson(module_id=mod1_1.id, title="Real-World Applications", position=2,
                   content="Machine learning is transforming industries across the globe:\n\nHealthcare: Disease diagnosis from medical images, drug discovery, personalized treatment plans, and predictive patient outcomes.\n\nFinance: Fraud detection, algorithmic trading, credit scoring, and risk assessment.\n\nTechnology: Recommendation systems (Netflix, Spotify), search engines, voice assistants (Siri, Alexa), and autonomous vehicles.\n\nRetail: Customer segmentation, demand forecasting, dynamic pricing, and inventory management.\n\nManufacturing: Predictive maintenance, quality control, supply chain optimization, and robotics.\n\nUnderstanding these applications helps motivate the study of ML fundamentals and shows the real impact of these techniques."),
        ]
        db.add_all(lessons_mod1_1)

        # Module 1.2
        mod1_2 = Module(
            id=uuid.uuid4(), course_id=course1.id,
            title="Linear Regression",
            description="Your first ML algorithm",
            position=1,
        )
        db.add(mod1_2)
        db.flush()

        lessons_mod1_2 = [
            Lesson(module_id=mod1_2.id, title="The Linear Model", position=0,
                   content="Linear regression is one of the simplest and most widely used statistical learning methods. It models the relationship between a dependent variable and one or more independent variables.\n\nThe basic equation is: y = mx + b (simple linear regression) or y = b0 + b1*x1 + b2*x2 + ... + bn*xn (multiple linear regression).\n\nWhere:\n- y is the predicted output\n- x represents the input features\n- m or b1...bn are the coefficients (weights)\n- b or b0 is the intercept (bias)\n\nThe goal is to find the values of these coefficients that minimize the difference between predicted and actual values."),
            Lesson(module_id=mod1_2.id, title="Cost Function and Optimization", position=1,
                   content="To evaluate how well our linear model fits the data, we use a cost function. The most common is Mean Squared Error (MSE):\n\nMSE = (1/n) * Σ(yi - ŷi)²\n\nWhere yi is the actual value and ŷi is the predicted value.\n\nGradient Descent is the algorithm used to minimize the cost function:\n1. Initialize parameters randomly\n2. Calculate the gradient (direction of steepest ascent)\n3. Update parameters in the opposite direction\n4. Repeat until convergence\n\nThe learning rate (α) controls how large each step is. Too small = slow convergence. Too large = overshooting the minimum.\n\nThis optimization process is fundamental to all of machine learning, not just linear regression."),
            Lesson(module_id=mod1_2.id, title="Evaluation Metrics", position=2,
                   content="After training a linear regression model, we need to evaluate its performance:\n\n1. R-squared (R²): Proportion of variance explained by the model. Range: 0 to 1. Higher is better.\n\n2. Mean Absolute Error (MAE): Average absolute difference between predictions and actuals. Easy to interpret.\n\n3. Root Mean Squared Error (RMSE): Square root of MSE. Penalizes large errors more than MAE.\n\n4. Residual Analysis: Plot residuals (actual - predicted) to check for patterns. Good residuals should be randomly distributed.\n\nAlways split your data into training and test sets to evaluate generalization. A model that performs well on training data but poorly on test data is overfitting."),
        ]
        db.add_all(lessons_mod1_2)

        # Module 1.3
        mod1_3 = Module(
            id=uuid.uuid4(), course_id=course1.id,
            title="Classification Algorithms",
            description="Decision trees, random forests, and more",
            position=2,
        )
        db.add(mod1_3)
        db.flush()

        lessons_mod1_3 = [
            Lesson(module_id=mod1_3.id, title="Logistic Regression", position=0,
                   content="Despite its name, logistic regression is a classification algorithm, not regression. It predicts the probability that an instance belongs to a particular class.\n\nThe sigmoid function maps any real number to a value between 0 and 1:\nσ(z) = 1 / (1 + e^(-z))\n\nWhere z = b0 + b1*x1 + ... + bn*xn\n\nIf σ(z) >= 0.5, predict class 1; otherwise, predict class 0.\n\nLogistic regression uses log-loss (cross-entropy) as its cost function and is excellent for binary classification problems. It's also interpretable - you can examine the coefficients to understand feature importance."),
            Lesson(module_id=mod1_3.id, title="Decision Trees", position=1,
                   content="Decision trees are intuitive models that make decisions by splitting data based on feature values.\n\nHow they work:\n1. Start with all data at the root node\n2. Select the best feature to split on (using Gini impurity or information gain)\n3. Create child nodes for each split\n4. Repeat recursively until stopping criteria are met\n\nAdvantages:\n- Easy to understand and visualize\n- No feature scaling needed\n- Handles both numerical and categorical data\n\nDisadvantages:\n- Prone to overfitting\n- Unstable (small data changes can create very different trees)\n- Can create biased trees if classes are imbalanced\n\nThis is why we often use ensembles of decision trees (random forests, gradient boosting)."),
            Lesson(module_id=mod1_3.id, title="Random Forests and Ensemble Methods", position=2,
                   content="Ensemble methods combine multiple models to improve performance:\n\nRandom Forest:\n- Builds many decision trees on random subsets of data and features\n- Each tree votes on the prediction\n- Final prediction is the majority vote (classification) or average (regression)\n- Reduces overfitting compared to single decision trees\n- Key parameter: n_estimators (number of trees)\n\nGradient Boosting:\n- Builds trees sequentially, each correcting errors of the previous\n- XGBoost, LightGBM, and CatBoost are popular implementations\n- Often achieves state-of-the-art performance on tabular data\n- Requires more careful tuning\n\nBagging vs Boosting:\n- Bagging: Parallel training, reduces variance (Random Forest)\n- Boosting: Sequential training, reduces bias (XGBoost)"),
        ]
        db.add_all(lessons_mod1_3)

        # --- Course 2: Web Development with React ---
        course2 = Course(
            id=uuid.uuid4(),
            title="Web Development with React",
            description="Build modern, interactive web applications with React. From components to state management, master the most popular frontend library.",
            instructor_id=instructor.id,
        )
        db.add(course2)
        db.flush()

        # Module 2.1
        mod2_1 = Module(
            id=uuid.uuid4(), course_id=course2.id,
            title="React Fundamentals",
            description="Components, JSX, and the virtual DOM",
            position=0,
        )
        db.add(mod2_1)
        db.flush()

        lessons_mod2_1 = [
            Lesson(module_id=mod2_1.id, title="What is React?", position=0,
                   content="React is a JavaScript library for building user interfaces, developed by Meta (Facebook). It's the most widely used frontend library in the world.\n\nKey concepts:\n- Component-based architecture: UI is built from reusable, independent components\n- Declarative: You describe what the UI should look like, React handles the updates\n- Virtual DOM: React maintains a lightweight copy of the DOM for efficient updates\n- JSX: A syntax extension that allows writing HTML-like code in JavaScript\n\nReact's philosophy is 'learn once, write anywhere' - the same patterns apply to web, mobile (React Native), and even desktop (Electron) applications.\n\nWhy React?\n- Massive ecosystem and community\n- Excellent developer tools\n- Strong job market\n- Used by Netflix, Instagram, WhatsApp, and thousands more"),
            Lesson(module_id=mod2_1.id, title="Components and JSX", position=1,
                   content="Components are the building blocks of a React application. There are two types:\n\n1. Function Components (modern, preferred):\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}</h1>;\n}\n\n2. Class Components (legacy):\nclass Welcome extends React.Component {\n  render() {\n    return <h1>Hello, {this.props.name}</h1>;\n  }\n}\n\nJSX Rules:\n- Must return a single root element (use fragments <>...</> for multiple)\n- JavaScript expressions go in curly braces: {expression}\n- className instead of class\n- camelCase for HTML attributes: onClick, onChange, etc.\n- Self-closing tags for empty elements: <img />, <br />\n\nComponents can be composed together to build complex UIs from simple, reusable pieces."),
            Lesson(module_id=mod2_1.id, title="Props and State", position=2,
                   content="Props (Properties):\n- Read-only data passed from parent to child\n- Used to configure components\n- Cannot be modified by the child component\n- Destructure in function parameters: function Card({ title, children })\n\nState:\n- Mutable data managed within a component\n- Triggers re-render when updated\n- Use useState hook: const [count, setCount] = useState(0);\n- Always use the setter function, never modify state directly\n\nThe Flow:\n- Props flow down (parent to child)\n- Events flow up (child to parent via callback functions)\n- This unidirectional data flow makes apps predictable and easier to debug\n\nLifting State Up:\nWhen multiple components need to share state, move it to their closest common ancestor."),
        ]
        db.add_all(lessons_mod2_1)

        # Module 2.2
        mod2_2 = Module(
            id=uuid.uuid4(), course_id=course2.id,
            title="Hooks and State Management",
            description="Modern React patterns with hooks",
            position=1,
        )
        db.add(mod2_2)
        db.flush()

        lessons_mod2_2 = [
            Lesson(module_id=mod2_2.id, title="useState and useEffect", position=0,
                   content="useState Hook:\nconst [state, setState] = useState(initialValue);\n- Returns current state and setter function\n- Initial value is only used on first render\n- Setting state with same value skips re-render\n- Functional updates: setState(prev => prev + 1)\n\nuseEffect Hook:\nuseEffect(() => {\n  // Side effect here\n  return () => cleanup(); // optional cleanup\n}, [dependencies]);\n\n- Runs after render\n- Empty deps []: runs once on mount\n- With deps [a, b]: runs when a or b change\n- No deps: runs after every render\n- Cleanup function runs before unmount or re-run\n\nCommon use cases:\n- Fetching data on mount\n- Setting up subscriptions\n- Document title updates\n- Timer management\n\nRules of Hooks:\n1. Only call hooks at the top level\n2. Only call hooks from React functions"),
            Lesson(module_id=mod2_2.id, title="useContext and useReducer", position=1,
                   content="useContext:\nconst value = useContext(MyContext);\n- Consumes a context value created with createContext\n- Avoids prop drilling through many levels\n- Re-renders when the context value changes\n\nuseReducer:\nconst [state, dispatch] = useReducer(reducer, initialState);\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 };\n    default: throw new Error();\n  }\n}\n\n- Alternative to useState for complex state logic\n- Similar to Redux reducer pattern\n- dispatch is stable (won't cause re-renders)\n- Can be combined with useContext for global state\n\nWhen to use useReducer:\n- Multiple related state values\n- Complex state transitions\n- State logic that needs to be extracted\n- Testing state logic independently"),
            Lesson(module_id=mod2_2.id, title="Custom Hooks", position=2,
                   content="Custom hooks are functions that encapsulate reusable stateful logic:\n\nfunction useCounter(initialValue = 0) {\n  const [count, setCount] = useState(initialValue);\n  const increment = () => setCount(c => c + 1);\n  const decrement = () => setCount(c => c - 1);\n  const reset = () => setCount(initialValue);\n  return { count, increment, decrement, reset };\n}\n\n// Usage:\nfunction Counter() {\n  const { count, increment, decrement } = useCounter(0);\n  return <button onClick={increment}>{count}</button>;\n}\n\nRules:\n- Name must start with 'use'\n- Can call other hooks inside\n- Each component gets its own state\n- Extract, don't duplicate logic\n\nCommon custom hooks:\n- useFetch: Data fetching with loading/error states\n- useDebounce: Debounced input values\n- useLocalStorage: Persistent state\n- useMediaQuery: Responsive design"),
        ]
        db.add_all(lessons_mod2_2)

        # Module 2.3
        mod2_3 = Module(
            id=uuid.uuid4(), course_id=course2.id,
            title="Routing and Data Fetching",
            description="Navigation and API integration",
            position=2,
        )
        db.add(mod2_3)
        db.flush()

        lessons_mod2_3 = [
            Lesson(module_id=mod2_3.id, title="React Router", position=0,
                   content='React Router enables navigation in React applications:\n\nBasic Setup:\nimport { BrowserRouter, Routes, Route, Link } from "react-router-dom";\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <nav><Link to="/">Home</Link> <Link to="/about">About</Link></nav>\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="/about" element={<About />} />\n        <Route path="/users/:id" element={<UserProfile />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n\nKey Features:\n- Nested routes for layout composition\n- Dynamic segments (:id) for parameterized URLs\n- useNavigate() for programmatic navigation\n- useParams() to access URL parameters\n- useSearchParams() for query strings\n- Protected routes with wrapper components\n\nBest Practices:\n- Lazy-load routes with React.lazy()\n- Use layout routes for shared UI\n- Keep routes in a central configuration'),
            Lesson(module_id=mod2_3.id, title="Data Fetching Patterns", position=1,
                   content='Modern data fetching in React:\n\n1. useEffect + fetch (basic):\nuseEffect(() => {\n  setLoading(true);\n  fetch("/api/data")\n    .then(res => res.json())\n    .then(data => setData(data))\n    .catch(err => setError(err))\n    .finally(() => setLoading(false));\n}, []);\n\n2. React Query / TanStack Query (recommended):\nconst { data, isLoading, error } = useQuery({\n  queryKey: ["todos"],\n  queryFn: () => fetch("/api/todos").then(r => r.json()),\n});\n\nBenefits: caching, background refetching, optimistic updates, pagination support\n\n3. SWR (simpler alternative):\nconst { data, error } = useSWR("/api/data", fetcher);\n\nBest Practices:\n- Show loading and error states\n- Use AbortController for cleanup\n- Implement retry logic\n- Cache and invalidate intelligently'),
        ]
        db.add_all(lessons_mod2_3)

        db.commit()
        print("Database seeded successfully!")
        print("\nTest accounts:")
        print("  Admin:      admin@edupath.com / password123")
        print("  Instructor: instructor@edupath.com / password123")
        print("  Student:    student@edupath.com / password123")


if __name__ == "__main__":
    seed()
