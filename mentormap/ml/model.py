import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

QUIZ_FEATURES = ['avg_score', 'avg_time_per_question', 'quiz_count', 'latest_score']
ACADEMIC_FEATURES = ['attendance', 'previous_grade', 'assignment_completion', 'study_hours',
                     'class_participation', 'homework_submission', 'attention_span',
                     'peer_interaction', 'behaviour_score']
ALL_FEATURES = QUIZ_FEATURES + ACADEMIC_FEATURES

def generate_quiz_training_data():
    np.random.seed(42)
    data, labels = [], []
    for _ in range(80):
        data.append([np.random.uniform(10,44), np.random.uniform(22,50), np.random.randint(1,6), np.random.uniform(10,48)])
        labels.append('slow')
    for _ in range(80):
        data.append([np.random.uniform(44,72), np.random.uniform(14,26), np.random.randint(3,12), np.random.uniform(42,74)])
        labels.append('average')
    for _ in range(80):
        data.append([np.random.uniform(72,100), np.random.uniform(4,16), np.random.randint(6,20), np.random.uniform(72,100)])
        labels.append('fast')
    return np.array(data), labels

def generate_full_training_data():
    np.random.seed(42)
    data, labels = [], []

    # Slow learners — low academic performance, poor behaviour
    for _ in range(120):
        row = [
            np.random.uniform(10,44),   # avg_score
            np.random.uniform(22,50),   # avg_time_per_question
            np.random.randint(1,6),     # quiz_count
            np.random.uniform(10,48),   # latest_score
            np.random.uniform(40,65),   # attendance
            np.random.uniform(30,55),   # previous_grade
            np.random.uniform(30,60),   # assignment_completion
            np.random.uniform(0.5,2.5), # study_hours
            np.random.uniform(20,50),   # class_participation
            np.random.uniform(30,60),   # homework_submission
            np.random.uniform(20,50),   # attention_span
            np.random.uniform(20,50),   # peer_interaction
            np.random.uniform(20,50),   # behaviour_score
        ]
        data.append(row)
        labels.append('slow')

    # Average learners — moderate performance
    for _ in range(120):
        row = [
            np.random.uniform(44,72),
            np.random.uniform(14,26),
            np.random.randint(3,12),
            np.random.uniform(42,74),
            np.random.uniform(65,80),
            np.random.uniform(55,72),
            np.random.uniform(60,78),
            np.random.uniform(2.5,4.5),
            np.random.uniform(50,70),
            np.random.uniform(60,78),
            np.random.uniform(50,70),
            np.random.uniform(50,70),
            np.random.uniform(50,70),
        ]
        data.append(row)
        labels.append('average')

    # Fast learners — high performance, great behaviour
    for _ in range(120):
        row = [
            np.random.uniform(72,100),
            np.random.uniform(4,16),
            np.random.randint(6,20),
            np.random.uniform(72,100),
            np.random.uniform(80,100),
            np.random.uniform(72,100),
            np.random.uniform(78,100),
            np.random.uniform(4.5,8),
            np.random.uniform(70,100),
            np.random.uniform(78,100),
            np.random.uniform(70,100),
            np.random.uniform(70,100),
            np.random.uniform(70,100),
        ]
        data.append(row)
        labels.append('fast')

    return np.array(data), labels

def train_models():
    os.makedirs(MODEL_DIR, exist_ok=True)

    # Train quiz-only model
    X_quiz, y_quiz = generate_quiz_training_data()
    scaler_quiz = StandardScaler()
    X_quiz_scaled = scaler_quiz.fit_transform(X_quiz)
    kmeans_quiz = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans_quiz.fit(X_quiz_scaled)
    rf_quiz = RandomForestClassifier(n_estimators=150, random_state=42, max_depth=10)
    rf_quiz.fit(X_quiz_scaled, y_quiz)
    lr_quiz = LogisticRegression(max_iter=1000, random_state=42)
    lr_quiz.fit(X_quiz_scaled, y_quiz)

    # Train full model with all 13 features
    X_full, y_full = generate_full_training_data()
    scaler_full = StandardScaler()
    X_full_scaled = scaler_full.fit_transform(X_full)
    kmeans_full = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans_full.fit(X_full_scaled)
    rf_full = RandomForestClassifier(n_estimators=200, random_state=42, max_depth=12)
    rf_full.fit(X_full_scaled, y_full)
    lr_full = LogisticRegression(max_iter=1000, random_state=42)
    lr_full.fit(X_full_scaled, y_full)

    joblib.dump(scaler_quiz, os.path.join(MODEL_DIR, 'scaler.pkl'))
    joblib.dump(kmeans_quiz, os.path.join(MODEL_DIR, 'kmeans.pkl'))
    joblib.dump(rf_quiz, os.path.join(MODEL_DIR, 'rf.pkl'))
    joblib.dump(lr_quiz, os.path.join(MODEL_DIR, 'lr.pkl'))
    joblib.dump(scaler_full, os.path.join(MODEL_DIR, 'scaler_full.pkl'))
    joblib.dump(kmeans_full, os.path.join(MODEL_DIR, 'kmeans_full.pkl'))
    joblib.dump(rf_full, os.path.join(MODEL_DIR, 'rf_full.pkl'))
    joblib.dump(lr_full, os.path.join(MODEL_DIR, 'lr_full.pkl'))
    print("All models trained and saved successfully.")
    return scaler_quiz, kmeans_quiz, rf_quiz, lr_quiz, scaler_full, kmeans_full, rf_full, lr_full

