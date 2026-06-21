from flask import Flask, request, jsonify
from flask_cors import CORS
from model import classify_student, classify_student_full, train_models, load_models
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'MentorMap ML Engine'})

@app.route('/classify', methods=['POST'])
def classify():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
        required = ['avg_score', 'avg_time_per_question', 'quiz_count', 'latest_score']
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400
        result = classify_student(data)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/classify-full', methods=['POST'])
def classify_full():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
        result = classify_student_full(data)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    try:
        train_models()
        return jsonify({'message': 'All models retrained successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting MentorMap ML Engine...")
    load_models()
    app.run(host='0.0.0.0', port=8000, debug=True)