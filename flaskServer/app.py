from flask import Flask, request, jsonify
from flask_cors import CORS  # Allow cross-origin requests for the front-end
import random
import data_streamer as live
from threading import Thread
import numpy as np
from inference import inference

app = Flask(__name__)
CORS(app)  # This will allow your frontend to communicate with the backend


# Define recording thread
recording_thread = Thread(target=live.record_data)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()  # Get data from the frontend (e.g., input values)
    
    # Your ML model code goes here
    # Example: Run some ML inferenc

    # queue_samples = live.eeg_queue.pop()
    ml_result = inference(live.eeg_queue)
    confusion = int(ml_result[0]*100)
    control = int(ml_result[1]*100)
    understanding = int(ml_result[2]*100)
    print(ml_result)
    # result = run_ml_model(data)  # This is a placeholder for your ML code
    result = {
        "confusion": confusion,
        "control": control,
        "understanding": understanding
    }

    return jsonify(result)  # Send back the result as JSON

@app.route('/recordingStatus', methods=['POST'])
def recordingStatus():
    data = request.get_json()  # Get data from the frontend (e.g., input values)
    
    # Your ML model code goes here
    # Example: Run some ML inference
    status = data['status']
    response = {"recording_status": "none"}
    if status == "start":
        print("starting session")
        response = {"recording_status":"started"}
        live.record = True
        recording_thread.start()


    elif status == "end":
        print("ending session")
        response = {"recording_status":"ended"}
        live.record = False
        recording_thread.join()


    return jsonify(response)  # Send back the result as JSON

# NOTE: REDUNDANT FOR NOW
def run_ml_model(data):
    # Example: Just return the input data for now
    # Replace this with your ML code
    return {
        "understanding": int(random.uniform(50,100)),
        "confusion": int(random.uniform(50,100)),
        "control": int(random.uniform(50,100))
        }

if __name__ == '__main__':
    app.run(debug=True, port=5001)