def load_models():
    paths = ['scaler.pkl','kmeans.pkl','rf.pkl','lr.pkl','scaler_full.pkl','kmeans_full.pkl','rf_full.pkl','lr_full.pkl']
    if not all(os.path.exists(os.path.join(MODEL_DIR, p)) for p in paths):
        print("Models not found, training now...")
        return train_models()
    scaler_quiz = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
    kmeans_quiz = joblib.load(os.path.join(MODEL_DIR, 'kmeans.pkl'))
    rf_quiz     = joblib.load(os.path.join(MODEL_DIR, 'rf.pkl'))
    lr_quiz     = joblib.load(os.path.join(MODEL_DIR, 'lr.pkl'))
    scaler_full = joblib.load(os.path.join(MODEL_DIR, 'scaler_full.pkl'))
    kmeans_full = joblib.load(os.path.join(MODEL_DIR, 'kmeans_full.pkl'))
    rf_full     = joblib.load(os.path.join(MODEL_DIR, 'rf_full.pkl'))
    lr_full     = joblib.load(os.path.join(MODEL_DIR, 'lr_full.pkl'))
    return scaler_quiz, kmeans_quiz, rf_quiz, lr_quiz, scaler_full, kmeans_full, rf_full, lr_full

def classify_student(features):
    scaler_quiz, kmeans_quiz, rf_quiz, lr_quiz, _, _, _, _ = load_models()
    X = np.array([[features['avg_score'], features['avg_time_per_question'],
                   features['quiz_count'], features['latest_score']]])
    X_scaled = scaler_quiz.transform(X)
    rf_pred = rf_quiz.predict(X_scaled)[0]
    rf_conf = float(rf_quiz.predict_proba(X_scaled).max())
    lr_pred = lr_quiz.predict(X_scaled)[0]
    lr_conf = float(lr_quiz.predict_proba(X_scaled).max())
    if rf_pred == lr_pred and rf_conf >= 0.55:
        group = rf_pred
        confidence = round((rf_conf + lr_conf) / 2 * 100, 1)
        method = 'ensemble'
    else:
        cluster = int(kmeans_quiz.predict(X_scaled)[0])
        centers = kmeans_quiz.cluster_centers_
        order = np.argsort([c[0] for c in centers])
        cluster_map = {int(order[0]): 'slow', int(order[1]): 'average', int(order[2]): 'fast'}
        group = cluster_map[cluster]
        confidence = round(rf_conf * 100, 1)
        method = 'kmeans_fallback'
    return {'group': group, 'confidence': confidence, 'method': method,
            'rf_prediction': rf_pred, 'lr_prediction': lr_pred}

def classify_student_full(features):
    _, _, _, _, scaler_full, kmeans_full, rf_full, lr_full = load_models()
    X = np.array([[
        features.get('avg_score', 0),
        features.get('avg_time_per_question', 0),
        features.get('quiz_count', 0),
        features.get('latest_score', 0),
        features.get('attendance', 0),
        features.get('previous_grade', 0),
        features.get('assignment_completion', 0),
        features.get('study_hours', 0),
        features.get('class_participation', 0),
        features.get('homework_submission', 0),
        features.get('attention_span', 0),
        features.get('peer_interaction', 0),
        features.get('behaviour_score', 0),
    ]])
    X_scaled = scaler_full.transform(X)
    rf_pred = rf_full.predict(X_scaled)[0]
    rf_conf = float(rf_full.predict_proba(X_scaled).max())
    lr_pred = lr_full.predict(X_scaled)[0]
    lr_conf = float(lr_full.predict_proba(X_scaled).max())
    if rf_pred == lr_pred and rf_conf >= 0.55:
        group = rf_pred
        confidence = round((rf_conf + lr_conf) / 2 * 100, 1)
        method = 'full_ensemble'
    else:
        cluster = int(kmeans_full.predict(X_scaled)[0])
        centers = kmeans_full.cluster_centers_
        order = np.argsort([c[0] for c in centers])
        cluster_map = {int(order[0]): 'slow', int(order[1]): 'average', int(order[2]): 'fast'}
        group = cluster_map[cluster]
        confidence = round(rf_conf * 100, 1)
        method = 'full_kmeans_fallback'
    return {'group': group, 'confidence': confidence, 'method': method,
            'rf_prediction': rf_pred, 'lr_prediction': lr_pred,
            'rf_confidence': round(rf_conf * 100, 1),
            'lr_confidence': round(lr_conf * 100, 1)}