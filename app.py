from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for ensuring frontend can talk to backend

@app.route('/')
def index():
    return app.send_static_file('index.html')

# CONFIGURATION
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "your-email@gmail.com"  # Placeholder
SENDER_PASSWORD = "your-app-password"  # Placeholder
RECIPIENT_EMAIL = "dbeale75@googlemail.com"

# --- Simulated AI Logic ---
class SimulatedAI:
    def __init__(self):
        self.context = {}

    def generate_response(self, message):
        msg_lower = message.lower()
        
        # Greetings
        if any(x in msg_lower for x in ["hello", "hi", "hey", "start"]):
            return "Hello! I am the Proximity AI Senior Consultant. How can I assist you in transforming your business today?"
            
        # Services / Capabilities
        if any(x in msg_lower for x in ["service", "offer", "do", "help", "feature"]):
            return ("We specialize in three core areas: \n"
                    "1. Process Automation (reducing manual work by 40%)\n"
                    "2. Customer Insights (predictive analytics)\n"
                    "3. 24/7 AI Agents (like me!)\n"
                    "Which of these interests you most?")
                    
        # Pricing / Cost
        if any(x in msg_lower for x in ["price", "cost", "fee", "expensive", "money"]):
            return ("Our solutions are bespoke to your business needs, typically yielding a 3-5x ROI within the first 6 months. "
                    "To give you an accurate quote, I'd recommend a quick strategy call. Would you like to schedule one?")
                    
        # Scheduling / Contact
        if any(x in msg_lower for x in ["book", "call", "schedule", "contact", "email", "talk"]):
            return ("Excellent choice. You can reach our senior strategy team directly at contact@proximityai.com, "
                    "or simply leave your email here and I will have them prioritize your file.")
                    
        # Gratitude
        if any(x in msg_lower for x in ["thanks", "thank", "cool", "good"]):
            return "You are most welcome. Is there anything else I can clarify for you?"

        # Default Professional Fallback
        return ("That is a very interesting point. To ensure I give you the most accurate technical information, "
                "I would suggest connecting with one of our human experts. Shall I take your contact details?")

ai_agent = SimulatedAI()

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'response': "I'm listening..."}), 200
        
    response = ai_agent.generate_response(user_message)
    return jsonify({'response': response}), 200

@app.route('/api/send-transcript', methods=['POST'])
def send_transcript():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    transcript = data.get('transcript')

    if not name or not email or not transcript:
        # Relaxed check for partial leads from chat
        if not transcript:
             return jsonify({'error': 'Missing data'}), 400

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_transcript = f"Timestamp: {timestamp}\nName: {name or 'Anonymous'}\nEmail: {email or 'Not Provided'}\n\n--- Transcript ---\n{transcript}"

    # 1. Log to file (Safe Mode)
    try:
        with open("email_log.txt", "a") as f:
            f.write("="*50 + "\n")
            f.write(formatted_transcript + "\n")
            f.write("="*50 + "\n")
        print(f"Logged transcript to email_log.txt")
    except Exception as e:
        print(f"Error logging to file: {e}", file=sys.stderr)
        return jsonify({'error': 'Internal logging error'}), 500

    return jsonify({'message': 'Transcript received'}), 200

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(debug=True, port=5000)
