# -*- coding: utf-8 -*-
"""
Estimate Relaxation from Band Powers

This example shows how to buffer, epoch, and transform EEG data from a single
electrode into values for each of the classic frequencies (e.g. alpha, beta, theta)
Furthermore, it shows how ratios of the band powers can be used to estimate
mental state for neurofeedback.

The neurofeedback protocols described here are inspired by
*Neurofeedback: A Comprehensive Review on System Design, Methodology and Clinical Applications* by Marzbani et. al

Adapted from https://github.com/NeuroTechX/bci-workshop
"""

import numpy as np  # Module that simplifies computations on matrices
import matplotlib.pyplot as plt  # Module used for plotting
from pylsl import StreamInlet, resolve_byprop  # Module to receive EEG data
import utils  # Our own utility functions
from collections import deque

# The try/except structure allows to quit the while loop by aborting the
# script with <Ctrl-C>
print('Press Ctrl-C in the console to break the while loop.')


# ---------------------------------------------
from collections import deque
# eeg_queue = deque(maxlen=12)
eeg_queue = []
record = False

def record_data():
    # Length of the EEG data buffer (in seconds)
    # This buffer will hold last n seconds of data and be used for calculations
    BUFFER_LENGTH = 1

    # Length of the epochs used to compute the FFT (in seconds)
    EPOCH_LENGTH = 1

    # Amount of overlap between two consecutive epochs (in seconds)
    OVERLAP_PERCENT = 0.8

    # Amount to 'shift' the start of each next consecutive epoch
    SHIFT_LENGTH = EPOCH_LENGTH - EPOCH_LENGTH*OVERLAP_PERCENT

    # Index of the channel(s) (electrodes) to be used
    # 0 = left ear, 1 = left forehead, 2 = right forehead, 3 = right ear
    N_CHANNELS = 5


    """ 1. CONNECT TO EEG STREAM """

    # Search for active LSL streams
    print('Looking for an EEG stream...')
    streams = resolve_byprop('type', 'EEG', timeout=2)
    if len(streams) == 0:
        raise RuntimeError('Can\'t find EEG stream.')

    # Set active EEG stream to inlet and apply time correction
    print("Start acquiring data")
    inlet = StreamInlet(streams[0], max_chunklen=12)
    eeg_time_correction = inlet.time_correction()

    # Get the stream info and description
    info = inlet.info()
    description = info.desc()

    # for the Muse 2016, this should always be 256
    fs = int(info.nominal_srate())
    """ 2. INITIALIZE BUFFERS """

    # Initialize raw EEG data buffer
    eeg_buffer = np.zeros((int(fs * BUFFER_LENGTH), N_CHANNELS))
    filter_state = None  # for use with the notch filter


    try:
        # The following loop acquires data, computes band powers, and calculates neurofeedback metrics based on those band powers
        while record:

            """ 3.1 ACQUIRE DATA """
            # Obtain EEG data from the LSL stream
            eeg_data, timestamp = inlet.pull_chunk(
                timeout=1, max_samples=int(SHIFT_LENGTH * fs))

            # print(len(timestamp))
            # Only keep the channel we're interested in
            ch_data = np.array(eeg_data)

            # Update EEG buffer with the new data
            eeg_buffer, filter_state = utils.update_buffer(
                eeg_buffer, ch_data, notch=False,
                filter_state=filter_state)


            eeg_queue.append(eeg_buffer)
            if len(eeg_queue) > 10:
                eeg_queue.pop(0)


    except KeyboardInterrupt:
        print('Closing!')
