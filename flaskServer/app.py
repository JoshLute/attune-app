from flask import Flask, request, jsonify
from flask_cors import CORS  # Allow cross-origin requests for the front-end
import random
import data_streamer as live
from threading import Thread
import numpy as np
import inference as inf
import time
from result_reader import read_results
import result_reader
# from live_transcriber import transcriber_instance
import speech_recognition as sr
from pydub import AudioSegment
import io
import openai

# FILL IN YOUR API KEY HERE
api_key = ""
client = openai.OpenAI(api_key=api_key)

app = Flask(__name__)
CORS(app)  # This will allow your frontend to communicate with the backend


# Define recording thread
# global recording_thread
recording_thread = Thread(target=live.record_data)
have_muse = True

# NOTE: Placeholder student data
from placeholder import student_data




'''@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()  # Get data from the frontend (e.g., input values)
    
    ml_result, timestamp = [1,0,0], time.time()#inf.inference(live.eeg_queue, live.timestamp_queue)
    confusion = int(ml_result[0]*100)
    control = int(ml_result[1]*100)
    understanding = int(ml_result[2]*100)

    inf.append_to_csv([timestamp, confusion, control, understanding])

    result = {
        "confusion": confusion,
        "control": control,
        "understanding": understanding
    }

    return jsonify(result)  # Send back the result as JSON'''


@app.route('/student_history', methods=['POST'])
def studentData():
    data = request.get_json()  # Get data from the frontend (e.g., input values)
    student_id = data['id']
    time_range = data['timeRange']

    history = []

    if time_range == 'lesson':
        print("lesson timerange")
        lesson = data['lesson']
        history, transcripts = read_results(f"results/{lesson}.csv")
        result = {"history": history, "transcripts": transcripts}
        return jsonify(result)
    else:
        print("month/week timerange")
        history = result_reader.load_historical_data(student_id, timeRange=time_range)

    print("Requested history")

    # print(history)
    result = {"history": history}
    # print(result)
    
    return jsonify(result)  # Send back the result as JSON


@app.route('/student_lessons', methods=['POST'])
def studentLessons():
    data = request.get_json()  # Get data from the frontend (e.g., input values)
    student_id = data['id']
    files = result_reader.list_files(student_id)
    print(files)

    # result = {"history": student_data[student_id]}
    print("Requested lesson list")
    result = {"lessons": files}
    
    return jsonify(result)  # Send back the result as JSON

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']

    try:
        # Convert webm to wav

        audio = AudioSegment.from_file(audio_file, format="webm")  # or "ogg" based on browser
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        wav_io.seek(0)


        # ml_result, timestamp = [1,0,0], time.time()
        ml_result, timestamp = inf.inference(live.eeg_queue, live.timestamp_queue)
        print(ml_result)
        confusion = int(ml_result[0]*100)
        control = int(ml_result[1]*100)
        understanding = int(ml_result[2]*100)


        result = {
            "transcription":"",
            "confusion": confusion,
            "control": control,
            "understanding": understanding
        }



        audio = AudioSegment.from_file(wav_io, format="wav")
        print(audio.dBFS)
        # Check volume before processing
        if audio.dBFS < -35:
            print("Audio too quiet:", audio.dBFS)
            inf.append_to_csv([timestamp, confusion, control, understanding, "-"])
            return jsonify(result)


        # Whisper transcription using v1 API
        transcription_response = client.audio.transcriptions.create(
            model="whisper-1",
            file=("audio.wav", wav_io, "audio/wav")
        )


        transcription = transcription_response.text.strip()
        
        if not transcription or transcription == "":
            transcription = "-"

        result["transcription"] = transcription
        inf.append_to_csv([timestamp, confusion, control, understanding, transcription])

        return jsonify(result)

    except Exception as e:
        print("Error transcribing audio:", str(e))
        raise e
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500

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
        transcript_list = data['transcript']
        response = {"recording_status":"ended"}
        live.record = False
        print(transcript_list)

        if have_muse:
            recording_thread.join()


    return jsonify(response)  # Send back the result as JSON


if __name__ == '__main__':
    app.run(debug=True, port=5001)
