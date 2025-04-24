import numpy as np
import pandas as pd
# import tensorflow.keras as keras
import pickle
import json


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
output_file = "jp.json"


# To load the data back
with open('models/X_scalar.pckl', 'rb') as file:
    X_scalar = pickle.load(file)

import tensorflow.keras as keras
model = keras.models.load_model('models/jp.keras', custom_objects=None, compile=True, safe_mode=True)

def inference(sample_queue):
    # eeg_buffer = eeg_buffer[:, :4]
    # eeg_buffer = np.expand_dims(eeg_buffer, axis=0)
    sample_queue = np.array(sample_queue)
    # print(sample_queue.shape)
    if sample_queue.shape[0]<=1:
        return np.zeros((3))
    

    print(f"Running on {sample_queue.shape[0]} samples...")
    samples = sample_queue[:,:,:4]

    window = transform_set(X_scalar, samples, fit=False)
    preds = model.predict(window)
    # preds = [1,2,3]

    # with open(f'results/output_file.json', 'w') as f:
        # obj = {'class': (preds*100).reshape((preds.shape[0],)).tolist()}
        # json.dump(obj, f)
    # return window.shape
    avg = np.average(preds, axis=0)
    return avg