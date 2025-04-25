import pandas as pd
import numpy as np

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

    return df.to_dict(orient='records')


if __name__ == "__main__":
    path = "results/jp_bubble.csv"
    res = read_results(path)
    print(res)