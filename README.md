# Welcome to your Attune!

## How to run the Frontend
```sh
# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```
---

## How to Run the Backend

To properly run the backend services:

- Open one terminal window and run the Flask server:

```sh
python flaskServer/app.py
```

- If you have the Muse S headband run the following in a new terminal:
```sh
python flaskServer/start_stream.py
```

### Be aware that this repository uses the OpenAI api for whisper and gpt-3.5-turbo; we have left the api_keys blank for security purposes
These will need to be filled in at the top of `flaskServer/app.py` and `src/componts/collaboration/AIChat.tsx`