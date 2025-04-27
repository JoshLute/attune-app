import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta


def read_results(file_path):
    """Reads a CSV, subtracts the first timestamp from all timestamps,
    and returns the result as a list of dictionaries.
    
    Args:
        file_path (str): Path to the CSV file.
    
    Returns:
        list: A list of dictionaries with normalized timestamps.
    """
    df = pd.read_csv(file_path)
    
    if 'timestamp' not in df.columns:
        raise ValueError("CSV must contain a 'timestamp' column")

    # Subtract the first timestamp
    first_ts = df['timestamp'].iloc[0]
    df['timestamp'] = (df['timestamp'] - first_ts).astype(int)
    df['attention'] = df['confused'] + df['understanding']
    # print(df)
    transcripts = list(df['transcript'].fillna(''))
    # df.drop('transcript', inplace=True)
    # print(df.columns)
    df.drop(columns=['transcript'], inplace=True)
    return df.to_dict(orient='records'), transcripts


def list_files(student_id, path="results"):
    """Lists files in the given directory, sorted by creation time.
    
    Args:
        path (str): The directory path.

    Returns:
        list: List of filenames sorted by creation time.
    """
    files = [
        os.path.join(path, f)
        for f in os.listdir(path)
        if os.path.isfile(os.path.join(path, f))
    ]

    # Sort by creation time (oldest to newest)
    # files.sort(key=os.path.getctime)
    removeBeginnig = "results/"
    removeEnd = ".csv"

    files = [file[len(removeBeginnig):-len(removeEnd)] for file in files if student_id in file]

    return files



def load_historical_data(student_id, path="results", timeRange="week"):
    """Loads and concatenates data from CSV files created in the last 7 days.

    Args:
        folder_path (str): Path to the folder containing CSV files.

    Returns:
        list: A list of dictionaries with the combined CSV data.
    """

    timeRange2Days = {
        "week": 7,
        "month": 30,
        "year": 365
    }

    now = datetime.now()
    delta = now - timedelta(days=timeRange2Days[timeRange])
    combined_data = []
    last_timestamp = 0

    for file in os.listdir(path):
        file_path = os.path.join(path, file)

        if os.path.isfile(file_path) and file.endswith('.csv'):
            # Get file creation time
            created_time = datetime.fromtimestamp(os.path.getctime(file_path))
            if created_time >= delta and file_path.startswith(f"results/{student_id}"):
                df = pd.read_csv(file_path)
                first_ts = df['timestamp'].iloc[0]
                df['timestamp'] = (df['timestamp'] - first_ts).astype(int)
                df['timestamp']+=last_timestamp
                df['attention'] = df['confused'] + df['understanding']
                last_timestamp = df.loc[df.shape[0]-1,'timestamp']
                combined_data.extend(df.to_dict(orient='records'))

    return combined_data



if __name__ == "__main__":
    path = "results/jp_bubble.csv"
    res = read_results(path)
    print(res)