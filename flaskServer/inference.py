import numpy as np
import pandas as pd
# import tensorflow.keras as keras
import pickle
import json
import csv
import os

csv_path = "results/jp.csv"


def create_csv_with_header(file_path, header):
    """Creates a new CSV file with a header row.
    
    Args:
        file_path (str): The path to the CSV file.
        header (list): A list of column names for the header row.
    """
    with open(file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(header)


def append_to_csv(row):
    """Appends a single row to a CSV file.
    
    Args:
        file_path (str): The path to the CSV file.
        row (list): A list of values representing a row to append.
    """
    print(row)
    with open(csv_path, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(row)


def transform_set(scalar, data, fit=False):
    original_shape = data.shape 
    reshaped = data.reshape(-1, data.shape[-1]) 

    if fit:
        reshaped = scalar.fit_transform(reshaped)
    else:
        reshaped = scalar.transform(reshaped)
        
    reshaped = reshaped.reshape(original_shape)

    return reshaped



X_scalar = None


def set_scalar(student_id):
    # To load the data back
    with open(f'models/X_scalar_{student_id}.pckl', 'rb') as file:
        print(f'using models/X_scalar_{student_id}.pckl')
        global X_scalar
        X_scalar = pickle.load(file)

def set_csv(student_id, lesson):
    print(f'using results/{student_id}_{lesson}.csv')
    global csv_path
    csv_path = f"results/{student_id}_{lesson}.csv"
    if not os.path.isfile(csv_path):
        create_csv_with_header(csv_path, ['timestamp', 'confused', 'control', 'understanding', 'transcript'])



def set_model(student_id):
    print(f'using models/{student_id}.keras')
    # model = keras.models.load_model(f'models/{student_id}.keras', custom_objects=None, compile=True, safe_mode=True)
    pass


import tensorflow.keras as keras
model = keras.models.load_model('models/jp.keras', custom_objects=None, compile=True, safe_mode=True)


def inference(sample_queue, timestamp_queue):
    # eeg_buffer = eeg_buffer[:, :4]
    # eeg_buffer = np.expand_dims(eeg_buffer, axis=0)
    sample_queue = np.array(sample_queue)
    timestamp = timestamp_queue[-1]
    # print(sample_queue.shape)
    if sample_queue.shape[0]<=1:
        return np.zeros((3))
    

    print(f"Running on {sample_queue.shape[0]} samples...")
    samples = sample_queue[:,:,:4]

    window = transform_set(X_scalar, samples, fit=False)
    preds = model.predict(window)
    # preds = [1,2,3]


    avg = np.average(preds, axis=0)

    return avg, timestamp