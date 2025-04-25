from flask import Flask, request, jsonify
from flask_cors import CORS  # Allow cross-origin requests for the front-end
import random
import data_streamer as live
from threading import Thread
import numpy as np
import inference as inf
import time
from result_reader import read_results

app = Flask(__name__)
CORS(app)  # This will allow your frontend to communicate with the backend


# Define recording thread
recording_thread = Thread(target=live.record_data)
have_muse = False

# NOTE: Placeholder student data
from placeholder import student_data




@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()  # Get data from the frontend (e.g., input values)
    
    ml_result, timestamp = [1,0,0], time.time()#inf.inference(live.eeg_queue, live.timestamp_queue)
    confusion = int(ml_result[0]*100)
    control = int(ml_result[1]*100)
    understanding = int(ml_result[2]*100)
    print(ml_result)


    inf.append_to_csv([timestamp, confusion, control, understanding])

    result = {
        "confusion": confusion,
        "control": control,
        "understanding": understanding
    }

    return jsonify(result)  # Send back the result as JSON


@app.route('/student_history', methods=['POST'])
def studentData():
    data = request.get_json()  # Get data from the frontend (e.g., input values)
    student_id = data['id']
    # lesson = data['id']
    lesson = "bubble"

    # result = {"history": student_data[student_id]}
    history = read_results(f"results/{student_id}_{lesson}.csv")
    print("Requested history")
    result = {"history": history}
    
    return jsonify(result)  # Send back the result as JSON

# TODO: take the student id as a parameter
@app.route('/recordingStatus', methods=['POST'])
def recordingStatus():

    data = request.get_json()  # Get data from the frontend (e.g., input values)
    
    # Your ML model code goes here
    # Example: Run some ML inference

    # NOTE: tell inference what model to use and what csv to use
    status = data['status']
    student_id = data['student_id']
    lesson = data['lesson'].replace(' ', '')
    response = {"recording_status": "none"}

    # START LESSON
    if status == "start":
        print("starting session")
        response = {"recording_status":"started"}
        live.record = True
        inf.set_csv(student_id, lesson)
        inf.set_scalar(student_id)
        inf.set_model(student_id)
        if have_muse:
            recording_thread.start()


    # END LESSON
    elif status == "end":
        print("ending session")
        response = {"recording_status":"ended"}
        live.record = False
        if have_muse:
            recording_thread.join()


    return jsonify(response)  # Send back the result as JSON


if __name__ == '__main__':
    app.run(debug=True, port=5001)
