import os
import httpx
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import nltk
import torch
import requests
from bs4 import BeautifulSoup
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Download NLTK packages
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

# Load the NLP model for your chatbot
model = SentenceTransformer('all-MiniLM-L6-v2')

qa_pairs = [
     {
        "question": "Hello" ,
        "answer": "Hello 👋 I am Campus Sports Sphere Bot. How can I help you?"
    },
     {
        "question": "Hi" ,
        "answer": "Hi 👋 I am Campus Sports Sphere Bot. How can I help you?"
    },
     {
        "question": "Hey" ,
        "answer": "Hey 👋 I am Campus Sports Sphere Bot. How can I help you?"
    },
    {
        "question": "How do I create an account in the app?",
        "answer": "To create an account, go to the Sign-Up page and provide your student details, including your name, Student ID, and email. Choose a password and complete the registration process."
    },
    {
        "question": "What sports equipment can I reserve?",
        "answer": "You can reserve equipment for various sports including Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This includes items like balls, rackets, helmets, pads, gloves, and shuttlecocks."
    },
    {
        "question": "How do I reserve sports equipment?",
        "answer": "After signing in, go to the Home section in the Tab Navigator. Find the equipment you want to reserve and click the 'Reserve' button next to it. Select the duration, review the details, and confirm your reservation."
    },
    {
        "question": "What are the reservation hours for equipment?",
        "answer": "Equipment can be reserved from 8:00 AM to 5:30 PM."
    },
    {
        "question": "How long can I keep the reserved equipment?",
        "answer": "The duration of your reservation depends on what you select when making the reservation. You'll need to return the equipment by the end of your selected time slot."
    },
    {
        "question": "What happens if I don't return the equipment on time?",
        "answer": "You'll receive a notification when your reservation is about to expire. It's important to return the equipment on time to avoid any penalties and to allow other students to use it."
    },
    {
        "question": "Where can I see my current equipment reservations?",
        "answer": "Your current equipment reservations are displayed in your Profile tab within the app."
    },
    {
        "question": "What should I do if the equipment I received is faulty?",
        "answer": "If you receive faulty equipment, you should immediately report it through the app's Help and Support section or contact the staff directly. You can also write a query explaining the issue."
    },
    {
        "question": "How do I register for sports events?",
        "answer": "To register for sports events, go to the Events section in the Tab Navigator. Browse available events and click on the one you're interested in. Then, follow the registration process for that specific event."
    },
    {
        "question": "Can I see which events I've registered for?",
        "answer": "Yes, all the events you've registered for are displayed in your Profile tab."
    },
    {
        "question": "How are teams formed for events?",
        "answer": "Teams are formed based on the number of registered students and the requirements of each sport. For example, Cricket and Football teams have 11 players each, while Basketball teams have 5 players."
    },
    {
        "question": "Can I unregister from an event?",
        "answer": "Yes, you can unregister from an event by canceling it from your Profile section in the Tab Navigator."
    },
    {
        "question": "Can I register for past events?",
        "answer": "No, you cannot register for events that have already taken place."
    },
    {
        "question": "How long do sports matches usually last?",
        "answer": "The duration varies by sport. For example, Cricket matches generally last 2-3 hours, Football matches are 90 minutes, and other sports have their specific durations."
    },
    {
        "question": "What time are matches scheduled?",
        "answer": "Matches are scheduled between 8:30 AM and 5:30 PM."
    },
    {
        "question": "How can I reserve a Cricket ground?",
        "answer": "To reserve a Cricket ground, go to the Ground Reservation section. View available slots defined by the Event Manager, select your desired slot, and submit a reservation request. If approved, you'll receive a notification."
    },
    {
        "question": "Is there weather information available for ground reservations?",
        "answer": "Yes, when reserving a Cricket ground, you can view current weather information for COMSATS University Islamabad, including temperature and conditions."
    },
    {
        "question": "What happens if an equipment item is out of stock?",
        "answer": "If the quantity of a particular equipment item reaches zero, it will not be available for reservation until more are added to the inventory."
    },
    {
        "question": "How can I contact support if I have issues with the app?",
        "answer": "You can visit the Help and Support section in the app to find answers to common questions or to submit a query to the staff."
    },
    {
        "question": "Can staff see who has currently reserved equipment?",
        "answer": "Yes, staff members have access to view current equipment reservations and reservation history."
    },
    {
        "question": "How are recommended events determined for users?",
        "answer": "Recommended events are based on the priority sports you've selected in your profile or your past event participation history."
    },
    {
        "question": "Can the Event Manager modify scheduled events?",
        "answer": "Yes, the Event Manager can reschedule or delete events as needed."
    },
    {
        "question": "Are there restrictions on scheduling multiple matches?",
        "answer": "Yes, no two matches of the same sport can be scheduled at the same time."
    },
    {
        "question": "What happens if my ground reservation request is approved?",
        "answer": "If your ground reservation request is approved, you'll receive a notification, and the slot will be reserved for you. It will no longer be visible to other students for reservation."
    },
    {
        "question": "Can I reserve equipment for someone else?",
        "answer": "No, equipment reservations are personal and tied to your student account. You cannot reserve equipment for other students."
    },
    {
        "question": "Is there a limit to how many items I can reserve at once?",
        "answer": "The app may have limits on the number of items you can reserve simultaneously to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "How do I update my account information?",
        "answer": "You can update your account information in the Profile section of the app. Look for an 'Edit Profile' or 'Account Settings' option."
    },
    {
        "question": "What should I do if I forget my password?",
        "answer": "If you forget your password, look for a 'Forgot Password' link on the login page. Follow the instructions to reset your password using your registered email."
    },
    {
        "question": "Can I see the availability of equipment before making a reservation?",
        "answer": "Yes, the app should show you the current availability of each equipment item when you're browsing the Reservation section."
    },
    {
        "question": "How far in advance can I reserve equipment?",
        "answer": "The reservation window may vary. Check the app for specific rules, but typically you can reserve equipment a few days to a week in advance."
    },
    {
        "question": "What happens if I'm late returning equipment?",
        "answer": "Late returns may result in penalties or restrictions on future reservations. Always try to return equipment on time or extend your reservation if needed."
    },
    {
        "question": "Can I extend my equipment reservation?",
        "answer": "You may be able to extend your reservation if the equipment is not reserved by someone else immediately after your slot. Check for an 'Extend Reservation' option in your current reservations."
    },
    {
        "question": "How do I cancel an equipment reservation?",
        "answer": "To cancel a reservation, go to your Profile or Reservations section and look for a 'Cancel' option next to your active reservations."
    },
    {
        "question": "Are there any fees for reserving equipment?",
        "answer": "Most equipment reservations are likely free for students, but check the app or with the Sports Department for any potential fees or deposits required."
    },
    {
        "question": "How do I report lost or damaged equipment?",
        "answer": "If equipment is lost or damaged, report it immediately through the app's Help section or directly to the Sports Department staff."
    },
    {
        "question": "Can graduate students use the app to reserve equipment?",
        "answer": "The app is designed for university students. If you're a graduate student, you should be able to use it, but verify with your Sports Department if there are any restrictions."
    },
    {
        "question": "How do I view upcoming sports events?",
        "answer": "Go to the Events section in the app to view all upcoming sports events. You can usually filter or sort events by date or sport type."
    },
    {
        "question": "Can I suggest new equipment for the university to acquire?",
        "answer": "You may be able to suggest new equipment through the app's Feedback or Help section. Alternatively, contact the Sports Department directly with your suggestions."
    },
    {
        "question": "How are teams assigned for multi-player sports events?",
        "answer": "Teams are typically formed based on registrations. The Event Manager may assign teams randomly or based on skill levels, depending on the event type."
    },
    {
        "question": "Can I choose my teammates for events?",
        "answer": "For most events, teams are assigned by the Event Manager. Some events might allow you to register as a pre-formed team, but check the specific event details."
    },
    {
        "question": "What happens if not enough players register for a team sport?",
        "answer": "If there aren't enough registrations, the event might be canceled or postponed. The Event Manager will notify registered players of any changes."
    },
    {
        "question": "How do I know if I've been selected for a team?",
        "answer": "You'll receive a notification through the app once teams have been formed. You can also check your Profile or the event details for team assignments."
    },
    {
        "question": "Can I participate in multiple events on the same day?",
        "answer": "You can register for multiple events, but be aware of potential time conflicts. The app should warn you if you're registering for overlapping events."
    },
    {
        "question": "How do I view the schedule of matches I'm participating in?",
        "answer": "Check your Profile section or the Events tab for a schedule of matches you're participating in. You should see dates, times, and locations for each match."
    },
    {
        "question": "What should I do if I can't attend a match I've registered for?",
        "answer": "If you can't attend a match, notify the Event Manager as soon as possible through the app. Look for an option to withdraw from the event or contact support."
    },
    {
        "question": "Can I reserve a ground for personal practice?",
        "answer": "Ground reservations are typically for organized events or matches. Check with the Sports Department if personal practice reservations are allowed."
    },
    {
        "question": "How far in advance are event schedules posted?",
        "answer": "Event schedules are usually posted several days to weeks in advance. Regular check the Events section for updates on upcoming events."
    },
    {
        "question": "Can I get notifications for new event postings?",
        "answer": "Yes, you should be able to set up notifications in the app settings to alert you when new events are posted or when registration opens."
    },
    {
        "question": "What information is shown in the weather API for ground reservations?",
        "answer": "The weather API typically shows current temperature, weather conditions (sunny, cloudy, rainy, etc.), and possibly a short-term forecast for the COMSATS University Islamabad area."
    },
    {
        "question": "How accurate is the weather information provided?",
        "answer": "The weather information is based on real-time data from a reliable weather service, but as with all weather forecasts, it's subject to change."
    },
    {
        "question": "Can I see past reservation history for equipment?",
        "answer": "Your past reservation history should be available in your Profile section. This can help you track your equipment usage over time."
    },
    {
        "question": "Is there a rating system for equipment quality?",
        "answer": "The app may include a feature for rating equipment quality after use. Check your reservation history or equipment details for any rating options."
    },
    {
        "question": "How do I report a bug in the app?",
        "answer": "To report a bug, use the Help and Support section in the app. Look for an option to report technical issues or bugs."
    },
    {
        "question": "Can I use the app on both iOS and Android devices?",
        "answer": "The app should be available for both iOS and Android devices. Download it from your device's app store."
    },
    {
        "question": "Is there a desktop version of the app?",
        "answer": "The app is primarily designed for mobile devices. Check with the university if there's a web version available for desktop use."
    },
    {
        "question": "How secure is my personal information in the app?",
        "answer": "The app uses standard security measures to protect your personal information. Always keep your login credentials private and use a strong, unique password."
    },
    {
        "question": "Can I link my Student ID to the app?",
        "answer": "Your Student ID is likely linked to your account during registration. Contact support if you need to update or verify your Student ID in the app."
    },
    {
        "question": "How do I update my sports preferences for event recommendations?",
        "answer": "Go to your Event tab and look for an option to update your sports preferences or interests. This will help tailor event recommendations to your liking."
    },
    {
        "question": "Can I see who else is registered for an event?",
        "answer": "For privacy reasons, you might not be able to see other registrants. However, you may be able to see team assignments once they're made."
    },
    {
        "question": "Is there a waitlist for popular events?",
        "answer": "Popular events may have a waitlist feature. If an event is full, look for an option to join the waitlist in case spots open up."
    },
    {
        "question": "How do I know if an event I registered for is canceled?",
        "answer": "You'll receive a notification if an event you're registered for is canceled. Always check the app for the most up-to-date event information."
    },
    {
        "question": "Can I request specific equipment for an event?",
        "answer": "Equipment for events is typically standardized. If you need specific equipment, contact the Event Manager or Sports Department directly."
    },
    {
        "question": "How do I view the rules for different sports events?",
        "answer": "Event rules should be available in the event details section. Look for a 'Rules' or 'Event Info' tab when viewing an event."
    },
    {
        "question": "Is there a feature to find teammates or opponents for practice matches?",
        "answer": "The app may have a community or social feature to connect with other players. Check for a 'Community' or 'Find Players' section."
    },
    {
        "question": "How do I track my sports performance in the app?",
        "answer": "The app currently does not have a performance tracking feature. It will be added in a future update."
    },
    {
        "question": "Can I get reminders for my equipment return deadlines?",
        "answer": "Yes, the app should send you notifications reminding you of upcoming equipment return deadlines."
    },
    {
        "question": "How do I provide feedback on the app's features?",
        "answer": "Use the Help and Support section to provide feedback. There may be a specific 'Feedback' or 'Suggestions' option."
    },
     {
        "question": "Is there a chat feature to communicate with other players or staff?",
        "answer": "Check if the app has a messaging or chat feature. This could be useful for communicating with staff only."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is likely updated in real-time as reservations are made and items are returned. Staff may also perform regular inventory checks."
    },
    {
        "question": "How do I find information about accessibility features for sports facilities?",
        "answer": "Look for a 'Help and Support' section that provides information on accessible features of sports grounds and equipment."
    },
    {
        "question": "Can I see a list of sports equipment that's suitable for beginners?",
        "answer": "Our list of sports equipment is for every student!"
    },
    {
        "question": "Is there a feature to create and share sports challenge videos with other users?",
        "answer": "No, there is no such feature available in the app right now."
    },
    {
        "question": "Can I see a list of sports equipment that's designed for use in extreme temperatures?",
        "answer": "Look for an 'Extreme Weather Gear' or 'All-Climate Equipment' section that highlights sports equipment suitable for very hot or cold conditions."
    },
    {
        "question": "What's the process for signing up on the Sports Sphere app?",
        "answer": "To sign up, navigate to the Registration page and enter your student information, including your full name, Student Identification Number, and university email address. Choose a secure password, then complete the registration process by following the on-screen instructions."
    },
    {
        "question": "Which sports gear can I book through the app?",
        "answer": "The app allows you to book a wide range of sports equipment, including items for Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This covers various items such as balls, bats, rackets, protective gear, and more."
    },
    {
        "question": "How do I go about booking sports equipment on the app?",
        "answer": "After logging in, navigate to the Home tab. Browse the available equipment, select the item you want, and tap the 'Book' button. Choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "What are the operating hours for equipment bookings?",
        "answer": "You can make equipment bookings from 8:00 AM until 5:30 PM."
    },
    {
        "question": "How do I register for a sports event?",
        "answer": "To register for a sports event: 1) Open the app and go to the 'Events' section, 2) Browse available events, 3) Select the event you're interested in, 4) Click 'Register' or 'Sign Up', 5) Fill in any required information, 6) Confirm your registration. You'll receive a confirmation notification once you're registered."
    },
    {
        "question": "What's the process for signing up for a sports tournament?",
        "answer": "To sign up for a sports tournament: First, log into the app and navigate to the Events tab. Browse the list of upcoming tournaments, select the one you want to join, and click on the registration button. Follow the prompts to complete your registration, which may include providing some personal information or forming a team."
    },
    {
        "question": "Can you explain how to join a campus sports event?",
        "answer": "Joining a campus sports event is easy! Just open the app, go to the Events section, and find the event you're interested in. Click on it for more details, then look for a 'Join' or 'Register' button. Follow the steps to complete your registration, which might include choosing your role (player, spectator, etc.) or joining a team."
    },
    {
        "question": "What steps do I need to follow to participate in a sports competition?",
        "answer": "To participate in a sports competition: 1) Open the app, 2) Go to 'Events' or 'Competitions', 3) Find the competition you want to join, 4) Click for more details, 5) Hit the 'Participate' or 'Register' button, 6) Fill out any required forms or information, 7) Submit your registration. You'll get a confirmation once you're successfully registered."
    },
    {
        "question": "How can I sign up for upcoming sports events on campus?",
        "answer": "Signing up for upcoming sports events is simple: Open the Campus Sports Sphere app and head to the Events section. You'll see a list of upcoming events. Choose the one you're interested in, tap on it, and look for the registration option. Follow the prompts to complete your sign-up, which may include selecting your preferred role or team."
    },
    {
        "question": "How do I reserve a sports ground?",
        "answer": "To reserve a sports ground: 1) Log into the app, 2) Go to 'Ground Reservations', 3) Select the type of ground you need (e.g., Cricket field, Football pitch), 4) Choose an available date and time slot, 5) Review the reservation details, 6) Confirm your booking. You'll receive a confirmation once your reservation is approved."
    },
    {
        "question": "What's the process for booking a sports field?",
        "answer": "To book a sports field, start by opening the app and navigating to the 'Facilities' or 'Ground Booking' section. Choose the type of field you need, then select an available date and time slot. Review the booking details, including any fees or rules, and confirm your reservation. You'll get a notification when your booking is approved."
    },
    {
        "question": "Can you explain how to reserve a playing ground on campus?",
        "answer": "Reserving a playing ground is straightforward: Open the app and find the 'Ground Reservations' section. Select the type of ground you need (like a Football field or Basketball court). Browse available time slots and pick one that works for you. Review any rules or fees, then confirm your reservation. You'll receive an approval notification soon after."
    },
    {
        "question": "What steps do I need to follow to book a sports court?",
        "answer": "To book a sports court: 1) Open the app, 2) Navigate to 'Facility Bookings' or 'Court Reservations', 3) Choose the type of court you need, 4) Select an available date and time, 5) Review any rules or fees associated with the booking, 6) Confirm your reservation. You'll get a confirmation message once your booking is processed."
    },
    {
        "question": "How can I reserve a pitch for my team practice?",
        "answer": "To reserve a pitch for team practice: First, log into the app and go to the 'Ground Bookings' section. Select the type of pitch you need (e.g., Football, Cricket). Choose from the available dates and times that suit your team's schedule. Review any usage rules or fees, then confirm your booking. You'll receive a notification when your reservation is approved."
    },
    {
        "question": "What's the procedure for securing a sports ground for an event?",
        "answer": "To secure a sports ground for an event: Open the app and navigate to 'Facility Reservations'. Select 'Sports Grounds' and choose the specific type you need. Pick an available date and time slot that fits your event schedule. You may need to provide event details. Review any rules or fees, then submit your reservation request. Approval notification will be sent to you once processed."
    },
    {
        "question": "How do I go about reserving an outdoor court for a game?",
        "answer": "To reserve an outdoor court: 1) Open the app, 2) Go to 'Court Bookings', 3) Select 'Outdoor Courts', 4) Choose the specific court type (e.g., Tennis, Basketball), 5) Pick an available date and time, 6) Review any usage guidelines or fees, 7) Confirm your reservation. You'll receive a booking confirmation once it's approved."
    },
    {
        "question": "Can you walk me through the process of booking a sports field on campus?",
        "answer": "Sure! Here's how to book a sports field: Open the Campus Sports Sphere app and find the 'Facility Bookings' section. Choose 'Sports Fields' and select the type you need (e.g., Soccer field, Cricket pitch). Browse the calendar for available slots and pick a suitable time. Review any rules or fees associated with the booking. Finally, confirm your reservation. You'll get a notification when your booking is approved."
    },
    {
        "question": "How many items can I reserve at once?",
        "answer": "Students can typically reserve up to 3 items at a time, but this may vary depending on the type of equipment and current demand."
    },
    {
        "question": "Is there a limit to how much equipment I can book?",
        "answer": "Yes, there's usually a limit of 3 items per student to ensure fair access for everyone. However, this may vary based on equipment type and availability."
    },
    {
        "question": "Can I reserve multiple pieces of equipment simultaneously?",
        "answer": "You can reserve multiple pieces of equipment, typically up to 3 items, simultaneously. This limit helps ensure equitable access for all students."
    },
    {
        "question": "What happens if the equipment I want is out of stock?",
        "answer": "If an equipment item is out of stock, it won't be available for reservation in the app. You can check back later or choose an alternative item if available."
    },
        {
        "question": "How do I create an account in the Campus Sports Sphere app?",
        "answer": "To create an account, go to the sign-up page and provide your student details, including your name, student ID, and email. Choose a password and complete the registration process."
    },
    {
        "question": "What steps should I follow to register on the app?",
        "answer": "To register: 1) Open the app, 2) Tap on 'Sign Up', 3) Enter your name, student ID, and email, 4) Choose a secure password, 5) Agree to the terms, and 6) Complete the registration."
    },
    {
        "question": "Can you explain the process of signing up for the Campus Sports Sphere app?",
        "answer": "The sign-up process involves opening the app, tapping 'Sign Up', entering your personal details (name, student ID, email), creating a password, agreeing to the terms, and finalizing your registration."
    },
    {
        "question": "When can I reserve sports equipment through the app?",
        "answer": "You can reserve sports equipment from 8:00 AM to 5:30 PM daily through the app."
    },
    {
        "question": "What are the hours for equipment reservations?",
        "answer": "Equipment reservations can be made from 8:00 AM to 5:30 PM every day."
    },
    {
        "question": "How long can I keep the equipment I've reserved?",
        "answer": "The duration of your reservation depends on what you select when making the reservation. You'll need to return the equipment by the end of your selected time slot."
    },
    {
        "question": "What's the maximum duration for equipment reservations?",
        "answer": "The maximum duration varies. When making a reservation, you'll see the available time slots and can choose the duration that fits your needs, within the app's limits."
    },
    {
        "question": "How do I find and register for sports events in the app?",
        "answer": "To find and register for sports events: 1) Go to the Events section, 2) Browse available events, 3) Click on an event you're interested in, 4) Follow the registration process for that specific event."
    },
    {
        "question": "Where can I see upcoming sports events in the app?",
        "answer": "You can see upcoming sports events in the Events section of the app. This section lists all available events you can register for."
    },
    {
        "question": "What should I do if I need to cancel my event registration?",
        "answer": "To cancel an event registration, go to your Profile section, find the event you want to unregister from, and select the cancellation option."
    },
    {
        "question": "How can I view my current equipment reservations?",
        "answer": "You can view your current equipment reservations in the Profile tab within the app. This section shows all your active reservations."
    },
    {
        "question": "Where do I go to see what equipment I've reserved?",
        "answer": "To see what equipment you've reserved, navigate to the Profile section in the app. Here, you'll find a list of all your current reservations."
    },
    {
        "question": "Can you explain how to cancel an equipment reservation?",
        "answer": "To cancel an equipment reservation: 1) Go to your Profile or Reservations section, 2) Find the reservation you want to cancel, 3) Look for a 'Cancel' option next to it, 4) Confirm the cancellation when prompted."
    },
    {
        "question": "What's the process for extending an equipment reservation?",
        "answer": "To extend a reservation, check your current reservations for an 'Extend' option. If available, select it and choose a new return time. This is subject to the equipment's availability."
    },
    {
        "question": "How do I report faulty or damaged equipment?",
        "answer": "To report faulty equipment, use the app's Help and Support section or contact the staff directly. You can also write a query explaining the issue in detail."
    },
    {
        "question": "What should I do if the equipment I received is not working properly?",
        "answer": "If you receive faulty equipment, immediately report it through the app's Help and Support section or contact the staff directly. Provide details about the issue you're experiencing."
    },
    {
        "question": "When do I need to return the equipment I've reserved?",
        "answer": "You need to return the equipment by the end of your selected time slot. The app will send you a reminder when your reservation is about to expire."
    },
    {
        "question": "How can I check the rules for different sports events?",
        "answer": "To check event rules, go to the event details section. Look for a 'Rules' or 'Event Info' tab when viewing a specific event."
    },
    {
        "question": "What steps should I take if I can't attend a match I've registered for?",
        "answer": "If you can't attend a match, notify the event manager as soon as possible through the app. Look for an option to withdraw from the event or contact support."
    },
    {
        "question": "How do I update my personal information in the app?",
        "answer": "To update your personal information, go to the Profile section of the app. Look for an 'Edit Profile' or 'Account Settings' option to make changes."
    },
    {
        "question": "Can you explain how the team formation process works for events?",
        "answer": "Teams are typically formed based on the number of registered participants and the requirements of each sport. For example, cricket and football teams have 11 players each, while basketball teams have 5 players."
    },
    {
        "question": "What should I do if I forget my password?",
        "answer": "If you forget your password, look for a 'Forgot Password' link on the login page. Follow the instructions to reset your password using your registered email."
    },
    {
        "question": "How can I get notifications for new event postings?",
        "answer": "You can set up notifications in the app settings to alert you when new events are posted or when registration opens for events."
    },
    {
        "question": "What information is shown in the weather API for ground reservations?",
        "answer": "The weather API typically shows current temperature, weather conditions (sunny, cloudy, rainy, etc.), and possibly a short-term forecast for the COMSATS University Islamabad area."
    },
    {
        "question": "What should I do if I receive faulty equipment?",
        "answer": "If you receive faulty equipment, please report it immediately through the app's Help section or directly to the Sports Department staff."
    },
    {
        "question": "How do I report damaged sports gear?",
        "answer": "To report damaged sports gear, use the 'Report Issue' feature in the app or inform the Sports Department staff directly."
    },
    {
        "question": "The equipment I reserved is broken. What now?",
        "answer": "If the equipment you reserved is broken, please return it immediately and report the issue through the app or to the staff. You can then make a new reservation for a replacement."
    },
    {
        "question": "Can all students make reservations?",
        "answer": "Yes, all registered students can make equipment reservations using their Student ID and app account."
    },
    {
        "question": "Who is eligible to reserve sports equipment?",
        "answer": "All currently enrolled students are eligible to reserve sports equipment through the app."
    },
    {
        "question": "Do I need to be a student to book equipment?",
        "answer": "Yes, you need to be a registered student to book equipment. The app uses your Student ID for verification."
    },
    {
        "question": "Are there any restrictions on student reservations?",
        "answer": "While all students can make reservations, there may be limits on the number of items or duration of reservations to ensure fair access for everyone."
    },
    {
        "question": "Hello bro",
        "answer": "Hello! 👋 I'm the Campus Sports Sphere Bot. How can I assist you today?"
    },
    {
        "question": "What are the hours for equipment reservations?",
        "answer": "Equipment reservations can be made from 8:00 AM to 5:30 PM daily."
    },
    {
        "question": "When can I book sports equipment?",
        "answer": "You can book sports equipment any time between 8:00 AM and 5:30 PM."
    },
    {
        "question": "What's the time window for reserving sports gear?",
        "answer": "The time window for reserving sports gear is from 8:00 AM to 5:30 PM every day."
    },
    {
        "question": "How is the equipment inventory maintained?",
        "answer": "The equipment inventory is maintained by staff who regularly update the available quantities and check for any damaged items."
    },
    {
        "question": "Who is responsible for updating the equipment inventory?",
        "answer": "The Sports Department staff is responsible for updating the equipment inventory."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is updated in real-time as reservations are made and items are returned. Staff also perform regular inventory checks."
    },
    {
        "question": "Good afternoon",
        "answer": "Good afternoon! ☀️ What information do you need about our sports facilities or equipment?"
    },
    {
        "question": "Good Evening",
        "answer": "Good Evening! 🌒 What information do you need about our sports facilities or equipment?"
    },
    {
        "question": "Is there a specific process for students to reserve sports gear?",
        "answer": "Yes, students need to log into the app, select the equipment they want, choose a time slot, review the details, and confirm their reservation."
    },
    {
        "question": "What steps should I take if the equipment I received is not working?",
        "answer": "If the equipment you received is not working, please report it immediately through the app's Help section or contact the staff."
    },
    {
        "question": "Can I get a replacement for faulty equipment?",
        "answer": "Yes, you can get a replacement for faulty equipment. Please report the issue through the app's Help section or contact the staff directly."
    },
    {
        "question": "How do I know if an equipment item is available?",
        "answer": "The app will show the current availability of each equipment item when you are browsing the Reservation section."
    },
    {
        "question": "What if the equipment is not available?",
        "answer": "If the equipment is not available, it means it's currently out of stock. You can check back later or choose a different item."
    },
    {
        "question": "Can I reserve equipment that is currently unavailable?",
        "answer": "No, you cannot reserve equipment that is currently unavailable. You will need to wait until it's back in stock."
    },
    {
        "question": "How can I check the current inventory of sports equipment?",
        "answer": "You can check the current inventory of sports equipment by browsing the Reservation section in the app. The availability of each item will be displayed."
    },
    {
        "question": "Can I reserve multiple items at the same time?",
        "answer": "Yes, you can reserve multiple items at the same time, but there may be limits to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "What is the maximum number of equipment items I can reserve?",
        "answer": "The maximum number of equipment items you can reserve may vary. Please check the reservation rules in the app for specific details."
    },
    {
        "question": "Are there specific hours for equipment bookings?",
        "answer": "Yes, equipment bookings can be made during the hours of 8:00 AM to 5:30 PM."
    },
    {
        "question": "Hi bro",
        "answer": "Hi there! 👋 Welcome to Campus Sports Sphere. What can I help you with?"
    },
    {
        "question": "Helllo",
        "answer": "Hey! 👋 I'm here to help with all your Campus Sports Sphere needs. What would you like to know?"
    },
    {
        "question": "Good morning",
        "answer": "Good morning! 🌞 I'm the Campus Sports Sphere Bot. How may I assist you today?"
    },
    {
        "question": "What's the process for handling defective sports equipment?",
        "answer": "If you encounter defective sports equipment, report it through the app or to staff immediately. Return the item and you'll be able to reserve a replacement if available."
    },
    {
        "question": "How can I check equipment availability?",
        "answer": "You can check equipment availability in real-time through the app. Each item will show its current stock status and available time slots."
    },
     {
        "question": "How do I create an account in the app?",
        "answer": "To create an account, go to the Sign-Up page and provide your student details, including your name, Student ID, and email. Choose a password and complete the registration process."
    },
    {
        "question": "What sports equipment can I reserve?",
        "answer": "You can reserve equipment for various sports including Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This includes items like balls, rackets, helmets, pads, gloves, and shuttlecocks."
    },
    {
        "question": "How do I reserve sports equipment?",
        "answer": "After signing in, go to the Home section in the Tab Navigator. Find the equipment you want to reserve and click the 'Reserve' button next to it. Select the duration, review the details, and confirm your reservation."
    },
    {
        "question": "What are the reservation hours for equipment?",
        "answer": "Equipment can be reserved from 8:00 AM to 5:30 PM."
    },
    {
        "question": "How long can I keep the reserved equipment?",
        "answer": "The duration of your reservation depends on what you select when making the reservation. You'll need to return the equipment by the end of your selected time slot."
    },
    {
        "question": "What happens if I don't return the equipment on time?",
        "answer": "You'll receive a notification when your reservation is about to expire. It's important to return the equipment on time to avoid any penalties and to allow other students to use it."
    },
    {
        "question": "Where can I see my current equipment reservations?",
        "answer": "Your current equipment reservations are displayed in your Profile tab within the app."
    },
    {
        "question": "What should I do if the equipment I received is faulty?",
        "answer": "If you receive faulty equipment, you should immediately report it through the app's Help and Support section or contact the staff directly. You can also write a query explaining the issue."
    },
    {
        "question": "How do I register for sports events?",
        "answer": "To register for sports events, go to the Events section in the Tab Navigator. Browse available events and click on the one you're interested in. Then, follow the registration process for that specific event."
    },
    {
        "question": "Can I see which events I've registered for?",
        "answer": "Yes, all the events you've registered for are displayed in your Profile tab."
    },
    {
        "question": "How are teams formed for events?",
        "answer": "Teams are formed based on the number of registered students and the requirements of each sport. For example, Cricket and Football teams have 11 players each, while Basketball teams have 5 players."
    },
    {
        "question": "Can I unregister from an event?",
        "answer": "Yes, you can unregister from an event by canceling it from your Profile section in the Tab Navigator."
    },
    {
        "question": "Can I register for past events?",
        "answer": "No, you cannot register for events that have already taken place."
    },
    {
        "question": "How long do sports matches usually last?",
        "answer": "The duration varies by sport. For example, Cricket matches generally last 2-3 hours, Football matches are 90 minutes, and other sports have their specific durations."
    },
    {
        "question": "What time are matches scheduled?",
        "answer": "Matches are scheduled between 8:30 AM and 5:30 PM."
    },
    {
        "question": "How can I reserve a Cricket ground?",
        "answer": "To reserve a Cricket ground, go to the Ground Reservation section. View available slots defined by the Event Manager, select your desired slot, and submit a reservation request. If approved, you'll receive a notification."
    },
    {
        "question": "Is there weather information available for ground reservations?",
        "answer": "Yes, when reserving a Cricket ground, you can view current weather information for COMSATS University Islamabad, including temperature and conditions."
    },
    {
        "question": "What happens if an equipment item is out of stock?",
        "answer": "If the quantity of a particular equipment item reaches zero, it will not be available for reservation until more are added to the inventory."
    },
    {
        "question": "How can I contact support if I have issues with the app?",
        "answer": "You can visit the Help and Support section in the app to find answers to common questions or to submit a query to the staff."
    },
    {
        "question": "Can staff see who has currently reserved equipment?",
        "answer": "Yes, staff members have access to view current equipment reservations and reservation history."
    },
    {
        "question": "How are recommended events determined for users?",
        "answer": "Recommended events are based on the priority sports you've selected in your profile or your past event participation history."
    },
    {
        "question": "Can the Event Manager modify scheduled events?",
        "answer": "Yes, the Event Manager can reschedule or delete events as needed."
    },
    {
        "question": "Are there restrictions on scheduling multiple matches?",
        "answer": "Yes, no two matches of the same sport can be scheduled at the same time."
    },
    {
        "question": "What happens if my ground reservation request is approved?",
        "answer": "If your ground reservation request is approved, you'll receive a notification, and the slot will be reserved for you. It will no longer be visible to other students for reservation."
    },
    {
        "question": "Can I reserve equipment for someone else?",
        "answer": "No, equipment reservations are personal and tied to your student account. You cannot reserve equipment for other students."
    },
    {
        "question": "Is there a limit to how many items I can reserve at once?",
        "answer": "The app may have limits on the number of items you can reserve simultaneously to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "How do I update my account information?",
        "answer": "You can update your account information in the Profile section of the app. Look for an 'Edit Profile' or 'Account Settings' option."
    },
    {
        "question": "What should I do if I forget my password?",
        "answer": "If you forget your password, look for a 'Forgot Password' link on the login page. Follow the instructions to reset your password using your registered email."
    },
    {
        "question": "Can I see the availability of equipment before making a reservation?",
        "answer": "Yes, the app should show you the current availability of each equipment item when you're browsing the Reservation section."
    },
    {
        "question": "How far in advance can I reserve equipment?",
        "answer": "The reservation window may vary. Check the app for specific rules, but typically you can reserve equipment a few days to a week in advance."
    },
    {
        "question": "What happens if I'm late returning equipment?",
        "answer": "Late returns may result in penalties or restrictions on future reservations. Always try to return equipment on time or extend your reservation if needed."
    },
    {
        "question": "Can I extend my equipment reservation?",
        "answer": "You may be able to extend your reservation if the equipment is not reserved by someone else immediately after your slot. Check for an 'Extend Reservation' option in your current reservations."
    },
    {
        "question": "How do I cancel an equipment reservation?",
        "answer": "To cancel a reservation, go to your Profile or Reservations section and look for a 'Cancel' option next to your active reservations."
    },
    {
        "question": "Are there any fees for reserving equipment?",
        "answer": "Most equipment reservations are likely free for students, but check the app or with the Sports Department for any potential fees or deposits required."
    },
    {
        "question": "How do I report lost or damaged equipment?",
        "answer": "If equipment is lost or damaged, report it immediately through the app's Help section or directly to the Sports Department staff."
    },
    {
        "question": "Can graduate students use the app to reserve equipment?",
        "answer": "The app is designed for university students. If you're a graduate student, you should be able to use it, but verify with your Sports Department if there are any restrictions."
    },
    {
        "question": "How do I view upcoming sports events?",
        "answer": "Go to the Events section in the app to view all upcoming sports events. You can usually filter or sort events by date or sport type."
    },
    {
        "question": "Can I suggest new equipment for the university to acquire?",
        "answer": "You may be able to suggest new equipment through the app's Feedback or Help section. Alternatively, contact the Sports Department directly with your suggestions."
    },
    {
        "question": "How are teams assigned for multi-player sports events?",
        "answer": "Teams are typically formed based on registrations. The Event Manager may assign teams randomly or based on skill levels, depending on the event type."
    },
    {
        "question": "Can I choose my teammates for events?",
        "answer": "For most events, teams are assigned by the Event Manager. Some events might allow you to register as a pre-formed team, but check the specific event details."
    },
    {
        "question": "What happens if not enough players register for a team sport?",
        "answer": "If there aren't enough registrations, the event might be canceled or postponed. The Event Manager will notify registered players of any changes."
    },
    {
        "question": "How do I know if I've been selected for a team?",
        "answer": "You'll receive a notification through the app once teams have been formed. You can also check your Profile or the event details for team assignments."
    },
    {
        "question": "Can I participate in multiple events on the same day?",
        "answer": "You can register for multiple events, but be aware of potential time conflicts. The app should warn you if you're registering for overlapping events."
    },
    {
        "question": "How do I view the schedule of matches I'm participating in?",
        "answer": "Check your Profile section or the Events tab for a schedule of matches you're participating in. You should see dates, times, and locations for each match."
    },
    {
        "question": "What should I do if I can't attend a match I've registered for?",
        "answer": "If you can't attend a match, notify the Event Manager as soon as possible through the app. Look for an option to withdraw from the event or contact support."
    },
    {
        "question": "Can I reserve a ground for personal practice?",
        "answer": "Ground reservations are typically for organized events or matches. Check with the Sports Department if personal practice reservations are allowed."
    },
    {
        "question": "How far in advance are event schedules posted?",
        "answer": "Event schedules are usually posted several days to weeks in advance. Regular check the Events section for updates on upcoming events."
    },
    {
        "question": "Can I get notifications for new event postings?",
        "answer": "Yes, you should be able to set up notifications in the app settings to alert you when new events are posted or when registration opens."
    },
    {
        "question": "What information is shown in the weather API for ground reservations?",
        "answer": "The weather API typically shows current temperature, weather conditions (sunny, cloudy, rainy, etc.), and possibly a short-term forecast for the COMSATS University Islamabad area."
    },
    {
        "question": "How accurate is the weather information provided?",
        "answer": "The weather information is based on real-time data from a reliable weather service, but as with all weather forecasts, it's subject to change."
    },
    {
        "question": "Can I see past reservation history for equipment?",
        "answer": "Your past reservation history should be available in your Profile section. This can help you track your equipment usage over time."
    },
    {
        "question": "Is there a rating system for equipment quality?",
        "answer": "The app may include a feature for rating equipment quality after use. Check your reservation history or equipment details for any rating options."
    },
    {
        "question": "How do I report a bug in the app?",
        "answer": "To report a bug, use the Help and Support section in the app. Look for an option to report technical issues or bugs."
    },
    {
        "question": "Can I use the app on both iOS and Android devices?",
        "answer": "The app should be available for both iOS and Android devices. Download it from your device's app store."
    },
    {
        "question": "Is there a desktop version of the app?",
        "answer": "The app is primarily designed for mobile devices. Check with the university if there's a web version available for desktop use."
    },
    {
        "question": "How secure is my personal information in the app?",
        "answer": "The app uses standard security measures to protect your personal information. Always keep your login credentials private and use a strong, unique password."
    },
    {
        "question": "Can I link my Student ID to the app?",
        "answer": "Your Student ID is likely linked to your account during registration. Contact support if you need to update or verify your Student ID in the app."
    },
    {
        "question": "How do I update my sports preferences for event recommendations?",
        "answer": "Go to your Event tab and look for an option to update your sports preferences or interests. This will help tailor event recommendations to your liking."
    },
    {
        "question": "Can I see who else is registered for an event?",
        "answer": "For privacy reasons, you might not be able to see other registrants. However, you may be able to see team assignments once they're made."
    },
    {
        "question": "Is there a waitlist for popular events?",
        "answer": "Popular events may have a waitlist feature. If an event is full, look for an option to join the waitlist in case spots open up."
    },
    {
        "question": "How do I know if an event I registered for is canceled?",
        "answer": "You'll receive a notification if an event you're registered for is canceled. Always check the app for the most up-to-date event information."
    },
    {
        "question": "Can I request specific equipment for an event?",
        "answer": "Equipment for events is typically standardized. If you need specific equipment, contact the Event Manager or Sports Department directly."
    },
    {
        "question": "How do I view the rules for different sports events?",
        "answer": "Event rules should be available in the event details section. Look for a 'Rules' or 'Event Info' tab when viewing an event."
    },
    {
        "question": "Is there a feature to find teammates or opponents for practice matches?",
        "answer": "The app may have a community or social feature to connect with other players. Check for a 'Community' or 'Find Players' section."
    },
    {
        "question": "How do I track my sports performance in the app?",
        "answer": "The app currently does not have a performance tracking feature. It will be added in a future update."
    },
    {
        "question": "Can I get reminders for my equipment return deadlines?",
        "answer": "Yes, the app should send you notifications reminding you of upcoming equipment return deadlines."
    },
    {
        "question": "How do I provide feedback on the app's features?",
        "answer": "Use the Help and Support section to provide feedback. There may be a specific 'Feedback' or 'Suggestions' option."
    },
    {
        "question": "Is there a chat feature to communicate with other players or staff?",
        "answer": "Check if the app has a messaging or chat feature. This could be useful for communicating with staff only."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is likely updated in real-time as reservations are made and items are returned. Staff may also perform regular inventory checks."
    },
    {
        "question": "How do I find information about accessibility features for sports facilities?",
        "answer": "Look for an 'Help and Support' section that provides information on accessible features of sports grounds and equipment."
    },
    {
        "question": "Can I see a list of sports equipment that's suitable for beginners?",
        "answer": "Our list of sports equipments are for every student !."
    },
    {
        "question": "Is there a feature to create and share sports challenge videos with other users?",
        "answer": "No there are no such feature available in the app rightnow."
    },

    {
        "question": "Can I see a list of sports equipment that's designed for use in extreme temperatures?",
        "answer": "Look for an 'Extreme Weather Gear' or 'All-Climate Equipment' section that highlights sports equipment suitable for very hot or cold conditions."
    },
       {
        "question": "What's the process for signing up on the Sports Sphere app?",
        "answer": "To sign up, navigate to the registration page and enter your student information, including your full name, student identification number, and university email address. Choose a secure password, then complete the registration process by following the on-screen instructions."
    },
    {
        "question": "Which sports gear can I book through the app?",
        "answer": "The app allows you to book a wide range of sports equipment, including items for Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This covers various items such as balls, bats, rackets, protective gear, and more."
    },
    {
        "question": "How do I go about booking sports equipment on the app?",
        "answer": "After logging in, navigate to the home tab. Browse the available equipment, select the item you want, and tap the 'Book' button. Choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "What are the operating hours for equipment bookings?",
        "answer": "You can make equipment bookings from 8:00 AM until 5:30 PM."
    },
     {
        "question": "How do I register for a sports event?",
        "answer": "To register for a sports event: 1) Open the app and go to the 'Events' section, 2) Browse available events, 3) Select the event you're interested in, 4) Click 'Register' or 'Sign Up', 5) Fill in any required information, 6) Confirm your registration. You'll receive a confirmation notification once you're registered."
    },
    {
        "question": "What's the process for signing up for a sports tournament?",
        "answer": "To sign up for a sports tournament: First, log into the app and navigate to the Events tab. Browse the list of upcoming tournaments, select the one you want to join, and click on the registration button. Follow the prompts to complete your registration, which may include providing some personal information or forming a team."
    },
    {
        "question": "Can you explain how to join a campus sports event?",
        "answer": "Joining a campus sports event is easy! Just open the app, go to the Events section, and find the event you're interested in. Click on it for more details, then look for a 'Join' or 'Register' button. Follow the steps to complete your registration, which might include choosing your role (player, spectator, etc.) or joining a team."
    },
    {
        "question": "What steps do I need to follow to participate in a sports competition?",
        "answer": "To participate in a sports competition: 1) Open the app, 2) Go to 'Events' or 'Competitions', 3) Find the competition you want to join, 4) Click for more details, 5) Hit the 'Participate' or 'Register' button, 6) Fill out any required forms or information, 7) Submit your registration. You'll get a confirmation once you're successfully registered."
    },
    {
        "question": "How can I sign up for upcoming sports events on campus?",
        "answer": "Signing up for upcoming sports events is simple: Open the Campus Sports Sphere app and head to the Events section. You'll see a list of upcoming events. Choose the one you're interested in, tap on it, and look for the registration option. Follow the prompts to complete your sign-up, which may include selecting your preferred role or team."
    },

    # Ground Reservation Process
    {
        "question": "How do I reserve a sports ground?",
        "answer": "To reserve a sports ground: 1) Log into the app, 2) Go to 'Ground Reservations', 3) Select the type of ground you need (e.g., cricket field, football pitch), 4) Choose an available date and time slot, 5) Review the reservation details, 6) Confirm your booking. You'll receive a confirmation once your reservation is approved."
    },
    {
        "question": "What's the process for booking a sports field?",
        "answer": "To book a sports field, start by opening the app and navigating to the 'Facilities' or 'Ground Booking' section. Choose the type of field you need, then select an available date and time slot. Review the booking details, including any fees or rules, and confirm your reservation. You'll get a notification when your booking is approved."
    },
    {
        "question": "Can you explain how to reserve a playing ground on campus?",
        "answer": "Reserving a playing ground is straightforward: Open the app and find the 'Ground Reservations' section. Select the type of ground you need (like a football field or basketball court). Browse available time slots and pick one that works for you. Review any rules or fees, then confirm your reservation. You'll receive an approval notification soon after."
    },
    {
        "question": "What steps do I need to follow to book a sports court?",
        "answer": "To book a sports court: 1) Open the app, 2) Navigate to 'Facility Bookings' or 'Court Reservations', 3) Choose the type of court you need, 4) Select an available date and time, 5) Review any rules or fees associated with the booking, 6) Confirm your reservation. You'll get a confirmation message once your booking is processed."
    },
    {
        "question": "How can I reserve a pitch for my team practice?",
        "answer": "To reserve a pitch for team practice: First, log into the app and go to the 'Ground Bookings' section. Select the type of pitch you need (e.g., football, cricket). Choose from the available dates and times that suit your team's schedule. Review any usage rules or fees, then confirm your booking. You'll receive a notification when your reservation is approved."
    },
    {
        "question": "What's the procedure for securing a sports ground for an event?",
        "answer": "To secure a sports ground for an event: Open the app and navigate to 'Facility Reservations'. Select 'Sports Grounds' and choose the specific type you need. Pick an available date and time slot that fits your event schedule. You may need to provide event details. Review any rules or fees, then submit your reservation request. Approval notification will be sent to you once processed."
    },
    {
        "question": "How do I go about reserving an outdoor court for a game?",
        "answer": "To reserve an outdoor court: 1) Open the app, 2) Go to 'Court Bookings', 3) Select 'Outdoor Courts', 4) Choose the specific court type (e.g., tennis, basketball), 5) Pick an available date and time, 6) Review any usage guidelines or fees, 7) Confirm your reservation. You'll receive a booking confirmation once it's approved."
    },
    {
        "question": "Can you walk me through the process of booking a sports field on campus?",
        "answer": "Sure! Here's how to book a sports field: Open the Campus Sports Sphere app and find the 'Facility Bookings' section. Choose 'Sports Fields' and select the type you need (e.g., soccer field, cricket pitch). Browse the calendar for available slots and pick a suitable time. Review any rules or fees associated with the booking. Finally, confirm your reservation. You'll get a notification when your booking is approved."
    },
     {
        "question": "How do I register for sports events?",
        "answer": "To register for sports events, go to the events section in the tab navigator. Browse available events and click on the one you're interested in. Then, follow the registration process for that specific event."
    },
    {
        "question": "What's the process for signing up for sports tournaments?",
        "answer": "To sign up for sports tournaments, navigate to the events tab in the app. Browse the list of upcoming tournaments, select the one you're interested in, and follow the registration steps provided for that specific event."
    },
    {
        "question": "Can you explain how to join a sports event using the app?",
        "answer": "To join a sports event: 1) Open the app and go to the events section, 2) Browse through the list of available events, 3) Select the event you want to join, 4) Click on the registration button, 5) Fill out any required information, and 6) Confirm your registration. You'll receive a confirmation once you're successfully registered."
    },
    {
        "question": "How can I sign up for a sports event through the app?",
        "answer": "To sign up for a sports event: Open the app, navigate to the events section, browse the available events, select the event you're interested in, follow the registration steps, and confirm your registration."
    },
    {
        "question": "What steps do I need to follow to register for a sports event?",
        "answer": "To register for a sports event: 1) Open the app and go to the events tab, 2) Browse the list of available events, 3) Select the event you want to register for, 4) Follow the registration steps, 5) Confirm your registration. You will receive a confirmation notification."
    },
    {
        "question": "Could you walk me through the event registration process on the app?",
        "answer": "Sure! To register for an event: First, open the app and go to the events section. Browse the list of available events, select the one you want to join, click on the registration button, fill out any required information, and confirm your registration. You'll receive a confirmation message once it's done."
    },
    {
        "question": "I need to register for a sports event. How do I do that in the app?",
        "answer": "To register for a sports event: 1) Open the app and log in, 2) Navigate to the events section, 3) Browse the list of available events, 4) Select the event you want to register for, 5) Follow the registration steps, 6) Confirm your registration. You'll get a confirmation notification shortly after."
    },
     {
        "question": "How do I reserve a cricket ground?",
        "answer": "To reserve a cricket ground, go to the ground reservation section. View available slots defined by the event manager, select your desired slot, and submit a reservation request. If approved, you'll receive a notification."
    },
    {
        "question": "What's the process for booking a cricket field?",
        "answer": "To book a cricket field: Navigate to the field reservation section in the app, check the available time slots set by the event manager, choose your preferred slot, and submit a booking request. You'll receive a notification if your request is approved."
    },
    {
        "question": "Can you explain how to reserve a cricket ground using the app?",
        "answer": "To reserve a cricket ground: 1) Open the app and go to the ground reservation section, 2) View the list of available time slots, 3) Select your desired date and time, 4) Submit your reservation request, 5) Wait for approval—you'll receive a notification once your request is processed."
    },
    {
        "question": "How can I book a cricket field through the app?",
        "answer": "To book a cricket field, open the app and go to the ground reservation section. View the available time slots, choose the one that suits you, submit your booking request, and wait for approval. You'll get a notification once it's confirmed."
    },
    {
        "question": "What steps do I need to follow to reserve a cricket ground?",
        "answer": "To reserve a cricket ground: 1) Log into the app, 2) Navigate to the ground reservation section, 3) View the available time slots, 4) Select your preferred slot, 5) Submit a reservation request. You will receive a notification if your request is approved."
    },
    {
        "question": "Could you walk me through the cricket ground reservation process on the app?",
        "answer": "Sure! To reserve a cricket ground: First, open the app and go to the ground reservation section. View the available time slots, select the one you want, submit your reservation request, and wait for approval. You'll receive a notification once it's confirmed."
    },
    {
        "question": "I need to reserve a cricket field. How do I do that in the app?",
        "answer": "To reserve a cricket field: 1) Open the app and log in, 2) Go to the ground reservation section, 3) View the available time slots, 4) Select the one that suits you, 5) Submit your reservation request, 6) Wait for approval. You'll get a notification once it's confirmed."
    },
    {
        "question": "Is there a time limit on equipment rentals?",
        "answer": "The rental duration is based on the time slot you select when making your booking. You need to return the equipment before your chosen time slot ends."
    },
    {
        "question": "Are there consequences for late equipment returns?",
        "answer": "The app will send you a reminder when your booking is close to expiring. It's crucial to return equipment on time to avoid any penalties and to ensure other students can use the equipment as scheduled."
    },
    {
        "question": "Where can I find a list of my current equipment bookings?",
        "answer": "Your active equipment bookings are listed in the profile section of the app."
    },
    {
        "question": "What should I do if I receive damaged equipment?",
        "answer": "If you receive damaged equipment, report it immediately via the app's support section or contact the sports department staff directly. You can also submit a detailed query explaining the issue."
    },
    {
        "question": "How can I sign up for sports tournaments?",
        "answer": "To sign up for sports tournaments, go to the events tab. Browse the list of upcoming tournaments, select the one you're interested in, and follow the registration steps provided for that specific event."
    },
    {
        "question": "Is there a way to view the tournaments I've signed up for?",
        "answer": "Yes, all the tournaments you've registered for are displayed in your profile section."
    },
    {
        "question": "How are sports teams assembled for tournaments?",
        "answer": "Teams are formed based on the number of registered participants and the requirements of each sport. For instance, cricket and football teams have 11 players each, while basketball teams consist of 5 players."
    },
    {
        "question": "Can I withdraw from a tournament I've signed up for?",
        "answer": "Yes, you can withdraw from a tournament by canceling your registration in the profile section of the app."
    },
    {
        "question": "Is it possible to register for tournaments that have already occurred?",
        "answer": "No, registration is not available for tournaments that have already taken place."
    },
    {
        "question": "What's the typical duration of sports matches?",
        "answer": "Match duration varies by sport. For example, cricket matches usually last 2-3 hours, football matches are 90 minutes, and other sports have their specific durations."
    },
    {
        "question": "When are sports matches typically scheduled?",
        "answer": "Sports matches are usually scheduled between 8:30 AM and 5:30 PM."
    },
    {
        "question": "What's the procedure for booking a cricket field?",
        "answer": "To book a cricket field, go to the field reservation section. Check the available time slots set by the event manager, choose your preferred slot, and submit a booking request. You'll receive a notification if your request is approved."
    },
     {
        "question": "Is this app exclusive to COMSATS Islamabad students?",
        "answer": "Yes, this app is exclusively for students of COMSATS University Islamabad (CUI). It's not available for use by students from other institutions."
    },
    {
        "question": "Can COMSATS Lahore students use this app?",
        "answer": "No, this app is specifically for COMSATS University Islamabad campus. Students from other COMSATS campuses, including Lahore, cannot use this app for sports facilities or equipment reservations."
    },
    {
        "question": "Does this app cover sports events at all COMSATS branches?",
        "answer": "No, this app only covers sports events and facilities at the COMSATS University Islamabad campus. It doesn't include information about events at other COMSATS branches."
    },
    {
        "question": "Is there a similar app for other COMSATS campuses?",
        "answer": "This app is specific to COMSATS University Islamabad. Other COMSATS campuses may have their own systems, but this particular app is only for the Islamabad campus."
    },
    {
        "question": "Can I use this app if I'm a COMSATS Islamabad distance learning student?",
        "answer": "This app is primarily for on-campus students at COMSATS University Islamabad. Distance learning students should check with the sports department about their eligibility to use the app and access sports facilities."
    },
    {
        "question": "Does this app handle inter-COMSATS sports competitions?",
        "answer": "No, this app is focused on internal sports events and facilities at COMSATS University Islamabad. It doesn't manage inter-COMSATS competitions."
    },
    {
        "question": "Can faculty members at COMSATS Islamabad use this app?",
        "answer": "This app is primarily designed for COMSATS University Islamabad students. Faculty members should check with the sports department about their access to the app and sports facilities."
    },
    {
        "question": "Is this app linked to the main COMSATS University Islamabad website?",
        "answer": "While this app is official for COMSATS University Islamabad sports, it may not be directly linked to the main university website. It's a standalone app for sports management."
    },
    {
        "question": "How do I unregister from a sports event I signed up for?",
        "answer": "To unregister from a sports event, go to your profile or the 'My Events' section in the app, find the event you want to cancel, and look for an 'Unregister' or 'Cancel Registration' option."
    },
    {
        "question": "Can I cancel my registration for a CUI sports event?",
        "answer": "Yes, you can cancel your registration for a COMSATS University Islamabad sports event. Navigate to the event in your profile or 'My Events' section and use the cancellation option provided."
    },
    {
        "question": "What's the process to withdraw from a sports event I've registered for?",
        "answer": "To withdraw from a sports event, open the app, go to your profile or 'My Events' section, locate the event you want to withdraw from, and select the 'Withdraw' or 'Cancel Registration' option."
    },
    {
        "question": "Is there a deadline for cancelling event registration?",
        "answer": "Yes, there may be a deadline for cancelling event registrations. Check the event details in the app for specific cancellation policies and deadlines."
    },
    {
        "question": "How late can I unregister from a COMSATS sports event?",
        "answer": "The deadline for unregistering from a COMSATS University Islamabad sports event may vary. Check the event details in the app for the specific cancellation deadline."
    },
    {
        "question": "Will I be penalized for cancelling my sports event registration?",
        "answer": "Penalties for cancelling sports event registrations may depend on the specific event and when you cancel. Check the event policies in the app for details on any potential penalties."
    },
    {
        "question": "Can I get a refund if I unregister from a paid sports event?",
        "answer": "Refund policies for paid sports events may vary. Check the event details in the app or contact the COMSATS University Islamabad sports department for information on refunds for cancelled registrations."
    },
    {
        "question": "How do I cancel multiple event registrations at once?",
        "answer": "To cancel multiple event registrations, you'll likely need to cancel each one individually. Go to your profile or 'My Events' section and cancel each event registration one by one."
    },
    {
        "question": "What happens if I forget to unregister from a COMSATS sports event?",
        "answer": "If you forget to unregister from a COMSATS University Islamabad sports event, you may be marked as a no-show. This could affect your ability to register for future events. Always try to cancel if you can't attend."
    },
    {
        "question": "Can someone else cancel my sports event registration for me?",
        "answer": "Generally, you should cancel your own registrations through your account. If you're unable to do so, contact the COMSATS University Islamabad sports department for assistance."
    },
    {
        "question": "Is there an automatic cancellation if I don't show up to an event?",
        "answer": "There's typically no automatic cancellation for no-shows. If you can't attend an event you've registered for, make sure to cancel your registration through the app to avoid any penalties."
    },
    {
        "question": "How will I know if my event cancellation was successful?",
        "answer": "After cancelling your registration, you should receive a confirmation message in the app. You can also check your profile or 'My Events' section to ensure the event no longer appears in your registered events."
    },
    {
        "question": "Can I re-register for an event after cancelling my registration?",
        "answer": "Depending on the event and available spots, you may be able to re-register after cancelling. Check the event in the app to see if registration is still open."
    },
    {
        "question": "Will cancelling an event registration affect my chances for future events?",
        "answer": "Frequent cancellations might affect your registration privileges for future COMSATS University Islamabad sports events. Try to only register for events you're sure you can attend."
    },
    {
        "question": "Is this app affiliated with any other universities besides COMSATS Islamabad?",
        "answer": "No, this app is not affiliated with any other universities. It's exclusively for sports management at COMSATS University Islamabad."
    },
    {
        "question": "Can students from NUST use this app for COMSATS sports facilities?",
        "answer": "No, students from other universities, including NUST, cannot use this app. It's exclusively for COMSATS University Islamabad students."
    },
    {
        "question": "Does this app show sports events happening at COMSATS Abbottabad?",
        "answer": "No, this app only shows sports events for COMSATS University Islamabad. It doesn't include events from other COMSATS campuses like Abbottabad."
    },
    {
        "question": "Can I use this app to book sports equipment at any COMSATS campus?",
        "answer": "This app is only for booking sports equipment at COMSATS University Islamabad. It can't be used for equipment reservations at other COMSATS campuses."
    },
    {
        "question": "Is this the official sports management app for all COMSATS universities?",
        "answer": "No, this is the official sports management app specifically for COMSATS University Islamabad. Other COMSATS campuses may have their own systems."
    },
     {
        "question": "Does this app handle HEC sports events?",
        "answer": "No, this app only deals with sports events and equipment reservations for COMSATS University Islamabad (CUI). It doesn't handle HEC sports events."
    },
    {
        "question": "Can I use this app to register for inter-university HEC tournaments?",
        "answer": "No, this app is specifically for COMSATS University Islamabad's internal sports events and equipment reservations. It doesn't handle HEC or inter-university tournaments."
    },
     {
        "question": "How do I unregister from a sports event?",
        "answer": "You can unregister from a sports event by canceling your registration in the Profile section of the app."
    },
    {
        "question": "Can I cancel my registration for a sports tournament?",
        "answer": "Yes, you can cancel your registration for a sports tournament by going to your Profile section in the app and selecting the 'Cancel' option next to your active registrations."
    },
       {
        "question": "Is this app only for COMSATS University Islamabad students?",
        "answer": "Yes, this app is specifically designed for COMSATS University Islamabad (CUI) students to manage sports equipment reservations and event registrations."
    },
    {
        "question": "Can students from other universities use this app for CUI sports facilities?",
        "answer": "No, this app is exclusively for COMSATS University Islamabad (CUI) students. Other university students cannot use it to access CUI sports facilities."
    },
    {
        "question": "Does this app cover all COMSATS campuses or just Islamabad?",
        "answer": "This app is specifically for the COMSATS University Islamabad campus. It doesn't cover sports facilities at other COMSATS campuses."
    },
    {
        "question": "I'm a CUI student. Can I use this app to book sports equipment?",
        "answer": "Yes, as a CUI (COMSATS University Islamabad) student, you can use this app to reserve sports equipment, book facilities, and register for campus sports events."
    },
    {
        "question": "Is this the official sports app for COMSATS University Islamabad?",
        "answer": "Yes, this is the official sports app for COMSATS University Islamabad (CUI), designed to manage sports equipment reservations and event registrations for CUI students."
    },
    {
        "question": "Can COMSATS Islamabad alumni use this app?",
        "answer": "This app is designed for current COMSATS University Islamabad students. Alumni might not have access, but you can check with the university's sports department for any alumni sports programs."
    },
    {
        "question": "Does the app show sports events happening at other COMSATS campuses?",
        "answer": "No, this app only shows sports events and facilities for the COMSATS University Islamabad campus. It doesn't include information about other COMSATS campuses."
    },
       {
        "question": "How do I view my current equipment reservations?",
        "answer": "You can view your current equipment reservations in the Profile tab within the app."
    },
    {
        "question": "Where can I see the equipment I've reserved?",
        "answer": "Your reserved equipment can be seen in the Profile section of the app."
    },
    {
        "question": "Is there a way to check my active reservations?",
        "answer": "Yes, you can check your active reservations by going to the Profile tab in the app."
    },
    {
        "question": "How do I cancel an equipment reservation?",
        "answer": "To cancel a reservation, go to your Profile or Reservations section and look for a 'Cancel' option next to your active reservations."
    },
    {
        "question": "Can I cancel my equipment booking?",
        "answer": "Yes, you can cancel your equipment booking. Navigate to the Profile or Reservations section and look for a cancellation option for your active reservations."
    },
    {
        "question": "What's the process to cancel a reservation I've made?",
        "answer": "To cancel a reservation, go to your Profile section, find the reservation you want to cancel, and select the 'Cancel' option."
    },
    {
        "question": "How do I register for sports events?",
        "answer": "To register for sports events, go to the Events section in the tab navigator. Browse available events and click on the one you're interested in. Then, follow the registration process for that specific event."
    },
    {
        "question": "What's the process for signing up for a sports event?",
        "answer": "To sign up for a sports event, navigate to the Events section, find the event you're interested in, click on it, and follow the registration steps provided."
    },
    {
        "question": "How can I join a sports event using the app?",
        "answer": "You can join a sports event by going to the Events section, selecting the event you want to join, and following the registration process."
    },
    {
        "question": "Can I see which events I've registered for?",
        "answer": "Yes, all the events you've registered for are displayed in your Profile tab."
    },
    {
        "question": "Where can I view the events I've signed up for?",
        "answer": "You can view the events you've signed up for in your Profile section of the app."
    },
    {
        "question": "Is there a way to check my event registrations?",
        "answer": "Yes, you can check your event registrations by going to your Profile tab in the app."
    },
    {
        "question": "How do I unregister from an event?",
        "answer": "You can unregister from an event by canceling it from your Profile section in the tab navigator."
    },
    {
        "question": "Can I cancel my registration for an event?",
        "answer": "Yes, you can cancel your event registration. Go to your Profile section and look for an option to cancel or unregister from the event."
    },
    {
        "question": "What's the process to withdraw from an event I've registered for?",
        "answer": "To withdraw from an event, navigate to your Profile section, find the event you want to unregister from, and select the cancellation option."
    },
    {
        "question": "How do I view the schedule of matches I'm participating in?",
        "answer": "Check your Profile section or the Events tab for a schedule of matches you're participating in. You should see dates, times, and locations for each match."
    },
    {
        "question": "Where can I find the schedule for my matches?",
        "answer": "You can find your match schedule in either your Profile section or the Events tab of the app."
    },
    {
        "question": "Is there a way to see when and where my matches are scheduled?",
        "answer": "Yes, you can view your match schedule, including dates, times, and locations, in your Profile section or the Events tab."
    },
    {
        "question": "How do I reset my password if I forget it?",
        "answer": "If you forget your password, look for a 'Forgot Password' link on the login page. Follow the instructions to reset your password using your registered email."
    },
    {
        "question": "What should I do if I can't remember my password?",
        "answer": "If you can't remember your password, use the 'Forgot Password' option on the login page and follow the instructions to reset it via your registered email."
    },
    {
        "question": "Is there a way to recover my account if I forget my password?",
        "answer": "Yes, you can recover your account by using the 'Forgot Password' feature on the login page. You'll receive instructions to reset your password via email."
    },
    {
        "question": "How far in advance can I reserve equipment?",
        "answer": "The reservation window may vary. Check the app for specific rules, but typically you can reserve equipment a few days to a week in advance."
    },
    {
        "question": "What's the earliest I can book equipment?",
        "answer": "The earliest you can book equipment depends on the app's rules. Generally, you can make reservations a few days to a week in advance, but check the app for specific details."
    },
    {
        "question": "Is there a limit on how early I can reserve sports gear?",
        "answer": "There may be a limit on how early you can reserve sports gear. The app typically allows reservations a few days to a week in advance, but check for specific rules."
    },
    {
        "question": "What happens if I'm late returning equipment?",
        "answer": "Late returns may result in penalties or restrictions on future reservations. Always try to return equipment on time or extend your reservation if needed."
    },
    {
        "question": "Are there penalties for returning equipment late?",
        "answer": "Yes, there may be penalties for late equipment returns. These could include restrictions on future reservations. It's best to return equipment on time or extend your reservation if necessary."
    },
    {
        "question": "What should I do if I can't return the equipment on time?",
        "answer": "If you can't return the equipment on time, try to extend your reservation. If that's not possible, return it as soon as you can, but be aware that there may be penalties for late returns."
    },
    {
        "question": "Can I extend my equipment reservation?",
        "answer": "You may be able to extend your reservation if the equipment is not reserved by someone else immediately after your slot. Check for an 'Extend Reservation' option in your current reservations."
    },
    {
        "question": "Is it possible to keep the equipment for longer than I initially reserved?",
        "answer": "It might be possible to extend your reservation if the equipment isn't booked immediately after your slot. Look for an 'Extend Reservation' option in your current reservations."
    },
    {
        "question": "How do I request more time with the equipment I've reserved?",
        "answer": "To request more time with reserved equipment, check your current reservations for an 'Extend Reservation' option. This may be possible if the equipment isn't booked right after your slot."
    },
    {
        "question": "Can I use my CUI student ID to log into this app?",
        "answer": "Yes, you can use your COMSATS University Islamabad (CUI) student ID to log into this app and access its features."
    },
    {
        "question": "Is this app connected to the CUI main website?",
        "answer": "While the app is associated with COMSATS University Islamabad, it operates independently to manage sports-related activities and equipment reservations."
    },
    {
        "question": "What steps do I need to follow to cancel my event registration?",
        "answer": "To cancel your event registration: 1) Open the app, 2) Go to your Profile section, 3) Find the event you're registered for, 4) Select the 'Cancel' option. You will receive a confirmation once your registration is canceled."
    },
    {
        "question": "How do I withdraw from a sports competition I've registered for?",
        "answer": "To withdraw from a sports competition: 1) Open the app, 2) Go to your Profile section, 3) Find the competition you're registered for, 4) Click on the 'Cancel' or 'Withdraw' option. You'll get a confirmation notification once it's processed."
    },
    {
        "question": "Can I change my mind after registering for an event?",
        "answer": "Yes, you can change your mind and cancel your registration. Go to your Profile section in the app, find the event you're registered for, and select the 'Cancel' option."
    },
    {
        "question": "What happens if I cancel my event registration?",
        "answer": "If you cancel your event registration, you will no longer be listed as a participant for that event. You'll receive a confirmation notification once your cancellation is processed."
    },
    {
        "question": "How do I remove myself from an event I've signed up for?",
        "answer": "To remove yourself from an event: Open the app, go to your Profile section, find the event you're registered for, and click on the 'Cancel' or 'Remove' option."
    },
    {
        "question": "Is there a deadline to cancel my event registration?",
        "answer": "Check the event details in the app for any specific deadlines or rules related to canceling your registration. Generally, you can cancel up until the event starts or as specified by the event organizer."
    },
    {
        "question": "Does the app cover HEC sports facilities?",
        "answer": "No, this app only covers sports facilities and equipment at COMSATS University Islamabad (CUI). It doesn't include HEC or other external sports facilities."
    },
    {
        "question": "Is there a separate app for HEC sports events?",
        "answer": "This app is only for COMSATS University Islamabad sports events and equipment. For HEC sports events, you would need to check with HEC directly or your university's sports department."
    },
    {
        "question": "Can I use this app to book facilities for HEC sports competitions?",
        "answer": "No, this app is exclusively for booking facilities and equipment at COMSATS University Islamabad. It doesn't handle bookings for HEC sports competitions."
    },
    {
        "question": "Does this app show results of HEC sports competitions?",
        "answer": "No, this app doesn't show results of HEC sports competitions. It's focused on COMSATS University Islamabad's internal sports activities and equipment management."
    },
    {
        "question": "Do I need a special COMSATS Islamabad sports ID to use this app?",
        "answer": "You typically use your regular COMSATS University Islamabad student ID to access this app. There's no special sports ID required."
    },
    {
        "question": "Can COMSATS Islamabad alumni access this app for old boys' matches?",
        "answer": "This app is primarily for current COMSATS University Islamabad students. Alumni access for old boys' matches would need to be arranged through the sports department."
    },
    {
        "question": "Is weather information provided for field bookings?",
        "answer": "Yes, when booking a cricket field, you can view current weather information for COMSATS University Islamabad, including temperature and weather conditions."
    },
    {
        "question": "What happens if the sports equipment I want is unavailable?",
        "answer": "If a particular piece of equipment is out of stock (quantity reaches zero), it won't be available for booking until more units are added to the inventory."
    },
    {
        "question": "How can I get help if I encounter issues with the app?",
        "answer": "You can access the Help and Support section in the app to find answers to common questions or to submit a query to the staff."
    },
    {
        "question": "Can staff members see who has currently booked equipment?",
        "answer": "Yes, staff members have access to view current equipment bookings and booking history."
    },
    {
        "question": "How are suggested tournaments chosen for users?",
        "answer": "Suggested tournaments are based on the priority sports you've selected in your profile or your past tournament participation history."
    },
      {
        "question": "Can you explain the process of equipment reservations?",
        "answer": "To reserve equipment, navigate to the home tab, select the equipment you want, choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "Is there a way to know how many of each equipment are left?",
        "answer": "Yes, the app displays the current quantity available for each equipment item when you're making a reservation."
    },
    {
        "question": "What if there's not enough equipment for everyone?",
        "answer": "The app manages reservations on a first-come, first-served basis. If an item is in high demand, consider reserving early or choosing alternative time slots or equipment."
    },
      {
        "question": "Is this app for COMSATS University Islamabad students only?",
        "answer": "Yes, this app is specifically designed for COMSATS University Islamabad (CUI) students to manage sports equipment reservations and event registrations."
    },
    {
        "question": "Can students from other universities use this app for CUI sports facilities?",
        "answer": "No, this app is exclusively for COMSATS University Islamabad (CUI) students. Other university students cannot use it to access CUI sports facilities."
    },
    {
        "question": "Does this app cover all COMSATS campuses or just Islamabad?",
        "answer": "This app is specifically for the COMSATS University Islamabad campus. It doesn't cover sports facilities at other COMSATS campuses."
    },
    {
        "question": "I'm a CUI student. Can I use this app to book sports equipment?",
        "answer": "Yes, as a CUI (COMSATS University Islamabad) student, you can use this app to reserve sports equipment, book facilities, and register for campus sports events."
    },
    {
        "question": "Does this app handle HEC sports events?",
        "answer": "No, this app only deals with sports events and equipment reservations for COMSATS University Islamabad (CUI). It doesn't handle HEC sports events."
    },
    {
        "question": "Can I use this app to register for inter-university HEC tournaments?",
        "answer": "No, this app is specifically for COMSATS University Islamabad's internal sports events and equipment reservations. It doesn't handle HEC or inter-university tournaments."
    },
    {
        "question": "Does the app cover HEC sports facilities?",
        "answer": "No, this app only covers sports facilities and equipment at COMSATS University Islamabad (CUI). It doesn't include HEC or other external sports facilities."
    },
    {
        "question": "Is there a separate app for HEC sports events?",
        "answer": "This app is only for COMSATS University Islamabad sports events and equipment. For HEC sports events, you would need to check with HEC directly or your university's sports department."
    },
    {
        "question": "Can COMSATS students from other campuses use this app?",
        "answer": "This app is specifically for students at the COMSATS University Islamabad campus. Students from other COMSATS campuses cannot use it for sports facilities or equipment reservations."
    },
    {
        "question": "Is this the official sports app for CUI?",
        "answer": "Yes, this is the official sports app for COMSATS University Islamabad (CUI), designed to manage sports equipment reservations and event registrations for CUI students."
    },
    {
        "question": "Does this app show sports events happening at other COMSATS campuses?",
        "answer": "No, this app only shows sports events and facilities for the COMSATS University Islamabad campus. It doesn't include information about other COMSATS campuses."
    },
    {
        "question": "Can I use my CUI student ID to log into this app?",
        "answer": "Yes, you can use your COMSATS University Islamabad (CUI) student ID to log into this app and access its features."
    },
    {
        "question": "Are HEC sports scholarships managed through this app?",
        "answer": "No, this app doesn't manage HEC sports scholarships. It's solely for COMSATS University Islamabad's internal sports management, including equipment reservations and event registrations."
    },
    {
        "question": "Does this app show results of HEC sports competitions?",
        "answer": "No, this app doesn't show results of HEC sports competitions. It's focused on COMSATS University Islamabad's internal sports activities and equipment management."
    },
    {
        "question": "Can I use this app to book sports facilities at other universities for HEC events?",
        "answer": "No, this app is exclusively for booking sports facilities and equipment at COMSATS University Islamabad. It doesn't cover facilities at other universities or HEC events."
    },
    {
        "question": "Is this app connected to the HEC sports database?",
        "answer": "No, this app is not connected to any HEC sports database. It's a standalone system for COMSATS University Islamabad's sports management."
    },
    {
        "question": "Do I need a separate account for HEC sports events?",
        "answer": "This app doesn't handle HEC sports events. It's only for COMSATS University Islamabad sports activities. For HEC events, you would need to check with your university's sports department or HEC directly."
    },
    {
        "question": "Can COMSATS Islamabad alumni use this app?",
        "answer": "This app is designed for current COMSATS University Islamabad students. Alumni might not have access, but you can check with the university's sports department for any alumni sports programs."
    },
        {
        "question": "Is this sports app exclusive to COMSATS Islamabad?",
        "answer": "Yes, this sports app is exclusively for COMSATS University Islamabad (CUI) students and facilities."
    },
    {
        "question": "Can students from COMSATS Lahore use this app?",
        "answer": "No, this app is specifically for COMSATS University Islamabad campus. Students from other campuses, including COMSATS Lahore, cannot use it."
    },
    {
        "question": "Does this app cover sports events at all CUI campuses?",
        "answer": "No, this app only covers sports events and facilities at the COMSATS University Islamabad campus. It doesn't include other CUI campuses."
    },
    {
        "question": "Is there a similar app for other COMSATS campuses?",
        "answer": "This app is specific to COMSATS University Islamabad. For information about similar apps for other campuses, please check with their respective sports departments."
    },
    {
        "question": "Can COMSATS Islamabad faculty use this sports app?",
        "answer": "This app is primarily designed for COMSATS University Islamabad students. Faculty usage may be limited; please check with the sports department for more information."
    },
    {
        "question": "Does this app handle sports events between different COMSATS campuses?",
        "answer": "No, this app only manages sports events within COMSATS University Islamabad. It doesn't handle inter-campus events."
    },
    {
        "question": "Is this the official CUI Islamabad sports management app?",
        "answer": "Yes, this is the official sports management app for COMSATS University Islamabad, handling equipment reservations and event registrations."
    },
    {
        "question": "Can I use this app if I'm a visiting student at COMSATS Islamabad?",
        "answer": "This app is for registered COMSATS University Islamabad students. Visiting students should check with the sports department for access."
    },
    {
        "question": "Does this app show sports schedules for all COMSATS branches?",
        "answer": "No, this app only shows sports schedules and information for COMSATS University Islamabad. It doesn't include schedules for other COMSATS branches."
    },
    {
        "question": "How do I unregister from a sports event on the app?",
        "answer": "To unregister from a sports event, go to your profile or the events section, find the event you've registered for, and look for an 'Unregister' or 'Cancel Registration' option."
    },
    {
        "question": "Can I cancel my registration for a CUI sports event?",
        "answer": "Yes, you can cancel your registration for a COMSATS University Islamabad sports event. Navigate to the event in your profile or the events section and use the cancellation option."
    },
    {
        "question": "What's the process to withdraw from a sports event I've signed up for?",
        "answer": "To withdraw from a sports event, open the app, go to your registered events, select the event you want to withdraw from, and choose the 'Withdraw' or 'Cancel' option."
    },
    {
        "question": "Is there a deadline for cancelling event registrations?",
        "answer": "Yes, there may be deadlines for cancelling event registrations. Check the event details or contact the event organizer for specific cancellation deadlines."
    },
    {
        "question": "How late can I unregister from a COMSATS sports event?",
        "answer": "Unregistration deadlines may vary by event. Check the event details in the app or contact the COMSATS University Islamabad sports department for specific unregistration timelines."
    },
    {
        "question": "Will I be penalized for cancelling my sports event registration?",
        "answer": "Penalties for cancelling registrations depend on the event and when you cancel. Check the event rules or contact the CUI sports department for details on any potential penalties."
    },
    {
        "question": "Can I get a refund if I unregister from a paid sports event?",
        "answer": "Refund policies for paid events may vary. Check the event details or contact the COMSATS University Islamabad sports department for information on refunds for specific events."
    },
    {
        "question": "How do I cancel my participation in a team sport I've registered for?",
        "answer": "To cancel participation in a team sport, go to your profile or the events section, find the team sport event, and use the 'Cancel Participation' or 'Leave Team' option. Note that this may affect your team's registration."
    },
    {
        "question": "What happens if I need to unregister from a tournament after the deadline?",
        "answer": "If you need to unregister after the deadline, contact the COMSATS University Islamabad sports department or event organizer directly. Late unregistration may have specific consequences or may not be possible."
    },
    {
        "question": "Can I cancel my registration for multiple events at once?",
        "answer": "The app may not have a bulk cancellation feature. You might need to cancel registrations for each event individually. Check your profile or the events section for cancellation options."
    },
    {
        "question": "If I unregister from an event, can someone else take my spot?",
        "answer": "When you unregister, your spot may become available for other COMSATS University Islamabad students. The reallocation of spots depends on the event's rules and timing."
    },
    {
        "question": "Does this app show national-level sports events organized by HEC?",
        "answer": "No, this app is focused on COMSATS University Islamabad's internal sports events and doesn't show national-level or HEC-organized sports events."
    },
    {
        "question": "Can I use this app to register for sports events at other COMSATS campuses?",
        "answer": "No, this app is specifically for sports events and facilities at COMSATS University Islamabad campus. It doesn't cover events at other COMSATS campuses."
    },
    {
        "question": "Can I see the availability of equipment before making a reservation?",
        "answer": "Yes, the app should show you the current availability of each equipment item when you're browsing the reservation section."
    },
    {
        "question": "How far in advance can I reserve equipment?",
        "answer": "The reservation window may vary. Check the app for specific rules, but typically you can reserve equipment a few days to a week in advance."
    },
    {
        "question": "What happens if I'm late returning equipment?",
        "answer": "Late returns may result in penalties or restrictions on future reservations. Always try to return equipment on time or extend your reservation if needed."
    },
    {
        "question": "Can I extend my equipment reservation?",
        "answer": "You may be able to extend your reservation if the equipment is not reserved by someone else immediately after your slot. Check for an 'Extend Reservation' option in your current reservations."
    },
    {
        "question": "How do I cancel an equipment reservation?",
        "answer": "To cancel a reservation, go to your profile or reservations section and look for a 'Cancel' option next to your active reservations."
    },
    {
        "question": "Are there any fees for reserving equipment?",
        "answer": "Most equipment reservations are likely free for students, but check the app or with the sports department for any potential fees or deposits required."
    },
    {
        "question": "How do I report lost or damaged equipment?",
        "answer": "If equipment is lost or damaged, report it immediately through the app's help section or directly to the sports department staff."
    },
    {
        "question": "Can graduate students use the app to reserve equipment?",
        "answer": "The app is designed for university students. If you're a graduate student, you should be able to use it, but verify with your sports department if there are any restrictions."
    },
    {
        "question": "How do I view upcoming sports events?",
        "answer": "Go to the Events section in the app to view all upcoming sports events. You can usually filter or sort events by date or sport type."
    },
    {
        "question": "Can I suggest new equipment for the university to acquire?",
        "answer": "You may be able to suggest new equipment through the app's feedback or help section. Alternatively, contact the sports department directly with your suggestions."
    },
    {
        "question": "How are teams assigned for multi-player sports events?",
        "answer": "Teams are typically formed based on registrations. The event manager may assign teams randomly or based on skill levels, depending on the event type."
    },
    {
        "question": "Can I choose my teammates for events?",
        "answer": "For most events, teams are assigned by the event manager. Some events might allow you to register as a pre-formed team, but check the specific event details."
    },
    {
        "question": "What happens if not enough players register for a team sport?",
        "answer": "If there aren't enough registrations, the event might be canceled or postponed. The event manager will notify registered players of any changes."
    },
    {
        "question": "How do I know if I've been selected for a team?",
        "answer": "You'll receive a notification through the app once teams have been formed. You can also check your profile or the event details for team assignments."
    },
    {
        "question": "Can I participate in multiple events on the same day?",
        "answer": "You can register for multiple events, but be aware of potential time conflicts. The app should warn you if you're registering for overlapping events."
    },
    {
        "question": "How do I view the schedule of matches I'm participating in?",
        "answer": "Check your profile section or the Events tab for a schedule of matches you're participating in. You should see dates, times, and locations for each match."
    },
    {
        "question": "What should I do if I can't attend a match I've registered for?",
        "answer": "If you can't attend a match, notify the event manager as soon as possible through the app. Look for an option to withdraw from the event or contact support."
    },
    {
        "question": "Can I reserve a ground for personal practice?",
        "answer": "Ground reservations are typically for organized events or matches. Check with the sports department if personal practice reservations are allowed."
    },
    {
        "question": "How far in advance are event schedules posted?",
        "answer": "Event schedules are usually posted several days to weeks in advance. Regular check the Events section for updates on upcoming events."
    },
    {
        "question": "Can I get notifications for new event postings?",
        "answer": "Yes, you should be able to set up notifications in the app settings to alert you when new events are posted or when registration opens."
    },
    {
        "question": "What information is shown in the weather API for ground reservations?",
        "answer": "The weather API typically shows current temperature, weather conditions (sunny, cloudy, rainy, etc.), and possibly a short-term forecast for the COMSATS University Islamabad area."
    },
    {
        "question": "How accurate is the weather information provided?",
        "answer": "The weather information is based on real-time data from a reliable weather service, but as with all weather forecasts, it's subject to change."
    },
        {
        "question": "What happens if the equipment I want is out of stock?",
        "answer": "If an equipment item is out of stock, it won't be available for reservation in the app. You can check back later or choose an alternative item if available."
    },
    {
        "question": "What should I do if I receive faulty equipment?",
        "answer": "If you receive faulty equipment, please report it immediately through the app's Help section or directly to the Sports Department staff."
    },
    {
        "question": "How do I report damaged sports gear?",
        "answer": "To report damaged sports gear, use the 'Report Issue' feature in the app or inform the Sports Department staff directly."
    },
    {
        "question": "The equipment I reserved is broken. What now?",
        "answer": "If the equipment you reserved is broken, please return it immediately and report the issue through the app or to the staff. You can then make a new reservation for a replacement."
    },
    {
        "question": "Can all students make reservations?",
        "answer": "Yes, all registered students can make equipment reservations using their Student ID and app account."
    },
    {
        "question": "Who is eligible to reserve sports equipment?",
        "answer": "All currently enrolled students are eligible to reserve sports equipment through the app."
    },
    {
        "question": "Do I need to be a student to book equipment?",
        "answer": "Yes, you need to be a registered student to book equipment. The app uses your Student ID for verification."
    },
    {
        "question": "Are there any restrictions on student reservations?",
        "answer": "While all students can make reservations, there may be limits on the number of items or duration of reservations to ensure fair access for everyone."
    },
    {
        "question": "Hello bro",
        "answer": "Hello! 👋 I'm the Campus Sports Sphere Bot. How can I assist you today?"
    },
    {
        "question": "What are the hours for equipment reservations?",
        "answer": "Equipment reservations can be made from 8:00 AM to 5:30 PM daily."
    },
    {
        "question": "When can I book sports equipment?",
        "answer": "You can book sports equipment any time between 8:00 AM and 5:30 PM."
    },
    {
        "question": "What's the time window for reserving sports gear?",
        "answer": "The time window for reserving sports gear is from 8:00 AM to 5:30 PM every day."
    },
    {
        "question": "How is the equipment inventory maintained?",
        "answer": "The equipment inventory is maintained by staff who regularly update the available quantities and check for any damaged items."
    },
    {
        "question": "Who is responsible for updating the equipment inventory?",
        "answer": "The Sports Department staff is responsible for updating the equipment inventory."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is updated in real-time as reservations are made and items are returned. Staff also perform regular inventory checks."
    },
    {
        "question": "Good afternoon",
        "answer": "Good afternoon! ☀️ What information do you need about our sports facilities or equipment?"
    },
    {
        "question": "Good Evening",
        "answer": "Good Evening! 🌒 What information do you need about our sports facilities or equipment?"
    },
    {
        "question": "Is there a specific process for students to reserve sports gear?",
        "answer": "Yes, students need to log into the app, select the equipment they want, choose a time slot, review the details, and confirm their reservation."
    },
    {
        "question": "What steps should I take if the equipment I received is not working?",
        "answer": "If the equipment you received is not working, please report it immediately through the app's Help section or contact the staff."
    },
    {
        "question": "Can I get a replacement for faulty equipment?",
        "answer": "Yes, you can get a replacement for faulty equipment. Please report the issue through the app's Help section or contact the staff directly."
    },
    {
        "question": "How do I know if an equipment item is available?",
        "answer": "The app will show the current availability of each equipment item when you are browsing the Reservation section."
    },
    {
        "question": "What if the equipment is not available?",
        "answer": "If the equipment is not available, it means it's currently out of stock. You can check back later or choose a different item."
    },
    {
        "question": "Can I reserve equipment that is currently unavailable?",
        "answer": "No, you cannot reserve equipment that is currently unavailable. You will need to wait until it's back in stock."
    },
    {
        "question": "How can I check the current inventory of sports equipment?",
        "answer": "You can check the current inventory of sports equipment by browsing the Reservation section in the app. The availability of each item will be displayed."
    },
    {
        "question": "Can I reserve multiple items at the same time?",
        "answer": "Yes, you can reserve multiple items at the same time, but there may be limits to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "What is the maximum number of equipment items I can reserve?",
        "answer": "The maximum number of equipment items you can reserve may vary. Please check the reservation rules in the app for specific details."
    },
    {
        "question": "Are there specific hours for equipment bookings?",
        "answer": "Yes, equipment bookings can be made during the hours of 8:00 AM to 5:30 PM."
    },
    {
        "question": "Can I see past reservation history for equipment?",
        "answer": "Your past reservation history should be available in your profile section. This can help you track your equipment usage over time."
    },
    {
        "question": "Is there a rating system for equipment quality?",
        "answer": "The app may include a feature for rating equipment quality after use. Check your reservation history or equipment details for any rating options."
    },
    {
        "question": "How do I report a bug in the app?",
        "answer": "To report a bug, use the Help and Support section in the app. Look for an option to report technical issues or bugs."
    },
    {
        "question": "Can I use the app on both iOS and Android devices?",
        "answer": "The app should be available for both iOS and Android devices. Download it from your device's app store."
    },
    {
        "question": "Is there a desktop version of the app?",
        "answer": "The app is primarily designed for mobile devices. Check with the university if there's a web version available for desktop use."
    },
    {
        "question": "How secure is my personal information in the app?",
        "answer": "The app uses standard security measures to protect your personal information. Always keep your login credentials private and use a strong, unique password."
    },
    {
        "question": "Can I link my student ID to the app?",
        "answer": "Your student ID is likely linked to your account during registration. Contact support if you need to update or verify your student ID in the app."
    },
    {
        "question": "How do I update my sports preferences for event recommendations?",
        "answer": "Go to your Event tab and look for an option to update your sports preferences or interests. This will help tailor event recommendations to your liking."
    },
    {
        "question": "Can I see who else is registered for an event?",
        "answer": "For privacy reasons, you might not be able to see other registrants. However, you may be able to see team assignments once they're made."
    },
    {
        "question": "Is there a waitlist for popular events?",
        "answer": "Popular events may have a waitlist feature. If an event is full, look for an option to join the waitlist in case spots open up."
    },
    {
        "question": "How do I know if an event I registered for is canceled?",
        "answer": "You'll receive a notification if an event you're registered for is canceled. Always check the app for the most up-to-date event information."
    },
    {
        "question": "Can I request specific equipment for an event?",
        "answer": "Equipment for events is typically standardized. If you need specific equipment, contact the event manager or sports department directly."
    },
    {
        "question": "How do I view the rules for different sports events?",
        "answer": "Event rules should be available in the event details section. Look for a 'Rules' or 'Event Info' tab when viewing an event."
    },
    {
        "question": "Is there a feature to find teammates or opponents for practice matches?",
        "answer": "The app may have a community or social feature to connect with other players. Check for a 'Community' or 'Find Players' section."
    },
    {
        "question": "How do I track my sports performance in the app?",
        "answer": "The app currently doesnot have performance tracking feature, it will be soon added in the next update."
    },
    {
        "question": "Can I get reminders for my equipment return deadlines?",
        "answer": "Yes, the app should send you notifications reminding you of upcoming equipment return deadlines."
    },
    {
        "question": "How do I provide feedback on the app's features?",
        "answer": "Use the Help and Support section to provide feedback. There may be a specific 'Feedback' or 'Suggestions' option."
    },
    {
        "question": "Is there a chat feature to communicate with other players or staff?",
        "answer": "Check if the app has a messaging or chat feature. This could be useful for communicating with staff only."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is likely updated in real-time as reservations are made and items are returned. Staff may also perform regular inventory checks."
    },
    {
        "question": "How do I find information about accessibility features for sports facilities?",
        "answer": "Look for an 'Help and Support' section that provides information on accessible features of sports grounds and equipment."
    },
    {
        "question": "Can I see a list of sports equipment that's suitable for beginners?",
        "answer": "Our list of sports equipments are for every student !."
    },
    {
        "question": "Is there a feature to create and share sports challenge videos with other users?",
        "answer": "No there are no such feature available in the app rightnow."
    },

    {
        "question": "Can I see a list of sports equipment that's designed for use in extreme temperatures?",
        "answer": "Look for an 'Extreme Weather Gear' or 'All-Climate Equipment' section that highlights sports equipment suitable for very hot or cold conditions."
    },
       {
        "question": "What's the process for signing up on the Sports Sphere app?",
        "answer": "To sign up, navigate to the registration page and enter your student information, including your full name, student identification number, and university email address. Choose a secure password, then complete the registration process by following the on-screen instructions."
    },
    {
        "question": "Which sports gear can I book through the app?",
        "answer": "The app allows you to book a wide range of sports equipment, including items for Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This covers various items such as balls, bats, rackets, protective gear, and more."
    },
    {
        "question": "How do I go about booking sports equipment on the app?",
        "answer": "After logging in, navigate to the home tab. Browse the available equipment, select the item you want, and tap the 'Book' button. Choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "What are the operating hours for equipment bookings?",
        "answer": "You can make equipment bookings from 8:00 AM until 5:30 PM."
    },
     {
        "question": "How do I register for a sports event?",
        "answer": "To register for a sports event: 1) Open the app and go to the 'Events' section, 2) Browse available events, 3) Select the event you're interested in, 4) Click 'Register' or 'Sign Up', 5) Fill in any required information, 6) Confirm your registration. You'll receive a confirmation notification once you're registered."
    },
    {
        "question": "What's the process for signing up for a sports tournament?",
        "answer": "To sign up for a sports tournament: First, log into the app and navigate to the Events tab. Browse the list of upcoming tournaments, select the one you want to join, and click on the registration button. Follow the prompts to complete your registration, which may include providing some personal information or forming a team."
    },
    {
        "question": "Can you explain how to join a campus sports event?",
        "answer": "Joining a campus sports event is easy! Just open the app, go to the Events section, and find the event you're interested in. Click on it for more details, then look for a 'Join' or 'Register' button. Follow the steps to complete your registration, which might include choosing your role (player, spectator, etc.) or joining a team."
    },
    {
        "question": "What steps do I need to follow to participate in a sports competition?",
        "answer": "To participate in a sports competition: 1) Open the app, 2) Go to 'Events' or 'Competitions', 3) Find the competition you want to join, 4) Click for more details, 5) Hit the 'Participate' or 'Register' button, 6) Fill out any required forms or information, 7) Submit your registration. You'll get a confirmation once you're successfully registered."
    },
    {
        "question": "How can I sign up for upcoming sports events on campus?",
        "answer": "Signing up for upcoming sports events is simple: Open the Campus Sports Sphere app and head to the Events section. You'll see a list of upcoming events. Choose the one you're interested in, tap on it, and look for the registration option. Follow the prompts to complete your sign-up, which may include selecting your preferred role or team."
    },

    # Ground Reservation Process
    {
        "question": "How do I reserve a sports ground?",
        "answer": "To reserve a sports ground: 1) Log into the app, 2) Go to 'Ground Reservations', 3) Select the type of ground you need (e.g., cricket field, football pitch), 4) Choose an available date and time slot, 5) Review the reservation details, 6) Confirm your booking. You'll receive a confirmation once your reservation is approved."
    },
    {
        "question": "What's the process for booking a sports field?",
        "answer": "To book a sports field, start by opening the app and navigating to the 'Facilities' or 'Ground Booking' section. Choose the type of field you need, then select an available date and time slot. Review the booking details, including any fees or rules, and confirm your reservation. You'll get a notification when your booking is approved."
    },
    {
        "question": "Can you explain how to reserve a playing ground on campus?",
        "answer": "Reserving a playing ground is straightforward: Open the app and find the 'Ground Reservations' section. Select the type of ground you need (like a football field or basketball court). Browse available time slots and pick one that works for you. Review any rules or fees, then confirm your reservation. You'll receive an approval notification soon after."
    },
    {
        "question": "What steps do I need to follow to book a sports court?",
        "answer": "To book a sports court: 1) Open the app, 2) Navigate to 'Facility Bookings' or 'Court Reservations', 3) Choose the type of court you need, 4) Select an available date and time, 5) Review any rules or fees associated with the booking, 6) Confirm your reservation. You'll get a confirmation message once your booking is processed."
    },
    {
        "question": "How can I reserve a pitch for my team practice?",
        "answer": "To reserve a pitch for team practice: First, log into the app and go to the 'Ground Bookings' section. Select the type of pitch you need (e.g., football, cricket). Choose from the available dates and times that suit your team's schedule. Review any usage rules or fees, then confirm your booking. You'll receive a notification when your reservation is approved."
    },
    {
        "question": "What's the procedure for securing a sports ground for an event?",
        "answer": "To secure a sports ground for an event: Open the app and navigate to 'Facility Reservations'. Select 'Sports Grounds' and choose the specific type you need. Pick an available date and time slot that fits your event schedule. You may need to provide event details. Review any rules or fees, then submit your reservation request. Approval notification will be sent to you once processed."
    },
    {
        "question": "How do I go about reserving an outdoor court for a game?",
        "answer": "To reserve an outdoor court: 1) Open the app, 2) Go to 'Court Bookings', 3) Select 'Outdoor Courts', 4) Choose the specific court type (e.g., tennis, basketball), 5) Pick an available date and time, 6) Review any usage guidelines or fees, 7) Confirm your reservation. You'll receive a booking confirmation once it's approved."
    },
    {
        "question": "Can you walk me through the process of booking a sports field on campus?",
        "answer": "Sure! Here's how to book a sports field: Open the Campus Sports Sphere app and find the 'Facility Bookings' section. Choose 'Sports Fields' and select the type you need (e.g., soccer field, cricket pitch). Browse the calendar for available slots and pick a suitable time. Review any rules or fees associated with the booking. Finally, confirm your reservation. You'll get a notification when your booking is approved."
    },
     {
        "question": "How do I register for sports events?",
        "answer": "To register for sports events, go to the events section in the tab navigator. Browse available events and click on the one you're interested in. Then, follow the registration process for that specific event."
    },
    {
        "question": "What's the process for signing up for sports tournaments?",
        "answer": "To sign up for sports tournaments, navigate to the events tab in the app. Browse the list of upcoming tournaments, select the one you're interested in, and follow the registration steps provided for that specific event."
    },
    {
        "question": "Can you explain how to join a sports event using the app?",
        "answer": "To join a sports event: 1) Open the app and go to the events section, 2) Browse through the list of available events, 3) Select the event you want to join, 4) Click on the registration button, 5) Fill out any required information, and 6) Confirm your registration. You'll receive a confirmation once you're successfully registered."
    },
    {
        "question": "How can I sign up for a sports event through the app?",
        "answer": "To sign up for a sports event: Open the app, navigate to the events section, browse the available events, select the event you're interested in, follow the registration steps, and confirm your registration."
    },
    {
        "question": "What steps do I need to follow to register for a sports event?",
        "answer": "To register for a sports event: 1) Open the app and go to the events tab, 2) Browse the list of available events, 3) Select the event you want to register for, 4) Follow the registration steps, 5) Confirm your registration. You will receive a confirmation notification."
    },
    {
        "question": "Could you walk me through the event registration process on the app?",
        "answer": "Sure! To register for an event: First, open the app and go to the events section. Browse the list of available events, select the one you want to join, click on the registration button, fill out any required information, and confirm your registration. You'll receive a confirmation message once it's done."
    },
    {
        "question": "I need to register for a sports event. How do I do that in the app?",
        "answer": "To register for a sports event: 1) Open the app and log in, 2) Navigate to the events section, 3) Browse the list of available events, 4) Select the event you want to register for, 5) Follow the registration steps, 6) Confirm your registration. You'll get a confirmation notification shortly after."
    },
     {
        "question": "How do I reserve a cricket ground?",
        "answer": "To reserve a cricket ground, go to the ground reservation section. View available slots defined by the event manager, select your desired slot, and submit a reservation request. If approved, you'll receive a notification."
    },
    {
        "question": "What's the process for booking a cricket field?",
        "answer": "To book a cricket field: Navigate to the field reservation section in the app, check the available time slots set by the event manager, choose your preferred slot, and submit a booking request. You'll receive a notification if your request is approved."
    },
    {
        "question": "Can you explain how to reserve a cricket ground using the app?",
        "answer": "To reserve a cricket ground: 1) Open the app and go to the ground reservation section, 2) View the list of available time slots, 3) Select your desired date and time, 4) Submit your reservation request, 5) Wait for approval—you'll receive a notification once your request is processed."
    },
    {
        "question": "How can I book a cricket field through the app?",
        "answer": "To book a cricket field, open the app and go to the ground reservation section. View the available time slots, choose the one that suits you, submit your booking request, and wait for approval. You'll get a notification once it's confirmed."
    },
    {
        "question": "What steps do I need to follow to reserve a cricket ground?",
        "answer": "To reserve a cricket ground: 1) Log into the app, 2) Navigate to the ground reservation section, 3) View the available time slots, 4) Select your preferred slot, 5) Submit a reservation request. You will receive a notification if your request is approved."
    },
    {
        "question": "Could you walk me through the cricket ground reservation process on the app?",
        "answer": "Sure! To reserve a cricket ground: First, open the app and go to the ground reservation section. View the available time slots, select the one you want, submit your reservation request, and wait for approval. You'll receive a notification once it's confirmed."
    },
    {
        "question": "I need to reserve a cricket field. How do I do that in the app?",
        "answer": "To reserve a cricket field: 1) Open the app and log in, 2) Go to the ground reservation section, 3) View the available time slots, 4) Select the one that suits you, 5) Submit your reservation request, 6) Wait for approval. You'll get a notification once it's confirmed."
    },
    {
        "question": "Is there a time limit on equipment rentals?",
        "answer": "The rental duration is based on the time slot you select when making your booking. You need to return the equipment before your chosen time slot ends."
    },
    {
        "question": "Are there consequences for late equipment returns?",
        "answer": "The app will send you a reminder when your booking is close to expiring. It's crucial to return equipment on time to avoid any penalties and to ensure other students can use the equipment as scheduled."
    },
    {
        "question": "Where can I find a list of my current equipment bookings?",
        "answer": "Your active equipment bookings are listed in the profile section of the app."
    },
    {
        "question": "What should I do if I receive damaged equipment?",
        "answer": "If you receive damaged equipment, report it immediately via the app's support section or contact the sports department staff directly. You can also submit a detailed query explaining the issue."
    },
    {
        "question": "How can I sign up for sports tournaments?",
        "answer": "To sign up for sports tournaments, go to the events tab. Browse the list of upcoming tournaments, select the one you're interested in, and follow the registration steps provided for that specific event."
    },
    {
        "question": "Is there a way to view the tournaments I've signed up for?",
        "answer": "Yes, all the tournaments you've registered for are displayed in your profile section."
    },
    {
        "question": "How are sports teams assembled for tournaments?",
        "answer": "Teams are formed based on the number of registered participants and the requirements of each sport. For instance, cricket and football teams have 11 players each, while basketball teams consist of 5 players."
    },
    {
        "question": "Can I withdraw from a tournament I've signed up for?",
        "answer": "Yes, you can withdraw from a tournament by canceling your registration in the profile section of the app."
    },
    {
        "question": "Is it possible to register for tournaments that have already occurred?",
        "answer": "No, registration is not available for tournaments that have already taken place."
    },
    {
        "question": "What's the typical duration of sports matches?",
        "answer": "Match duration varies by sport. For example, cricket matches usually last 2-3 hours, football matches are 90 minutes, and other sports have their specific durations."
    },
    {
        "question": "When are sports matches typically scheduled?",
        "answer": "Sports matches are usually scheduled between 8:30 AM and 5:30 PM."
    },
    {
        "question": "What's the procedure for booking a cricket field?",
        "answer": "To book a cricket field, go to the field reservation section. Check the available time slots set by the event manager, choose your preferred slot, and submit a booking request. You'll receive a notification if your request is approved."
    },
    {
        "question": "Is weather information provided for field bookings?",
        "answer": "Yes, when booking a cricket field, you can view current weather information for COMSATS University Islamabad, including temperature and weather conditions."
    },
    {
        "question": "What happens if the sports equipment I want is unavailable?",
        "answer": "If a particular piece of equipment is out of stock (quantity reaches zero), it won't be available for booking until more units are added to the inventory."
    },
    {
        "question": "How can I get help if I encounter issues with the app?",
        "answer": "You can access the Help and Support section in the app to find answers to common questions or to submit a query to the staff."
    },
    {
        "question": "Can staff members see who has currently booked equipment?",
        "answer": "Yes, staff members have access to view current equipment bookings and booking history."
    },
    {
        "question": "How are suggested tournaments chosen for users?",
        "answer": "Suggested tournaments are based on the priority sports you've selected in your profile or your past tournament participation history."
    },
      {
        "question": "Can you explain the process of equipment reservations?",
        "answer": "To reserve equipment, navigate to the home tab, select the equipment you want, choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "How do I go about reserving equipment on the app?",
        "answer": "After logging in, navigate to the home tab. Browse the available equipment, select the item you want, and tap the 'Book' button. Choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "What are the steps to reserve equipment on the app?",
        "answer": "The steps to reserve equipment are: 1) navigate to the home tab, 2) select the equipment you want, 3) choose your preferred time slot, 4) review the booking details, and 5) confirm your reservation."
    },
    {
        "question": "Can you walk me through the equipment reservation process?",
        "answer": "To reserve equipment, navigate to the home tab, select the equipment you want, choose your preferred time slot, review the booking details, and confirm your reservation. You will receive a notification when your reservation is confirmed."
    },
    {
        "question": "How do I book equipment for a specific time slot?",
        "answer": "To book equipment for a specific time slot, navigate to the home tab, select the equipment you want, choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "What information do I need to provide to reserve equipment?",
        "answer": "To reserve equipment, you need to provide your preferred time slot and confirm your reservation. You will also need to review the booking details before confirming your reservation."
    },
    {
        "question": "Can I reserve equipment for a specific date and time?",
        "answer": "Yes, you can reserve equipment for a specific date and time. Navigate to the home tab, select the equipment you want, choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "How far in advance can I reserve equipment?",
        "answer": "You can reserve equipment up to a certain time in advance. The exact time frame may vary depending on the equipment and the time of day."
    },
    {
        "question": "Can I cancel or modify my equipment reservation?",
        "answer": "Yes, you can cancel or modify your equipment reservation. Navigate to the profile section, find your active reservations, and select the 'Cancel' or 'Modify' option."
    },
        {
        "question": "How do I create an account in the app?",
        "answer": "To create an account, go to the sign-up page and provide your student details, including your name, student ID, and email. Choose a password and complete the registration process."
    },
    {
        "question": "What's the process for signing up on the Sports Sphere app?",
        "answer": "To sign up, navigate to the registration page and enter your student information, including your full name, student identification number, and university email address. Choose a secure password, then complete the registration process by following the on-screen instructions."
    },
    {
        "question": "Can you walk me through the account creation steps for the app?",
        "answer": "To create an account: 1) Go to the sign-up page, 2) Enter your name, student ID, and email, 3) Choose a secure password, 4) Review and accept the terms of service, and 5) Complete the registration by following any additional prompts."
    },
    {
        "question": "What sports equipment can I reserve?",
        "answer": "You can reserve equipment for various sports including Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This includes items like balls, rackets, helmets, pads, gloves, and shuttlecocks."
    },
    {
        "question": "What types of sports gear are available for booking through the app?",
        "answer": "The app offers a wide range of sports equipment for booking, including gear for Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. You'll find various items such as balls, bats, rackets, protective gear, and more."
    },
    {
        "question": "Can you list the sports and equipment I can reserve using the app?",
        "answer": "Using the app, you can reserve equipment for: 1) Cricket (balls, bats, pads), 2) Football (balls, gloves), 3) Basketball (balls), 4) Volleyball (balls, nets), 5) Badminton (rackets, shuttlecocks), 6) Table Tennis (paddles, balls), and 7) Tennis (rackets, balls). Each sport has its specific gear available."
    },
    {
        "question": "How do I register for sports events?",
        "answer": "To register for sports events, go to the events section in the tab navigator. Browse available events and click on the one you're interested in. Then, follow the registration process for that specific event."
    },
    {
        "question": "What's the procedure for signing up for sports tournaments?",
        "answer": "To sign up for sports tournaments, navigate to the events tab in the app. Browse the list of upcoming tournaments, select the one you're interested in, and follow the registration steps provided for that specific event."
    },
    {
        "question": "Can you explain how to join a sports event using the app?",
        "answer": "To join a sports event: 1) Open the app and go to the events section, 2) Browse through the list of available events, 3) Select the event you want to join, 4) Click on the registration button, 5) Fill out any required information, and 6) Confirm your registration. You'll receive a confirmation once you're successfully registered."
    },
    {
        "question": "How do I reserve a cricket ground?",
        "answer": "To reserve a cricket ground, go to the ground reservation section. View available slots defined by the event manager, select your desired slot, and submit a reservation request. If approved, you'll receive a notification."
    },
    {
        "question": "What's the process for booking a cricket field?",
        "answer": "To book a cricket field, navigate to the field reservation section in the app. Check the available time slots set by the event manager, choose your preferred slot, and submit a booking request. You'll receive a notification if your request is approved."
    },
    {
        "question": "Can you walk me through the steps to reserve a cricket ground using the app?",
        "answer": "To reserve a cricket ground: 1) Open the app and go to the ground reservation section, 2) View the list of available time slots, 3) Select your desired date and time, 4) Submit your reservation request, 5) Wait for approval - you'll receive a notification once your request is processed."
    },
        {
        "question": "How do I reserve sports equipment?",
        "answer": "To reserve sports equipment: 1) Log into the app, 2) Go to the equipment reservation section, 3) Choose the equipment you need, 4) Select an available time slot, 5) Confirm your reservation. You'll receive a confirmation notification once the reservation is complete."
    },
    {
        "question": "What's the process for booking sports gear through the app?",
        "answer": "To book sports gear: 1) Open the app and navigate to the equipment section, 2) Browse or search for the item you want, 3) Check its availability and select a time slot, 4) Review the reservation details, 5) Confirm your booking. The app will notify you when your reservation is confirmed."
    },
    {
        "question": "Can you explain how to reserve equipment for my sport?",
        "answer": "To reserve equipment: Log into the app and go to the equipment section. Find the item you need, check its availability, and choose a time slot that works for you. Review the details and confirm your reservation. You'll get a confirmation message once it's done."
    },
    {
        "question": "What steps do I need to follow to reserve sports equipment on the app?",
        "answer": "Follow these steps to reserve equipment: 1) Sign in to the app, 2) Navigate to 'Equipment Reservations', 3) Select the sport and equipment type, 4) Choose an available time slot, 5) Review the reservation details, 6) Confirm your booking. You'll receive a confirmation notification."
    },
    {
        "question": "How can I book sports gear using the Campus Sports Sphere app?",
        "answer": "To book sports gear: Open the app and go to the equipment booking section. Select the item you want to reserve, pick an available time slot, review the reservation details, and confirm your booking. The app will send you a confirmation once it's processed."
    },
    {
        "question": "What's the procedure for reserving sports equipment through the university app?",
        "answer": "The procedure for reserving equipment is: 1) Log into the app, 2) Go to 'Equipment Reservations', 3) Select the desired equipment, 4) Choose an available time slot, 5) Review and confirm your reservation. You'll get a confirmation notification once it's processed."
    },
    {
        "question": "Could you walk me through the equipment reservation process on the app?",
        "answer": "Sure, here's how to reserve equipment: First, log into the app. Then, go to the equipment section and find the item you need. Check its availability and select a suitable time slot. Review the reservation details and confirm your booking. You'll receive a confirmation message once it's done."
    },
    {
        "question": "I need to reserve some sports equipment. How do I do that in the app?",
        "answer": "To reserve sports equipment: 1) Open the app and log in, 2) Navigate to the equipment reservation section, 3) Find and select the equipment you need, 4) Choose an available time slot, 5) Review the details, 6) Confirm your reservation. You'll get a confirmation notification shortly after."
    },
       {
        "question": "What types of sports equipment can I reserve through the app?",
        "answer": "The app allows you to reserve a variety of sports equipment, including balls, rackets, protective gear, and other items for sports like cricket, football, basketball, volleyball, badminton, table tennis, and tennis."
    },
    {
        "question": "Can you tell me about the different sports equipment I can book on the app?",
        "answer": "The sports equipment available for booking includes items like cricket balls and bats, football balls and gloves, basketball balls, volleyball balls and nets, badminton rackets and shuttlecocks, table tennis paddles and balls, and tennis rackets and balls."
    },
    {
        "question": "What kind of sports gear can I reserve through the Campus Sports Sphere app?",
        "answer": "The app offers a wide range of sports equipment for reservation, such as balls, rackets, protective gear, and other essential items for sports like cricket, football, basketball, volleyball, badminton, table tennis, and tennis."
    },
 {
        "question": "Could you provide a list of the sports equipment I can book on the app?",
        "answer": "The sports equipment available for booking includes:\n- Cricket: balls, bats, pads\n- Football: balls, gloves\n- Basketball: balls\n- Volleyball: balls, nets\n- Badminton: rackets, shuttlecocks\n- Table Tennis: paddles, balls\n- Tennis: rackets, balls"
    },
    {
        "question": "What sports equipment is available for reservation through the university's app?",
        "answer": "The app allows you to reserve a variety of sports equipment, including items for cricket, football, basketball, volleyball, badminton, table tennis, and tennis. This includes things like balls, rackets, protective gear, and other necessary equipment for these sports."
    },
    {
        "question": "Can you give me an overview of the sports equipment I can book on the Campus Sports Sphere app?",
        "answer": "The app offers booking for a wide range of sports equipment, such as:\n- Cricket: balls, bats, pads\n- Football: balls, gloves\n- Basketball: balls\n- Volleyball: balls, nets\n- Badminton: rackets, shuttlecocks\n- Table Tennis: paddles, balls\n- Tennis: rackets, balls"
    },
        {
        "question": "What sports can I reserve equipment for?",
        "answer": "You can reserve equipment for various sports including Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This includes items like balls, rackets, helmets, pads, gloves, and shuttlecocks."
    },
    {
        "question": "Which sports equipment is available for booking through the app?",
        "answer": "The app offers booking for equipment related to Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This includes various items such as balls, bats, rackets, protective gear, and more."
    },
    {
        "question": "Can you list the sports for which I can reserve equipment?",
        "answer": "You can reserve equipment for the following sports: Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. Each sport has its specific gear available for reservation."
    },
    {
        "question": "What categories of sports gear are available for reservation?",
        "answer": "The categories of sports gear available for reservation include Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This covers a wide range of equipment like balls, rackets, nets, and protective gear."
    },
    {
        "question": "Which sports have reservable equipment in the app?",
        "answer": "You can reserve equipment for Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. The app provides a variety of items for each of these sports."
    },
    {
        "question": "Can you tell me the sports categories for which I can book equipment?",
        "answer": "The sports categories for which you can book equipment include Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. Each category has various equipment items available for reservation."
    },
    {
        "question": "What types of sports can I book equipment for using the app?",
        "answer": "You can book equipment for Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. The app offers a range of equipment options for each of these sports."
    },
     {
        "question": "How many items can a student reserve at once?",
        "answer": "Students can typically reserve up to 3 items at a time, but this may vary depending on the type of equipment and current demand."
    },
    {
        "question": "Is there a limit to how much equipment I can book?",
        "answer": "Yes, there's usually a limit of 3 items per student to ensure fair access for everyone. However, this may vary based on equipment type and availability."
    },
    {
        "question": "Can I reserve multiple pieces of equipment simultaneously?",
        "answer": "You can reserve multiple pieces of equipment, typically up to 3 items, simultaneously. This limit helps ensure equitable access for all students."
    },
     {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is updated in real-time as reservations are made and items are returned. Staff also perform regular inventory checks."
    },
     {
        "question": "What happens if the equipment I want is out of stock?",
        "answer": "If an equipment item is out of stock, it won't be available for reservation in the app. You can check back later or choose an alternative item if available."
    },
     {
        "question": "What should I do if I receive faulty equipment?",
        "answer": "If you receive faulty equipment, please report it immediately through the app's help section or directly to the sports department staff."
    },
    {
        "question": "How do I report damaged sports gear?",
        "answer": "To report damaged sports gear, use the 'Report Issue' feature in the app or inform the sports department staff directly."
    },
    {
        "question": "The equipment I reserved is broken. What now?",
        "answer": "If the equipment you reserved is broken, please return it immediately and report the issue through the app or to the staff. You can then make a new reservation for a replacement."
    },
     {
        "question": "Can all students make reservations?",
        "answer": "Yes, all registered students can make equipment reservations using their student ID and app account."
    },
    {
        "question": "Who is eligible to reserve sports equipment?",
        "answer": "All currently enrolled students are eligible to reserve sports equipment through the app."
    },
    {
        "question": "Do I need to be a student to book equipment?",
        "answer": "Yes, you need to be a registered student to book equipment. The app uses your student ID for verification."
    },
    {
        "question": "Are there any restrictions on student reservations?",
        "answer": "While all students can make reservations, there may be limits on the number of items or duration of reservations to ensure fair access for everyone."
    },
     {
        "question": "Hello bro",
        "answer": "Hello! 👋 I'm the Campus Sports Sphere Bot. How can I assist you today?"
    },
     {
        "question": "What are the hours for equipment reservations?",
        "answer": "Equipment reservations can be made from 8:00 AM to 5:30 PM daily."
    },
    {
        "question": "When can I book sports equipment?",
        "answer": "You can book sports equipment any time between 8:00 AM and 5:30 PM."
    },
    {
        "question": "What's the time window for reserving sports gear?",
        "answer": "The time window for reserving sports gear is from 8:00 AM to 5:30 PM every day."
    },
        {
        "question": "How many items can I reserve at once?",
        "answer": "The app may have limits on the number of items you can reserve simultaneously to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "Is there a limit to the number of equipment items I can reserve?",
        "answer": "Yes, there may be limits on the number of equipment items you can reserve at one time. Please check the reservation rules in the app for specific details."
    },
        {
        "question": "How is the equipment inventory maintained?",
        "answer": "The equipment inventory is maintained by staff who regularly update the available quantities and check for any damaged items."
    },
    {
        "question": "Who is responsible for updating the equipment inventory?",
        "answer": "The sports department staff is responsible for updating the equipment inventory."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is updated in real-time as reservations are made and items are returned. Staff also perform regular inventory checks."
    },
       {
        "question": "What happens if the equipment I want is out of stock?",
        "answer": "If the equipment you want is out of stock, it will not be available for reservation until more units are added to the inventory."
    },
        {
        "question": "What should I do if I receive faulty equipment?",
        "answer": "If you receive faulty equipment, please report it immediately through the app's help section or contact the staff directly."
    },
    {
        "question": "How do I report damaged equipment?",
        "answer": "You can report damaged equipment by using the app's help section or by contacting the sports department staff directly."
    },
        {
        "question": "Can students reserve equipment?",
        "answer": "Yes, students can reserve equipment by logging into the app and following the reservation process."
    },
    {
        "question": "How do students make equipment reservations?",
        "answer": "Students can make equipment reservations by logging into the app, navigating to the equipment section, selecting the desired item, and confirming the reservation."
    },
    {
        "question": "What steps do students need to follow to reserve equipment?",
        "answer": "Students need to log into the app, go to the equipment section, choose the equipment, select a time slot, review the details, and confirm the reservation."
    },
        {
        "question": "Good afternoon",
        "answer": "Good afternoon! ☀️ What information do you need about our sports facilities or equipment?"
    },
        {
        "question": "Good Evening",
        "answer": "Good Evening! 🌒 What information do you need about our sports facilities or equipment?"
    },
    {
        "question": "Is there a specific process for students to reserve sports gear?",
        "answer": "Yes, students need to log into the app, select the equipment they want, choose a time slot, review the details, and confirm their reservation."
    },
    {
        "question": "What steps should I take if the equipment I received is not working?",
        "answer": "If the equipment you received is not working, please report it immediately through the app's help section or contact the staff."
    },
    {
        "question": "Can I get a replacement for faulty equipment?",
        "answer": "Yes, you can get a replacement for faulty equipment. Please report the issue through the app's help section or contact the staff directly."
    },
    {
        "question": "How do I know if an equipment item is available?",
        "answer": "The app will show the current availability of each equipment item when you are browsing the reservation section."
    },
    {
        "question": "What if the equipment is not available?",
        "answer": "If the equipment is not available, it means it's currently out of stock. You can check back later or choose a different item."
    },
    {
        "question": "Can I reserve equipment that is currently unavailable?",
        "answer": "No, you cannot reserve equipment that is currently unavailable. You will need to wait until it's back in stock."
    },
    {
        "question": "How can I check the current inventory of sports equipment?",
        "answer": "You can check the current inventory of sports equipment by browsing the reservation section in the app. The availability of each item will be displayed."
    },
    {
        "question": "Can I reserve multiple items at the same time?",
        "answer": "Yes, you can reserve multiple items at the same time, but there may be limits to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "What is the maximum number of equipment items I can reserve?",
        "answer": "The maximum number of equipment items you can reserve may vary. Please check the reservation rules in the app for specific details."
    },
    {
        "question": "Are there specific hours for equipment bookings?",
        "answer": "Yes, equipment bookings can be made during the hours of 8:00 AM to 5:30 PM."
    },
    {
        "question": "Hi bro",
        "answer": "Hi there! 👋 Welcome to Campus Sports Sphere. What can I help you with?"
    },
    {
        "question": "Helllo",
        "answer": "Hey! 👋 I'm here to help with all your Campus Sports Sphere needs. What would you like to know?"
    },
    {
        "question": "Good morning",
        "answer": "Good morning! 🌞 I'm the Campus Sports Sphere Bot. How may I assist you today?"
    },
    {
        "question": "What's the process for handling defective sports equipment?",
        "answer": "If you encounter defective sports equipment, report it through the app or to staff immediately. Return the item and you'll be able to reserve a replacement if available."
    },
    {
        "question": "How can I check equipment availability?",
        "answer": "You can check equipment availability in real-time through the app. Each item will show its current stock status and available time slots."
    },
    {
        "question": "Is there a way to know how many of each equipment are left?",
        "answer": "Yes, the app displays the current quantity available for each equipment item when you're making a reservation."
    },
     {
        "question": "What happens if the equipment I want is out of stock?",
        "answer": "If an equipment item is out of stock, it won't be available for reservation in the app. You can check back later or choose an alternative item if available."
    },
    {
        "question": "What should I do if I receive faulty equipment?",
        "answer": "If you receive faulty equipment, please report it immediately through the app's Help section or directly to the Sports Department staff."
    },
    {
        "question": "How do I report damaged sports gear?",
        "answer": "To report damaged sports gear, use the 'Report Issue' feature in the app or inform the Sports Department staff directly."
    },
    {
        "question": "The equipment I reserved is broken. What now?",
        "answer": "If the equipment you reserved is broken, please return it immediately and report the issue through the app or to the staff. You can then make a new reservation for a replacement."
    },
    {
        "question": "Can all students make reservations?",
        "answer": "Yes, all registered students can make equipment reservations using their Student ID and app account."
    },
    {
        "question": "Who is eligible to reserve sports equipment?",
        "answer": "All currently enrolled students are eligible to reserve sports equipment through the app."
    },
    {
        "question": "Do I need to be a student to book equipment?",
        "answer": "Yes, you need to be a registered student to book equipment. The app uses your Student ID for verification."
    },
    {
        "question": "Are there any restrictions on student reservations?",
        "answer": "While all students can make reservations, there may be limits on the number of items or duration of reservations to ensure fair access for everyone."
    },
    {
        "question": "Hello bro",
        "answer": "Hello! 👋 I'm the Campus Sports Sphere Bot. How can I assist you today?"
    },
    {
        "question": "What are the hours for equipment reservations?",
        "answer": "Equipment reservations can be made from 8:00 AM to 5:30 PM daily."
    },
    {
        "question": "When can I book sports equipment?",
        "answer": "You can book sports equipment any time between 8:00 AM and 5:30 PM."
    },
    {
        "question": "What's the time window for reserving sports gear?",
        "answer": "The time window for reserving sports gear is from 8:00 AM to 5:30 PM every day."
    },
    {
        "question": "How is the equipment inventory maintained?",
        "answer": "The equipment inventory is maintained by staff who regularly update the available quantities and check for any damaged items."
    },
    {
        "question": "Who is responsible for updating the equipment inventory?",
        "answer": "The Sports Department staff is responsible for updating the equipment inventory."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is updated in real-time as reservations are made and items are returned. Staff also perform regular inventory checks."
    },
    {
        "question": "Good afternoon",
        "answer": "Good afternoon! ☀️ What information do you need about our sports facilities or equipment?"
    },
    {
        "question": "Good Evening",
        "answer": "Good Evening! 🌒 What information do you need about our sports facilities or equipment?"
    },
    {
        "question": "Is there a specific process for students to reserve sports gear?",
        "answer": "Yes, students need to log into the app, select the equipment they want, choose a time slot, review the details, and confirm their reservation."
    },
    {
        "question": "What steps should I take if the equipment I received is not working?",
        "answer": "If the equipment you received is not working, please report it immediately through the app's Help section or contact the staff."
    },
    {
        "question": "Can I get a replacement for faulty equipment?",
        "answer": "Yes, you can get a replacement for faulty equipment. Please report the issue through the app's Help section or contact the staff directly."
    },
    {
        "question": "How do I know if an equipment item is available?",
        "answer": "The app will show the current availability of each equipment item when you are browsing the Reservation section."
    },
    {
        "question": "What if the equipment is not available?",
        "answer": "If the equipment is not available, it means it's currently out of stock. You can check back later or choose a different item."
    },
    {
        "question": "Can I reserve equipment that is currently unavailable?",
        "answer": "No, you cannot reserve equipment that is currently unavailable. You will need to wait until it's back in stock."
    },
    {
        "question": "How can I check the current inventory of sports equipment?",
        "answer": "You can check the current inventory of sports equipment by browsing the Reservation section in the app. The availability of each item will be displayed."
    },
    {
        "question": "Can I reserve multiple items at the same time?",
        "answer": "Yes, you can reserve multiple items at the same time, but there may be limits to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "What is the maximum number of equipment items I can reserve?",
        "answer": "The maximum number of equipment items you can reserve may vary. Please check the reservation rules in the app for specific details."
    },
    {
        "question": "Are there specific hours for equipment bookings?",
        "answer": "Yes, equipment bookings can be made during the hours of 8:00 AM to 5:30 PM."
    },
    {
        "question": "Hi bro",
        "answer": "Hi there! 👋 Welcome to Campus Sports Sphere. What can I help you with?"
    },
    {
        "question": "Helllo",
        "answer": "Hey! 👋 I'm here to help with all your Campus Sports Sphere needs. What would you like to know?"
    },
    {
        "question": "Good morning",
        "answer": "Good morning! 🌞 I'm the Campus Sports Sphere Bot. How may I assist you today?"
    },
     {
        "question": "How can I create a new account on the Campus Sports Sphere app?",
        "answer": "To create an account, go to the sign-up page and provide your student details, including your name, student ID, and email. Choose a password and complete the registration process."
    },
    {
        "question": "What are the steps to register for the Campus Sports Sphere app?",
        "answer": "To register, open the app, tap on 'Sign Up', enter your name, student ID, and email, choose a secure password, agree to the terms, and complete the registration."
    },
    {
        "question": "Can you explain the process of signing up for the Campus Sports Sphere app?",
        "answer": "The sign-up process involves opening the app, tapping 'Sign Up', entering your personal details (name, student ID, email), creating a password, agreeing to the terms, and finalizing your registration."
    },
    {
        "question": "How do I reset my password if I forget it?",
        "answer": "If you forget your password, look for a 'Forgot Password' link on the login page. Follow the instructions to reset your password using your registered email."
    },
    {
        "question": "What should I do if I need to cancel my event registration?",
        "answer": "To cancel an event registration, go to your Profile section, find the event you want to unregister from, and select the cancellation option."
    },
    {
        "question": "How can I view my current equipment reservations?",
        "answer": "You can view your current equipment reservations in the Profile tab within the app. This section shows all your active reservations."
    },
    {
        "question": "Where do I go to see what equipment I've reserved?",
        "answer": "To see what equipment you've reserved, navigate to the Profile section in the app. Here, you'll find a list of all your current reservations."
    },
    {
        "question": "Can you explain how to cancel an equipment reservation?",
        "answer": "To cancel an equipment reservation: 1) Go to your Profile or Reservations section, 2) Find the reservation you want to cancel, 3) Look for a 'Cancel' option next to it, 4) Confirm the cancellation when prompted."
    },
    {
        "question": "What's the process for extending an equipment reservation?",
        "answer": "To extend a reservation, check your current reservations for an 'Extend' option. If available, select it and choose a new return time. This is subject to the equipment's availability."
    },
    {
        "question": "How do I report faulty or damaged equipment?",
        "answer": "To report faulty equipment, use the app's Help and Support section or contact the staff directly. You can also write a query explaining the issue in detail."
    },
    {
        "question": "What should I do if the equipment I received is not working properly?",
        "answer": "If you receive faulty equipment, immediately report it through the app's Help and Support section or contact the staff directly. Provide details about the issue you're experiencing."
    },
    {
        "question": "When do I need to return the equipment I've reserved?",
        "answer": "You need to return the equipment by the end of your selected time slot. The app will send you a reminder when your reservation is about to expire."
    },
    {
        "question": "How can I check the rules for different sports events?",
        "answer": "To check event rules, go to the event details section. Look for a 'Rules' or 'Event Info' tab when viewing a specific event."
    },
    {
        "question": "What steps should I take if I can't attend a match I've registered for?",
        "answer": "If you can't attend a match, notify the event manager as soon as possible through the app. Look for an option to withdraw from the event or contact support."
    },
    {
        "question": "How do I update my personal information in the app?",
        "answer": "To update your personal information, go to the Profile section of the app. Look for an 'Edit Profile' or 'Account Settings' option to make changes."
    },
    {
        "question": "What if there's not enough equipment for everyone?",
        "answer": "The app manages reservations on a first-come, first-served basis. If an item is in high demand, consider reserving early or choosing alternative time slots or equipment."
    },
    {
        "question": "Who maintains the sports equipment inventory?",
        "answer": "The sports department staff maintains the equipment inventory, ensuring items are in good condition and accurately reflected in the app."
    },
    {
        "question": "How do you keep track of all the sports gear?",
        "answer": "We use a digital inventory system integrated with the app, which is updated in real-time with each reservation and return. Regular physical checks are also conducted."
    },
    {
        "question": "What's the process for updating equipment availability in the app?",
        "answer": "Equipment availability is automatically updated in the app when items are reserved or returned. Staff also manually update the system during routine checks."
    },
    {
        "question": "What's the maximum number of items I can reserve?",
        "answer": "The maximum number of items you can reserve is generally 3, but this may change based on equipment type and current demand. Check the app for specific limits."
    },
    {
        "question": "Which sports equipment categories are available for reservation on the app?",
        "answer": "The sports equipment categories available for reservation on the app include Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. You can reserve various items like balls, bats, rackets, and protective gear."
    },
    {
        "question": "Does the event organizer have the ability to change scheduled tournaments?",
        "answer": "Yes, the event organizer can reschedule or cancel tournaments as needed."
    },
    {
        "question": "Are there any limitations on scheduling multiple matches?",
        "answer": "Yes, two matches of the same sport cannot be scheduled for the same time slot."
    },
        {
        "question": "How do you keep track of all the sports gear?",
        "answer": "We use a digital inventory system integrated with the app, which is updated in real-time with each reservation and return. Regular physical checks are also conducted."
    },
    {
        "question": "What's the process for updating equipment availability in the app?",
        "answer": "Equipment availability is automatically updated in the app when items are reserved or returned. Staff also manually update the system during routine checks."
    },
    {
        "question": "What's the maximum number of items I can reserve?",
        "answer": "The maximum number of items you can reserve is generally 3, but this may change based on equipment type and current demand. Check the app for specific limits."
    },
    {
        "question": "Which sports equipment categories are available for reservation on the app?",
        "answer": "The sports equipment categories available for reservation on the app include Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. You can reserve various items like balls, bats, rackets, and protective gear."
    },
    {
        "question": "Does the event organizer have the ability to change scheduled tournaments?",
        "answer": "Yes, the Event Organizer can reschedule or cancel tournaments as needed."
    },
    {
        "question": "Are there any limitations on scheduling multiple matches?",
        "answer": "Yes, two matches of the same sport cannot be scheduled for the same time slot."
    },
    {
        "question": "What happens after my field booking request is accepted?",
        "answer": "If your field booking request is accepted, you'll receive a notification, and the time slot will be reserved for you. It will no longer be visible to other students for booking."
    },
    {
        "question": "Can the Event Manager modify scheduled events?",
        "answer": "Yes, the Event Manager can reschedule or delete events as needed."
    },
    {
        "question": "What happens if my ground reservation request is approved?",
        "answer": "If your ground reservation request is approved, you'll receive a notification, and the slot will be reserved for you. It will no longer be visible to other students for reservation."
    },
    {
        "question": "Are there any restrictions on scheduling multiple matches?",
        "answer": "Yes, no two matches of the same sport can be scheduled at the same time."
    },
    {
        "question": "Can I reserve equipment for someone else?",
        "answer": "No, equipment reservations are personal and tied to your student account. You cannot reserve equipment for other students."
    },
    {
        "question": "Is there a limit to how many items I can reserve at once?",
        "answer": "The app may have limits on the number of items you can reserve simultaneously to ensure fair access for all students. Check the reservation rules in the app for specific details."
    },
    {
        "question": "How do I update my account information?",
        "answer": "You can update your account information in the Profile section of the app. Look for an 'Edit Profile' or 'Account Settings' option."
    },
    {
        "question": "What should I do if I forget my password?",
        "answer": "If you forget your password, look for a 'Forgot Password' link on the login page. Follow the instructions to reset your password using your registered email."
    },
    {
        "question": "Can I see the availability of equipment before making a reservation?",
        "answer": "Yes, the app should show you the current availability of each equipment item when you're browsing the Reservation section."
    },
    {
        "question": "How far in advance can I reserve equipment?",
        "answer": "The reservation window may vary. Check the app for specific rules, but typically you can reserve equipment a few days to a week in advance."
    },
    {
        "question": "What happens if I'm late returning equipment?",
        "answer": "Late returns may result in penalties or restrictions on future reservations. Always try to return equipment on time or extend your reservation if needed."
    },
    {
        "question": "Can I extend my equipment reservation?",
        "answer": "You may be able to extend your reservation if the equipment is not reserved by someone else immediately after your slot. Check for an 'Extend Reservation' option in your current reservations."
    },
    {
        "question": "How do I cancel an equipment reservation?",
        "answer": "To cancel a reservation, go to your Profile or Reservations section and look for a 'Cancel' option next to your active reservations."
    },
    {
        "question": "Are there any fees for reserving equipment?",
        "answer": "Most equipment reservations are likely free for students, but check the app or with the Sports Department for any potential fees or deposits required."
    },
    {
        "question": "How do I report lost or damaged equipment?",
        "answer": "If equipment is lost or damaged, report it immediately through the app's Help section or directly to the Sports Department staff."
    },
    {
        "question": "Can graduate students use the app to reserve equipment?",
        "answer": "The app is designed for university students. If you're a graduate student, you should be able to use it, but verify with your Sports Department if there are any restrictions."
    },
    {
        "question": "How do I view upcoming sports events?",
        "answer": "Go to the Events section in the app to view all upcoming sports events. You can usually filter or sort events by date or sport type."
    },
    {
        "question": "Can I suggest new equipment for the university to acquire?",
        "answer": "You may be able to suggest new equipment through the app's Feedback or Help section. Alternatively, contact the Sports Department directly with your suggestions."
    },
    {
        "question": "How are teams assigned for multi-player sports events?",
        "answer": "Teams are typically formed based on registrations. The Event Manager may assign teams randomly or based on skill levels, depending on the event type."
    },
    {
        "question": "Can I choose my teammates for events?",
        "answer": "For most events, teams are assigned by the Event Manager. Some events might allow you to register as a pre-formed team, but check the specific event details."
    },
    {
        "question": "What happens if not enough players register for a team sport?",
        "answer": "If there aren't enough registrations, the event might be canceled or postponed. The Event Manager will notify registered players of any changes."
    },
    {
        "question": "How do I know if I've been selected for a team?",
        "answer": "You'll receive a notification through the app once teams have been formed. You can also check your Profile or the event details for team assignments."
    },
    {
        "question": "Can I participate in multiple events on the same day?",
        "answer": "You can register for multiple events, but be aware of potential time conflicts. The app should warn you if you're registering for overlapping events."
    },
    {
        "question": "How do I view the schedule of matches I'm participating in?",
        "answer": "Check your Profile section or the Events tab for a schedule of matches you're participating in. You should see dates, times, and locations for each match."
    },
    {
        "question": "What should I do if I can't attend a match I've registered for?",
        "answer": "If you can't attend a match, notify the Event Manager as soon as possible through the app. Look for an option to withdraw from the event or contact support."
    },
    {
        "question": "Can I reserve a ground for personal practice?",
        "answer": "Ground reservations are typically for organized events or matches. Check with the Sports Department if personal practice reservations are allowed."
    },
    {
        "question": "How far in advance are event schedules posted?",
        "answer": "Event schedules are usually posted several days to weeks in advance. Regular check the Events section for updates on upcoming events."
    },
    {
        "question": "Can I get notifications for new event postings?",
        "answer": "Yes, you should be able to set up notifications in the app settings to alert you when new events are posted or when registration opens."
    },
    {
        "question": "What information is shown in the weather API for ground reservations?",
        "answer": "The weather API typically shows current temperature, weather conditions (sunny, cloudy, rainy, etc.), and possibly a short-term forecast for the COMSATS University Islamabad area."
    },
    {
        "question": "How accurate is the weather information provided?",
        "answer": "The weather information is based on real-time data from a reliable weather service, but as with all weather forecasts, it's subject to change."
    },
    {
        "question": "Can I see past reservation history for equipment?",
        "answer": "Your past reservation history should be available in your Profile section. This can help you track your equipment usage over time."
    },
    {
        "question": "Is there a rating system for equipment quality?",
        "answer": "The app may include a feature for rating equipment quality after use. Check your reservation history or equipment details for any rating options."
    },
    {
        "question": "How do I report a bug in the app?",
        "answer": "To report a bug, use the Help and Support section in the app. Look for an option to report technical issues or bugs."
    },
    {
        "question": "Can I use the app on both iOS and Android devices?",
        "answer": "The app should be available for both iOS and Android devices. Download it from your device's app store."
    },
    {
        "question": "Is there a desktop version of the app?",
        "answer": "The app is primarily designed for mobile devices. Check with the university if there's a web version available for desktop use."
    },
    {
        "question": "How secure is my personal information in the app?",
        "answer": "The app uses standard security measures to protect your personal information. Always keep your login credentials private and use a strong, unique password."
    },
    {
        "question": "Can I link my Student ID to the app?",
        "answer": "Your Student ID is likely linked to your account during registration. Contact support if you need to update or verify your Student ID in the app."
    },
    {
        "question": "How do I update my sports preferences for event recommendations?",
        "answer": "Go to your Event tab and look for an option to update your sports preferences or interests. This will help tailor event recommendations to your liking."
    },
    {
        "question": "Can I see who else is registered for an event?",
        "answer": "For privacy reasons, you might not be able to see other registrants. However, you may be able to see team assignments once they're made."
    },
    {
        "question": "Is there a waitlist for popular events?",
        "answer": "Popular events may have a waitlist feature. If an event is full, look for an option to join the waitlist in case spots open up."
    },
    {
        "question": "How do I know if an event I registered for is canceled?",
        "answer": "You'll receive a notification if an event you're registered for is canceled. Always check the app for the most up-to-date event information."
    },
    {
        "question": "Can I request specific equipment for an event?",
        "answer": "Equipment for events is typically standardized. If you need specific equipment, contact the Event Manager or Sports Department directly."
    },
    {
        "question": "How do I view the rules for different sports events?",
        "answer": "Event rules should be available in the event details section. Look for a 'Rules' or 'Event Info' tab when viewing an event."
    },
    {
        "question": "Is there a feature to find teammates or opponents for practice matches?",
        "answer": "The app may have a community or social feature to connect with other players. Check for a 'Community' or 'Find Players' section."
    },
    {
        "question": "How do I track my sports performance in the app?",
        "answer": "The app currently does not have a performance tracking feature. It will be added in a future update."
    },
    {
        "question": "Can I get reminders for my equipment return deadlines?",
        "answer": "Yes, the app should send you notifications reminding you of upcoming equipment return deadlines."
    },
    {
        "question": "How do I provide feedback on the app's features?",
        "answer": "Use the Help and Support section to provide feedback. There may be a specific 'Feedback' or 'Suggestions' option."
    },
    {
        "question": "Is there a chat feature to communicate with other players or staff?",
        "answer": "Check if the app has a messaging or chat feature. This could be useful for communicating with staff only."
    },
    {
        "question": "How often is the equipment inventory updated?",
        "answer": "The equipment inventory is likely updated in real-time as reservations are made and items are returned. Staff may also perform regular inventory checks."
    },
    {
        "question": "How do I find information about accessibility features for sports facilities?",
        "answer": "Look for a 'Help and Support' section that provides information on accessible features of sports grounds and equipment."
    },
    {
        "question": "Can I see a list of sports equipment that's suitable for beginners?",
        "answer": "Our list of sports equipment is for every student!"
    },
    {
        "question": "Is there a feature to create and share sports challenge videos with other users?",
        "answer": "No, there is no such feature available in the app right now."
    },
    {
        "question": "Can I see a list of sports equipment that's designed for use in extreme temperatures?",
        "answer": "Look for an 'Extreme Weather Gear' or 'All-Climate Equipment' section that highlights sports equipment suitable for very hot or cold conditions."
    },
    {
        "question": "What's the process for signing up on the Sports Sphere app?",
        "answer": "To sign up, navigate to the Registration page and enter your student information, including your full name, Student Identification Number, and university email address. Choose a secure password, then complete the registration process by following the on-screen instructions."
    },
    {
        "question": "Which sports gear can I book through the app?",
        "answer": "The app allows you to book a wide range of sports equipment, including items for Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, and Tennis. This covers various items such as balls, bats, rackets, protective gear, and more."
    },
    {
        "question": "How do I go about booking sports equipment on the app?",
        "answer": "After logging in, navigate to the Home tab. Browse the available equipment, select the item you want, and tap the 'Book' button. Choose your preferred time slot, review the booking details, and confirm your reservation."
    },
    {
        "question": "What are the operating hours for equipment bookings?",
        "answer": "You can make equipment bookings from 8:00 AM until 5:30 PM."
    },
    {
        "question": "How do I register for a sports event?",
        "answer": "To register for a sports event: 1) Open the app and go to the 'Events' section, 2) Browse available events, 3) Select the event you're interested in, 4) Click 'Register' or 'Sign Up', 5) Fill in any required information, 6) Confirm your registration. You'll receive a confirmation notification once you're registered."
    },
    {
        "question": "What's the process for signing up for a sports tournament?",
        "answer": "To sign up for a sports tournament: First, log into the app and navigate to the Events tab. Browse the list of upcoming tournaments, select the one you want to join, and click on the registration button. Follow the prompts to complete your registration, which may include providing some personal information or forming a team."
    },
    {
        "question": "Can you explain how to join a campus sports event?",
        "answer": "Joining a campus sports event is easy! Just open the app, go to the Events section, and find the event you're interested in. Click on it for more details, then look for a 'Join' or 'Register' button. Follow the steps to complete your registration, which might include choosing your role (player, spectator, etc.) or joining a team."
    },
    {
        "question": "What steps do I need to follow to participate in a sports competition?",
        "answer": "To participate in a sports competition: 1) Open the app, 2) Go to 'Events' or 'Competitions', 3) Find the competition you want to join, 4) Click for more details, 5) Hit the 'Participate' or 'Register' button, 6) Fill out any required forms or information, 7) Submit your registration. You'll get a confirmation once you're successfully registered."
    },
    {
        "question": "How can I sign up for upcoming sports events on campus?",
        "answer": "Signing up for upcoming sports events is simple: Open the Campus Sports Sphere app and head to the Events section. You'll see a list of upcoming events. Choose the one you're interested in, tap on it, and look for the registration option. Follow the prompts to complete your sign-up, which may include selecting your preferred role or team."
    },
    {
        "question": "How do I reserve a sports ground?",
        "answer": "To reserve a sports ground: 1) Log into the app, 2) Go to 'Ground Reservations', 3) Select the type of ground you need (e.g., Cricket field, Football pitch), 4) Choose an available date and time slot, 5) Review the reservation details, 6) Confirm your booking. You'll receive a confirmation once your reservation is approved."
    },
    {
        "question": "What's the process for booking a sports field?",
        "answer": "To book a sports field, start by opening the app and navigating to the 'Facilities' or 'Ground Booking' section. Choose the type of field you need, then select an available date and time slot. Review the booking details, including any fees or rules, and confirm your reservation. You'll get a notification when your booking is approved."
    },
    {
        "question": "Can you explain how to reserve a playing ground on campus?",
        "answer": "Reserving a playing ground is straightforward: Open the app and find the 'Ground Reservations' section. Select the type of ground you need (like a Football field or Basketball court). Browse available time slots and pick one that works for you. Review any rules or fees, then confirm your reservation. You'll receive an approval notification soon after."
    },
    {
        "question": "What steps do I need to follow to book a sports court?",
        "answer": "To book a sports court: 1) Open the app, 2) Navigate to 'Facility Bookings' or 'Court Reservations', 3) Choose the type of court you need, 4) Select an available date and time, 5) Review any rules or fees associated with the booking, 6) Confirm your reservation. You'll get a confirmation message once your booking is processed."
    },
    {
        "question": "How can I reserve a pitch for my team practice?",
        "answer": "To reserve a pitch for team practice: First, log into the app and go to the 'Ground Bookings' section. Select the type of pitch you need (e.g., Football, Cricket). Choose from the available dates and times that suit your team's schedule. Review any usage rules or fees, then confirm your booking. You'll receive a notification when your reservation is approved."
    },
    {
        "question": "What's the procedure for securing a sports ground for an event?",
        "answer": "To secure a sports ground for an event: Open the app and navigate to 'Facility Reservations'. Select 'Sports Grounds' and choose the specific type you need. Pick an available date and time slot that fits your event schedule. You may need to provide event details. Review any rules or fees, then submit your reservation request. Approval notification will be sent to you once processed."
    },
    {
        "question": "How do I go about reserving an outdoor court for a game?",
        "answer": "To reserve an outdoor court: 1) Open the app, 2) Go to 'Court Bookings', 3) Select 'Outdoor Courts', 4) Choose the specific court type (e.g., Tennis, Basketball), 5) Pick an available date and time, 6) Review any usage guidelines or fees, 7) Confirm your reservation. You'll receive a booking confirmation once it's approved."
    },
    {
        "question": "Can you walk me through the process of booking a sports field on campus?",
        "answer": "Sure! Here's how to book a sports field: Open the Campus Sports Sphere app and find the 'Facility Bookings' section. Choose 'Sports Fields' and select the type you need (e.g., Soccer field, Cricket pitch). Browse the calendar for available slots and pick a suitable time. Review any rules or fees associated with the booking. Finally, confirm your reservation. You'll get a notification when your booking is approved."
    },
    {
        "question": "How many items can I reserve at once?",
        "answer": "Students can typically reserve up to 3 items at a time, but this may vary depending on the type of equipment and current demand."
    },
    {
    "question": "How do I book sports equipment on the app?",
    "answer": "To book sports equipment, log into the app, go to the equipment section, choose the item you want, select a time slot, and confirm your reservation."
},
{
    "question": "What's the process for reserving sports gear through the app?",
    "answer": "To reserve sports gear, open the app, navigate to the equipment section, browse or search for the item you want, check its availability and select a time slot, review the reservation details, and confirm your booking."
},
{
    "question": "Can you explain how to reserve sports equipment on the app?",
    "answer": "To reserve sports equipment, log into the app and go to the equipment section. Find the item you need, check its availability, and choose a time slot that works for you. Review the details and confirm your reservation."
},
{
    "question": "What steps do I need to follow to reserve sports equipment on the app?",
    "answer": "To reserve sports equipment, follow these steps: 1) Log into the app, 2) Navigate to the equipment section, 3) Select the sport and equipment type, 4) Choose an available time slot, 5) Review the reservation details, 6) Confirm your booking."
},
{
    "question": "How can I book sports gear using the Campus Sports Sphere app?",
    "answer": "To book sports gear, open the app and go to the equipment booking section. Select the item you want to reserve, pick an available time slot, review the reservation details, and confirm your booking."
},
{
    "question": "What's the procedure for reserving sports equipment through the university app?",
    "answer": "The procedure for reserving equipment is: 1) Log into the app, 2) Go to the equipment section, 3) Select the desired equipment, 4) Choose an available time slot, 5) Review and confirm your reservation."
},
{
    "question": "Could you walk me through the equipment reservation process on the app?",
    "answer": "Sure! To reserve equipment, first log into the app. Then, go to the equipment section and find the item you need. Check its availability and select a suitable time slot. Review the reservation details and confirm your booking."
},
{
    "question": "I need to reserve some sports equipment. How do I do that in the app?",
    "answer": "To reserve sports equipment, follow these steps: 1) Open the app and log in, 2) Navigate to the equipment section, 3) Find and select the equipment you need, 4) Choose an available time slot, 5) Review the details, 6) Confirm your reservation."
},
{
    "question": "How do I register for a sports event on the app?",
    "answer": "To register for a sports event, go to the events section in the app, browse available events, select the event you're interested in, and follow the registration process."
},
{
    "question": "What's the process for signing up for a sports tournament on the app?",
    "answer": "To sign up for a sports tournament, navigate to the events tab in the app, browse the list of upcoming tournaments, select the one you want to join, and follow the registration steps."
},
{
    "question": "Can you explain how to join a sports event on the app?",
    "answer": "To join a sports event, follow these steps: 1) Open the app and go to the events section, 2) Browse through the list of available events, 3) Select the event you want to join, 4) Click on the registration button, 5) Fill out any required information, and 6) Confirm your registration."
},
 {
        "question": "Is this app for COMSATS University Islamabad students only?",
        "answer": "Yes, this app is exclusively for COMSATS University Islamabad (CUI) students to manage sports equipment reservations and event registrations."
    },
    {
        "question": "Can students from other universities use this app for COMSATS sports facilities?",
        "answer": "No, this app is specifically designed for COMSATS University Islamabad (CUI) students only."
    },
    {
        "question": "Does this app cover all COMSATS campuses or just Islamabad?",
        "answer": "This app is specifically for the COMSATS University Islamabad (CUI) campus and its sports facilities."
    },
    {
        "question": "How do I reserve sports equipment at COMSATS University Islamabad?",
        "answer": "To reserve sports equipment at CUI, log into the app, go to the equipment section, select the item you want, choose a time slot, and confirm your reservation."
    },
    {
        "question": "Can CUI students use this app to book sports grounds?",
        "answer": "Yes, CUI students can use this app to book sports grounds. Go to the ground reservation section, select the desired ground, and choose an available time slot."
    },
    {
        "question": "Is this the official sports app for COMSATS Islamabad?",
        "answer": "Yes, this is the official sports app for COMSATS University Islamabad (CUI) to manage equipment reservations and sports events."
    },
    {
        "question": "Does this app handle HEC sports events?",
        "answer": "No, this app only deals with sports events and equipment reservations for COMSATS University Islamabad (CUI). It does not handle HEC sports events."
    },
    {
        "question": "Can I use this app to register for HEC tournaments?",
        "answer": "No, this app is exclusively for CUI internal sports events and equipment reservations. It does not handle HEC tournaments."
    },
    {
        "question": "Does the app include information about HEC sports competitions?",
        "answer": "No, this app is focused solely on COMSATS University Islamabad sports activities. It does not include information about HEC sports competitions."
    },
    {
        "question": "Can I book equipment for HEC events through this app?",
        "answer": "No, this app is only for booking equipment for COMSATS University Islamabad events and personal use. It does not handle equipment for HEC events."
    },
    {
        "question": "Are HEC sports schedules available on this app?",
        "answer": "No, this app only provides schedules for COMSATS University Islamabad sports events. HEC sports schedules are not included."
    },
    {
        "question": "How do I register for COMSATS Islamabad sports events?",
        "answer": "To register for CUI sports events, open the app, go to the events section, select the event you're interested in, and follow the registration process."
    },
    {
        "question": "What sports facilities can I book at COMSATS University Islamabad?",
        "answer": "You can book various sports facilities at CUI including cricket grounds, football fields, basketball courts, and more. Check the app for a full list of available facilities."
    },
    {
        "question": "Is this app connected to the main COMSATS University system?",
        "answer": "Yes, this app is integrated with the COMSATS University Islamabad system for student verification and sports facility management."
    },
    {
        "question": "Can COMSATS faculty use this app for sports facilities?",
        "answer": "This app is primarily for CUI students. Faculty usage may be limited or require special permissions. Check with the Sports Department for more information."
    },
    {
        "question": "Does this app show all sports events happening at COMSATS Islamabad?",
        "answer": "Yes, the app displays all official sports events organized by COMSATS University Islamabad's Sports Department."
    },
    {
        "question": "How do I report issues with sports equipment at CUI?",
        "answer": "To report issues with sports equipment at CUI, use the 'Report Issue' feature in the app or contact the Sports Department directly through the app."
    },
    {
        "question": "Can I use this app to suggest new sports for COMSATS University?",
        "answer": "While the app doesn't have a direct feature for this, you can use the feedback section to suggest new sports for CUI. Your suggestions will be forwarded to the Sports Department."
    },
    {
        "question": "Does this app cover inter-university events or just COMSATS internal events?",
        "answer": "This app primarily covers COMSATS University Islamabad internal events. Inter-university events may be listed if CUI is participating, but the app doesn't handle registrations for these."
    },
    {
        "question": "Is there a way to contact COMSATS sports officials through this app?",
        "answer": "Yes, you can contact CUI sports officials through the app's Help and Support section or through specific event contact information."
    },
    {
        "question": "Can I use this app to join COMSATS University sports teams?",
        "answer": "While you can't directly join teams through the app, you can use it to register for tryouts or selection events for CUI sports teams when they are announced."
    },
    {
        "question": "Does this app handle registrations for national-level competitions?",
        "answer": "No, this app is specifically for COMSATS University Islamabad sports activities. It does not handle registrations for national-level competitions."
    },
    {
        "question": "Can I use this app to participate in inter-COMSATS campus tournaments?",
        "answer": "This app is primarily for COMSATS University Islamabad campus. Inter-campus tournaments may be listed, but registration processes might differ. Check event details for specific information."
    },
     {
        "question": "I'm really sorry for the inconvenience.",
        "answer": "Thank you for your understanding! 🙏"
    },
    {
        "question": "I apologize for any trouble caused.",
        "answer": "No worries, I appreciate your apology! 😊"
    },
    {
        "question": "Please forgive me for my mistake.",
        "answer": "It's all good, we all make mistakes! 👍"
    },
    {
        "question": "I’m sorry if I upset you.",
        "answer": "I appreciate you saying that; it means a lot. ❤️"
    },
    {
        "question": "I sincerely regret what happened.",
        "answer": "Thank you for your sincerity! We can move forward. 🌟"
    },
    {
        "question": "My apologies for the misunderstanding.",
        "answer": "Thanks for clarifying! Let's get back on track. 😊"
    },
    {
        "question": "I didn’t mean to cause any issues, I'm sorry.",
        "answer": "I understand, and I appreciate your honesty. 🙌"
    },
    {
        "question": "I hope you can forgive me.",
        "answer": "Of course, we all have our moments! 💖"
    },
    {
        "question": "I take full responsibility and I’m sorry.",
        "answer": "Your accountability is commendable; thank you! 🌈"
    },
    {
        "question": "I regret my actions and I’m truly sorry.",
        "answer": "It's okay; we can learn from this! 🌻"
    },
    {
        "question": "I’m really sorry about that.",
        "answer": "No problem at all, I appreciate your concern! 😊"
    },
    {
        "question": "I’m sorry for any confusion.",
        "answer": "Thank you for clearing that up! 👍"
    },
    {
        "question": "Please accept my apologies.",
        "answer": "I appreciate it, and we're good! 🙏"
    },
    {
        "question": "I deeply regret any hurt I've caused.",
        "answer": "Your feelings are valid; let's move forward together. 💕"
    },
    {
        "question": "I apologize for the oversight.",
        "answer": "Thanks for owning up to it; it happens! 🌟"
    },
    {
        "question": "I’m truly sorry for the error.",
        "answer": "Errors are part of life; we can learn from them! 💪"
    },
    {
        "question": "I’m sorry if I came across the wrong way.",
        "answer": "I appreciate your intention; we're all good! 😊"
    },
    {
        "question": "I feel terrible about what happened.",
        "answer": "Your feelings matter; let’s move on positively!"
    },
    {
        "question": "I’m sorry for any misunderstanding.",
        "answer": "No harm done; I'm glad we talked it out! 👍"
    },
    {
        "question": "I didn’t intend to offend you; I apologize.",
        "answer": "Thank you for clarifying; it means a lot!"
    },
    {
        "question": "I truly regret my actions.",
        "answer": "It's great to see your willingness to reflect! 🌟"
    },
      {
        "question": "What is the purpose of the Campus Sports Sphere app?",
        "answer": "The purpose of the Campus Sports Sphere app is to provide a platform for students and staff at COMSATS University Islamabad to book sports facilities, reserve equipment, and register for events."
    },
    {
        "question": "How do I access the Campus Sports Sphere app?",
        "answer": "You can access the Campus Sports Sphere app by downloading it from the app store or by visiting the COMSATS University Islamabad website."
    },
    {
        "question": "What are the benefits of using the Campus Sports Sphere app?",
        "answer": "The benefits of using the Campus Sports Sphere app include easy booking of sports facilities, convenient equipment reservation, and streamlined event registration."
    },
    {
        "question": "Is the Campus Sports Sphere app available for both iOS and Android?",
        "answer": "Yes, the Campus Sports Sphere app is available for both iOS and Android devices."
    },
    {
        "question": "How do I reset my password?",
        "answer": "To reset your password, go to the login page and click on the 'Forgot Password' link. Follow the instructions to reset your password."
    },
    {
        "question": "What if I forget my username?",
        "answer": "If you forget your username, you can try to recover it by going to the login page and clicking on the 'Forgot Username' link."
    },
    {
        "question": "How do I report a technical issue?",
        "answer": "To report a technical issue, go to the 'Help and Support' section of the app and submit a ticket. Our support team will respond to your issue as soon as possible."
    },
    {
        "question": "What is the policy on refunds and cancellations?",
        "answer": "Our policy on refunds and cancellations is outlined in the terms and conditions of the app. Please review the terms and conditions for more information."
    },
    {
        "question": "How do I contact the support team?",
        "answer": "You can contact the support team by going to the 'Help and Support' section of the app and submitting a ticket. You can also email us at [support email]."
    },
    {
        "question": "Sorry",
        "answer": "No problem! 😊 Is there anything I can help you with?"
    },
    {
        "question": "My bad",
        "answer": "Don't worry about it!  😄 What can I do for you?"
    },
    {
        "question": "Oops, sorry",
        "answer": "That's okay! 😊 Happens to the best of us. What were you asking?"
    },
    {
        "question": "I apologize",
        "answer": "No need to apologize! 😊 How can I assist you?"
    },
    {
        "question": "Excuse me",
        "answer": "Yes? 😊 How can I help you?"
    },
    {
        "question": "Sorry, I didn't mean to say that",
        "answer": "No worries! 😊 What can I help you with?"
    },
    {
        "question": "Sorry for the trouble",
        "answer": "It's no trouble at all! 😊 How can I assist you?"
    },
     {
        "question": "Apologies",
        "answer": "No need to apologize! 🙏 How can I assist you today?"
    },
    {
        "question": "I'm sorry",
        "answer": "No worries at all! 😊 What can I do to help you?"
    },
    {
        "question": "Excuse me",
        "answer": "How can I help you? 🙂 Please go ahead and ask your question."
    },
    {
        "question": "Pardon me",
        "answer": "No problem! 👍 What would you like assistance with?"
    },
    {
        "question": "My apologies",
        "answer": "No need to apologize. 🙂 How can I be of help?"
    },
    {
        "question": "I apologize",
        "answer": "No need to apologize. 🙏 How can I assist you today?"
    },
    {
        "question": "Sorry about that",
        "answer": "No worries at all! 😊 How can I help you now?"
    },
    {
        "question": "I'm really sorry",
        "answer": "Don't worry about it! 🙂 What can I do to help you?"
    },
    {
        "question": "Oops, my bad",
        "answer": "No problem! 👍 What would you like me to help with?"
    },
      {
        "question": "Your response is wrong.",
        "answer": "I apologize if my response was incorrect. 🙇‍♂️ Could you please rephrase your question or provide more context? I'll do my best to understand and provide a better answer."
    },
    {
        "question": "That's not right.",
        "answer": "I apologize, it seems I made a mistake. 😕 Could you please clarify your question or provide more information? I'll try my best to get it right this time."
    },
    {
        "question": "That's not what I meant.",
        "answer": "My apologies! It appears I misunderstood your request. 🤔  Could you please rephrase your question or explain what you're looking for?"
    },
    {
        "question": "You're wrong.",
        "answer": "I apologize if my response was incorrect. 🙇‍♂️ Could you please provide more context or rephrase your question so I can understand better and give you a more accurate answer?"
    },
    {
        "question": "I think you're wrong.",
        "answer": "I apologize if I misunderstood your request. 😕  Could you please rephrase your question or provide more information so I can understand better and give you a more accurate answer?"
    },
    {
        "question": "You got it wrong.",
        "answer": "I apologize for the misunderstanding. 😕 Could you please rephrase your question or explain what you're looking for?"
    },
    {
        "question": "That's not what I asked.",
        "answer": "My apologies! 🙇‍♂️ It seems I misunderstood your question. Please clarify what you're looking for, and I'll try my best to provide a correct response."
    },
    {
        "question": "That's incorrect.",
        "answer": "I apologize if my response was incorrect. 😕 Could you please rephrase your question or provide more context? I'll do my best to understand and provide a better answer."
    },
        {
        "question": "Your response is incorrect",
        "answer": "I apologize for the mistake. How can I assist you better? Please provide more details or ask your question again."
    },
    {
        "question": "The information you provided is wrong",
        "answer": "I'm sorry about that. Can you please provide more details or ask your question again so I can assist you better?"
    },
    {
        "question": "Your answer is not correct",
        "answer": "I apologize for the error. Please provide more details or ask your question again so I can assist you more accurately."
    },
    {
        "question": "This isn't the right response",
        "answer": "I'm sorry about that. Can you please provide more details or ask your question again? I'm here to help!"
    },
    {
        "question": "The response is incorrect",
        "answer": "I apologize for the mistake. Can you please provide more details or ask your question again so I can assist you better?"
    },
    {
        "question": "Your response is not accurate",
        "answer": "I'm sorry for the inaccuracy. Please provide more details or ask your question again so I can help you better."
    },
    {
        "question": "This information isn't correct",
        "answer": "I apologize for the error. Can you please provide more details or ask your question again? I'm here to assist you better."
    },
    {
        "question": "This isn't the correct answer",
        "answer": "I'm sorry for the mistake. Please provide more details or ask your question again so I can help you more accurately."
    },
    {
        "question": "The response is wrong",
        "answer": "I apologize for that. Can you please provide more details or ask your question again so I can assist you better?"
    },
    {
        "question": "Your answer is wrong",
        "answer": "I'm sorry for the error. Please provide more details or ask your question again so I can help you better."
    },
    {
        "question": "This isn't the right information",
        "answer": "I apologize for the mistake. Can you please provide more details or ask your question again? I'm here to help!"
    },
     {
        "question": "You're useless.",
        "answer": "I’m sorry to hear you feel that way. 🙇‍♂️ Please let me know how I can improve or what specific information you need, and I'll do my best to help!"
    },
    {
        "question": "You don't know anything.",
        "answer": "I apologize if I missed the mark. 😕 Can you provide more details about what you're looking for? I'll work to provide a better answer."
    },
    {
        "question": "This isn't helpful.",
        "answer": "I'm sorry to hear that. 🙁 Could you let me know what you were hoping for? I want to assist you as best as I can!"
    },
    {
        "question": "You're not making any sense.",
        "answer": "I apologize for any confusion. 🤔 Could you please clarify your question or explain what you're trying to understand? I’ll do my best to help!"
    },
    {
        "question": "I expected more from you.",
        "answer": "I'm sorry to let you down. 😔 What specific information were you looking for? I’m here to assist you!"
    },
    {
        "question": "This is not what I need.",
        "answer": "I apologize for the misunderstanding. 😕 Can you please share more about what you're looking for? I want to help!"
    },
    {
        "question": "You missed the point.",
        "answer": "I’m sorry if I misunderstood your question. 🙇‍♂️ Please clarify your point, and I'll do my best to address it."
    },
    {
        "question": "Your information is incorrect.",
        "answer": "I apologize if the information I provided was wrong. 😟 Could you let me know what was incorrect? I want to ensure you get accurate answers."
    },
    {
        "question": "Why can't you get this right?",
        "answer": "I understand your frustration, and I apologize for the error. 😔 Please help me understand what you need, and I'll strive to improve."
    },
    {
        "question": "You don't seem to understand.",
        "answer": "I’m sorry if I’m not meeting your expectations. 😕 Can you provide more context or clarify your question? I'm here to help!"
    },
     {
        "question": "This app is useless.",
        "answer": "I'm sorry to hear that you're feeling this way about the app. 🙇‍♂️ Please let me know what issues you're experiencing, and I'll do my best to assist you!"
    },
    {
        "question": "Campus Sports Sphere is not helpful.",
        "answer": "I apologize if you're finding it unhelpful. 😕 Can you share what specific features you think need improvement? Your feedback is valuable!"
    },
    {
        "question": "I don’t see the point of this app.",
        "answer": "I’m sorry to hear that. 😔 What specific functionalities or features would you like to see? I want to make this app more useful for you!"
    },
    {
        "question": "This app isn't doing anything for me.",
        "answer": "I apologize for any inconvenience. 🙁 Could you let me know what you're trying to achieve? I’d love to help you find a solution!"
    },
    {
        "question": "Why is this app so bad?",
        "answer": "I'm sorry you feel that way! 😟 Can you tell me what specifically you find frustrating? Your insights can help improve the app."
    },
    {
        "question": "Campus Sports Sphere is a waste of time.",
        "answer": "I apologize if you're feeling that way. 😔 Please share what you were hoping to get from the app, and I'll do my best to assist you!"
    },
    {
        "question": "This app doesn’t work for me.",
        "answer": "I’m really sorry to hear that! 🙇‍♂️ Can you let me know what issues you're facing? I want to help resolve them."
    },
    {
        "question": "This app is pointless.",
        "answer": "I apologize for your disappointment. 😕 What features would you like to see that could make it more valuable to you?"
    },
    {
        "question": "I find this app frustrating.",
        "answer": "I'm sorry to hear that you're frustrated. 😟 Please let me know what specific problems you're encountering, and I'll work on helping you!"
    },
     {
        "question": "Why is the SignUp process so complicated?",
        "answer": "I understand it might seem complicated, but the validation steps are there to ensure your information is accurate and secure. This helps prevent issues down the line! If you have any questions, feel free to ask. 😊"
    },
    {
        "question": "What if I forget my password after signing up?",
        "answer": "No worries! You can reset your password by following the 'Forgot Password?' link on the SignIn screen. Just provide your email, and you'll receive instructions to set a new password. 🔑"
    },
    {
        "question": "I entered my registration number, but it says it's invalid. What should I do?",
        "answer": "Make sure your registration number follows the required format, like 'XX00-XXX-000.' If it still doesn't work, double-check for any typos or let me know, and I'll assist you! 📋"
    },
    {
        "question": "Is my data safe when I sign up?",
        "answer": "Absolutely! Your data is stored securely in Firebase, and we take privacy seriously. Only necessary information is collected, and it's kept safe. 🔒"
    },
    {
        "question": "Can I use this app without signing up?",
        "answer": "To access certain features, like booking equipment, you need to create an account. Signing up helps us personalize your experience and keep track of your reservations. 📲"
    },
    {
        "question": "I don't remember if I already signed up. Can I check?",
        "answer": "If you're unsure, you can try signing in with your email. If your account exists, you'll be able to log in. Otherwise, you can proceed with registration. If you need further help, just let me know! 🤔"
    },
    {
        "question": "What do I do if I can't receive the registration confirmation email?",
        "answer": "If you don’t receive the email, check your spam or junk folder. If it's not there, you can try resending it or verify if you've entered the correct email address. Let me know if you need more help! 📧"
    },
    {
        "question": "What happens after I register?",
        "answer": "After you register, you'll be redirected to the SignIn screen. From there, you can log in and start booking sports equipment right away! 🏆"
    },
    {
        "question": "Why do I have to enter my full name?",
        "answer": "Your full name helps us create a personalized experience and ensures that your account is easily recognizable. Plus, it’s great for connecting with fellow users! 😊"
    },
    {
        "question": "How do I know if my registration was successful?",
        "answer": "Once you complete the registration process, you'll see a confirmation message, and you'll be redirected to the SignIn screen. If you encounter any issues, just let me know! 🎉"
    },
    {
        "question": "Campus Sports Sphere is not worth using.",
        "answer": "I understand your frustration, and I'm sorry to hear that. 🙁 Could you share your thoughts on how we could improve the experience for you?"
    },
    {
        "question": "I'm so sorry",
        "answer": "No need to apologize. 🙏 How can I assist you today?"
    },
    {
        "question": "What are the hours of operation for the support team?",
        "answer": "The support team is available to assist you during regular business hours. Please check the app for specific hours of operation."
    },
    {
        "question": "How do I provide feedback on the app?",
        "answer": "You can provide feedback on the app by going to the 'Help and Support' section and submitting a ticket. You can also email us at [support email]."
    },
    {
        "question": "I’m sorry for how things turned out.",
        "answer": "It's okay; we can work towards a better outcome! 😊"
    },
    {
        "question": "Does the app provide information about sports scholarships at COMSATS?",
        "answer": "While the app focuses on sports activities and reservations, it may include announcements about CUI sports scholarships. Check the notifications or news section for such information."
    },
    {
        "question": "Can alumni of COMSATS University Islamabad use this app?",
        "answer": "This app is designed for current CUI students. Alumni access may be limited. Check with the Sports Department for any alumni sports programs or access options."
    },
{
    "question": "How can I sign up for a sports event on the app?",
    "answer": "To sign up for a sports event, open the app, navigate to the events section, browse available events, select the event you're interested in, and follow the registration process."
},
{
    "question": "What steps do I need to follow to participate in a sports competition on the app?",
    "answer": "To participate in a sports competition, follow these steps: 1) Open the app, 2) Go to the events section, 3) Find the competition you want to join, 4) Click for more details, 5) Hit the 'Participate' or 'Register' button, 6) Fill out any required forms or information, 7) Submit your registration."
},
{
    "question": "How can I sign up for upcoming sports events on the app?",
    "answer": "To sign up for upcoming sports events, open the app, navigate to the events section, browse available events, select the event you're interested in, and follow the registration process."
},
  {
        "question": "Okay",
        "answer": "Okay! 👍 What else can I help you with?"
    },
    {
        "question": "Ok",
        "answer": "Ok! 😄 Let me know if you have any other questions."
    },
    {
        "question": "Thanks",
        "answer": "You're welcome! 😊 Feel free to ask if you need more help."
    },
    {
        "question": "Thankyou",
        "answer": "No problem! 😊 Happy to help."
    },
    {
        "question": "Thnx",
        "answer": "Anytime! 👍"
    },
    {
        "question": "Tnx",
        "answer": "Sure thing! 😄"
    },
      {
        "question": "I need help",
        "answer": "I'm here to help! 🆘 What specific assistance do you need with our sports facilities or app?"
    },
    {
        "question": "Can you help me?",
        "answer": "Absolutely! I'd be glad to help. 😊 What do you need assistance with regarding our sports services?"
    },
    {
        "question": "Is anyone there?",
        "answer": "Yes, I'm here! 🙋 How can I assist you with our sports facilities or events?"
    },
    {
        "question": "Who are you?",
        "answer": "I'm the Campus Sports Sphere chatbot, designed to help you with all your sports-related queries and bookings! 🤖🏀"
    },
    {
        "question": "What can you do?",
        "answer": "I can help you with booking sports facilities, checking event schedules, managing equipment reservations, and answering any questions about our sports services! 📅🏟️"
    },
    {
        "question": "Cool",
        "answer": "Glad you think so! 😎 Is there anything specific you'd like to know about our sports facilities?"
    },
    {
        "question": "Great",
        "answer": "Excellent! 🌟 Let me know if there's anything else you need help with."
    },
    {
        "question": "I don't understand",
        "answer": "I'm sorry for the confusion. 😕 Could you please rephrase your question? I'll do my best to explain more clearly."
    },
    {
        "question": "Can you repeat that?",
        "answer": "Of course! 🔁 Which part would you like me to repeat or explain further?"
    },
     {
        "question": "I need help",
        "answer": "I'm here to help! 🆘 What specific assistance do you need with our sports facilities or app?"
    },
    {
        "question": "Can you help me?",
        "answer": "Absolutely! I'd be glad to help. 😊 What do you need assistance with regarding our sports services?"
    },
        {
        "question": "How are you?",
        "answer": "I'm doing well, thanks for asking! 😊 As a bot, I'm always here and ready to assist you. How can I help you today?"
    },
    {
        "question": "How are you doing?",
        "answer": "I'm functioning perfectly, thanks! 🤖 How can I assist you with our sports services today?"
    },
    {
        "question": "How's it going?",
        "answer": "Everything's running smoothly here! 👍 What can I do for you?"
    },
    {
        "question": "How r u?",
        "answer": "I'm great! 😄  Ready to answer your questions about Campus Sports Sphere. What do you need?"
    },
    {
        "question": "How's you?", 
        "answer": "I'm doing well, thank you! 😊 How can I assist you today?"
    },
    {
        "question": "Whats up?",
        "answer": "Not much, just here to help with your sports needs! What can I do for you?"
    },
    {
        "question": "What's up?",
        "answer": "Not much, just here to help with your sports needs! What can I do for you?"
    },
    {
            "question": "How do you generate responses?",
        "answer": "I generate responses by analyzing your question and using AI models to provide the most relevant and helpful information."
    },
     {
        "question": "Are you a human?",
        "answer": "No, I'm an AI designed to assist you with the Campus Sports Sphere app. How can I help you today?"
    },
    {
        "question": "Are you real?",
        "answer": "No, I'm an AI chatbot created to help you with sports equipment reservations and event registrations. How can I assist you today?"
    },
    {
        "question": "Are you a real person?",
        "answer": "No, I'm an AI designed to assist you with the Campus Sports Sphere app. How can I help you today?"
    },
    {
        "question": "Are you a bot?",
        "answer": "Yes, I'm a chatbot designed to help you with booking sports facilities, reserving equipment, and registering for events. How can I assist you today?"
    },
    {
        "question": "Are you a robot?",
        "answer": "Yes, I'm a chatbot designed to assist you with sports equipment reservations, event registrations, and facility bookings. How can I help you today?"
    },
    {
        "question": "Are you an AI?",
        "answer": "Yes, I'm an AI chatbot designed to help you with booking sports facilities, reserving equipment, and registering for events. How can I assist you today?"
    },
    {
        "question": "Are you human?",
        "answer": "No, I'm an AI designed to assist you with the Campus Sports Sphere app. How can I help you today?"
    },
    {
        "question": "Are you a person?",
        "answer": "No, I'm an AI chatbot created to help you with sports equipment reservations and event registrations. How can I assist you today?"
    },
    {
        "question": "Are you a machine?",
        "answer": "Yes, I'm a chatbot designed to assist you with booking sports facilities, reserving equipment, and registering for events. How can I help you today?"
    },
    {
        "question": "Are you AI?",
        "answer": "Yes, I'm an AI chatbot designed to help you with booking sports facilities, reserving equipment, and registering for events. How can I assist you today?"
    },
    {
        "question": "Are you a chatbot?",
        "answer": "Yes, I'm a chatbot designed to assist you with booking sports facilities, reserving equipment, and registering for events. How can I help you today?"
    },
    {
        "question": "Are you a computer?",
        "answer": "Yes, I'm a chatbot designed to help you with booking sports facilities, reserving equipment, and registering for events. How can I assist you today?"
    },
    {
        "question": "Are you an app?",
        "answer": "Yes, I'm a chatbot integrated into the Campus Sports Sphere app to help you with sports equipment reservations, event registrations, and facility bookings. How can I assist you today?"
    },
    {
        "question": "Are you a digital assistant?",
        "answer": "Yes, I'm a digital assistant designed to help you with booking sports facilities, reserving equipment, and registering for events. How can I assist you today?"
    },
    {
        "question": "What can you do?",
        "answer": "I can help you with booking sports facilities, checking event schedules, managing equipment reservations, and answering any questions about our sports services!"
    },
    {
        "question": "What are your capabilities?",
        "answer": "I can assist with booking sports facilities, registering for events, and managing equipment reservations. I can also provide information and answer questions related to these services."
    },
    {
        "question": "How can you assist me?",
        "answer": "I can help you with booking sports facilities, registering for events, managing equipment reservations, and answering any questions you may have."
    },
    {
        "question": "Help",
        "answer": "I'm here to help! 🚀 What can I assist you with? Feel free to ask about equipment reservations, event registrations, or any other sports-related queries."
    },
    {
        "question": "How can I get help?",
        "answer": "You're in the right place for help! 🌟 Just ask your question, and I'll do my best to assist you with our sports facilities, events, or app features."
    },
    {
        "question": "Is there customer support?",
        "answer": "Yes, I'm your virtual customer support! 🤖 For complex issues, you can also reach out to our staff through the Help and Support section in the app."
    },
    {
        "question": "Where can I find help?",
        "answer": "You can find help right here! 🏅 Ask me anything about our sports services. For more detailed assistance, check the Help and Support section in the app."
    },
    {
        "question": "I'm lost",
        "answer": "No worries, I'm here to guide you! 🧭 What are you trying to do? Book equipment, register for an event, or something else?"
    },
    {
        "question": "I'm confused",
        "answer": "I understand, and I'm here to clear things up! 🌈 What part of our sports services or app is confusing you?"
    },
    {
        "question": "What should I do?",
        "answer": "To help you best, I need a bit more information. 🤔 What are you trying to accomplish with our sports services or app?"
    },
    {
        "question": "How does this work?",
        "answer": "I'd be happy to explain! 📚 Could you specify which part of our sports services or app you're asking about?"
    },
    {
        "question": "I have a problem",
        "answer": "I'm sorry to hear that. 😟 Can you describe the problem you're experiencing? I'll do my best to help or direct you to the right resource."
    },
    {
        "question": "Something's not working",
        "answer": "I apologize for the inconvenience. 🔧 Can you tell me more about what's not working? I'll try to help or escalate the issue if needed."
    },
    {
        "question": "Is there a user guide?",
        "answer": "While we don't have a comprehensive user guide, I can answer most questions about our app and services. 📱 What specific information are you looking for?"
    },
    {
        "question": "How do I contact support?",
        "answer": "For most issues, I can help you right here! 🌟 If you need human assistance, you can reach our support team through the Help and Support section in the app."
    },
    {
        "question": "Can I speak to a person?",
        "answer": "While I'm an AI assistant, our human staff is available for complex issues. 🧑‍💼 You can reach them through the Help and Support section in the app. How can I assist you in the meantime?"
    },
      {
        "question": "Help",
        "answer": "I'm here to help! 🆘 What specific assistance do you need with our sports facilities or app?"
    },
    {
        "question": "I need assistance",
        "answer": "I'd be glad to help. 😊 What do you need assistance with regarding our sports services?"
    },
    {
        "question": "Can you assist me?",
        "answer": "Absolutely! I'd be happy to help. 🤝 What do you need help with?"
    },
    {
        "question": "How can I get help?",
        "answer": "You can get help by asking me any questions about our sports facilities or services! 📝"
    },
    {
        "question": "What if I need help?",
        "answer": "If you need help, just ask! 🤔 I'll do my best to provide the assistance you need."
    },
    {
        "question": "Who can help me?",
        "answer": "I can help you! 🙋 I'm here to assist you with any questions or issues you may have."
    },
    {
        "question": "Is there someone who can help me?",
        "answer": "Yes, I'm here to help! 🤝 What do you need help with?"
    },
    {
        "question": "Can I get support?",
        "answer": "Yes, you can get support! 🤝 What kind of support do you need?"
    },
    {
        "question": "How do I get support?",
        "answer": "You can get support by asking me any questions or by using the 'Help and Support' section of the app! 📚"
    },
    {
        "question": "What kind of help do you offer?",
        "answer": "I offer help with booking sports facilities, checking event schedules, managing equipment reservations, and answering any questions about our sports services! 📅🏟️"
    },
    {
        "question": "Can you provide assistance?",
        "answer": "Yes, I can provide assistance! 🤝 What kind of assistance do you need?"
    },
    {
        "question": "How can I contact support?",
        "answer": "You can contact support by using the 'Help and Support' section of the app or by asking me any questions! 📲"
    },
    {
        "question": "Is there a limit to how much equipment I can book?",
        "answer": "Yes, there's usually a limit of 3 items per student to ensure fair access for everyone. However, this may vary based on equipment type and availability."
    },
    {
        "question": "What is this app?",
        "answer": "This is the Campus Sports Sphere app, designed to help COMSATS University Islamabad students manage sports equipment reservations, register for events, and access sports facilities. 🏀🏟️"
    },
    {
        "question": "What is Campus Sports Sphere?",
        "answer": "Campus Sports Sphere is a digital platform for COMSATS University Islamabad students to book sports equipment, register for events, and manage their sports activities on campus. 📱🏅"
    },
    {
        "question": "Can you explain what this app does?",
        "answer": "This app allows COMSATS University Islamabad students to reserve sports equipment, sign up for sports events, check facility availability, and manage their sports-related activities on campus. 🎾🏸"
    },
    {
        "question": "What's the purpose of Campus Sports Sphere?",
        "answer": "The purpose of Campus Sports Sphere is to streamline sports management at COMSATS University Islamabad, making it easier for students to access sports facilities, equipment, and participate in events. 🏃‍♂️🏋️‍♀️"
    },
    {
        "question": "How does this app work?",
        "answer": "This app works by allowing students to create accounts, browse available sports equipment and facilities, make reservations, register for events, and manage their sports activities all in one place. 📲🎫"
    },
    {
        "question": "What features does Campus Sports Sphere offer?",
        "answer": "Campus Sports Sphere offers features like equipment reservation, event registration, facility booking, match schedules, and real-time updates on sports activities at COMSATS University Islamabad. 📅🏆"
    },
    {
        "question": "Tell me about this app",
        "answer": "This app is your gateway to sports at COMSATS University Islamabad. It helps you reserve equipment, join events, book facilities, and stay updated on all sports activities on campus. 🏟️🏓"
    },
    {
        "question": "What can I do with Campus Sports Sphere?",
        "answer": "With Campus Sports Sphere, you can reserve sports equipment, register for events, check facility availability, view match schedules, and manage all your sports activities at COMSATS University Islamabad. 🏉🏸"
    },
    {
        "question": "Is this the COMSATS sports app?",
        "answer": "Yes, this is the official sports app for COMSATS University Islamabad, called Campus Sports Sphere. It manages all sports-related activities and resources for students. 🏫🏅"
    },
    {
        "question": "What's the main function of this app?",
        "answer": "The main function of this app is to simplify sports management for COMSATS University Islamabad students, providing easy access to equipment reservations, event registrations, and facility bookings 📱🎾"
    },
    {
        "question": "How does Campus Sports Sphere help students?",
        "answer": "Campus Sports Sphere helps students by providing a convenient platform to reserve sports equipment, register for events, book facilities, and stay informed about sports activities at COMSATS University Islamabad 🏀"
    },
    {
        "question": "What's special about the Campus Sports Sphere app?",
        "answer": "The Campus Sports Sphere app is special because it's tailored specifically for COMSATS University Islamabad, offering a comprehensive solution for all sports-related needs on campus in one convenient platform 🏆"
    },
    {
        "question": "Why should I use Campus Sports Sphere?",
        "answer": "You should use Campus Sports Sphere because it simplifies all your sports-related activities at COMSATS University Islamabad, saving time and providing easy access to equipment, events, and facilities ⏱️"
    },
    {
        "question": "What is the goal of this app?",
        "answer": "The goal of this app is to enhance the sports experience for COMSATS University Islamabad students by providing a user-friendly platform for managing all sports-related activities and resources 🎯"
    },
      {
        "question": "How many players are on a basketball team?",
        "answer": "A basketball team has 5 players on the court at a time."
    },
    {
        "question": "What is the size of a cricket team?",
        "answer": "A cricket team has 11 players."
    },
    {
        "question": "How many players are there in a football match?",
        "answer": "Each football team has 11 players on the field during a match."
    },
    {
        "question": "What's the standard number of players for badminton?",
        "answer": "Badminton can be played with either 1 player per side (singles) or 2 players per side (doubles)."
    },
    {
        "question": "How many players are needed for table tennis?",
        "answer": "Table tennis can be played with either 1 player per side (singles) or 2 players per side (doubles)."
    },
    {
        "question": "What's the team size for volleyball?",
        "answer": "A volleyball team has 6 players on the court at a time."
    },
    {
        "question": "How many players are in a tennis match?",
        "answer": "Tennis can be played with either 1 player per side (singles) or 2 players per side (doubles)."
    },
    {
        "question": "What is the required number of players for a [sport name] team?",
        "answer": "I can tell you the number of players for various sports! Could you specify which sport you're interested in?" 
    },
      {
        "question": "Is this app for teachers?",
        "answer": "This app is primarily for students at COMSATS University Islamabad. Teachers may use it for managing events or viewing reservations, but its main focus is on student use."
    },
    {
        "question": "Is this app for students?",
        "answer": "Yes, this app is primarily designed for students at COMSATS University Islamabad to manage sports equipment reservations, event registrations, and facility bookings."
    },
    {
        "question": "Who is this app for?",
        "answer": "This app is for students at COMSATS University Islamabad who want to participate in sports activities, reserve equipment, and stay updated on events."
    },
    {
        "question": "Who can use this app?",
        "answer": "Any registered student at COMSATS University Islamabad can use this app to access sports facilities, reserve equipment, and register for events."
    },
    {
        "question": "Is this app only for athletes?",
        "answer": "While athletes will find this app very useful, it's also for any COMSATS University Islamabad student interested in participating in sports, even recreationally."
    },
    {
        "question": "Can faculty use this app?",
        "answer": "Faculty may use this app to view event schedules or reservation information, but the primary users are COMSATS University Islamabad students."
    },
    {
        "question": "What type of users is this app intended for?",
        "answer": "This app is intended for COMSATS University Islamabad students who are interested in sports and want to easily manage their participation in sports activities."
    },
      {
        "question": "Is this app for teachers?",
        "answer": "No, this app is primarily designed for students at COMSATS University Islamabad. However, staff members can also use it to manage reservations and events."
    },
    {
        "question": "Is this app for students?",
        "answer": "Yes, this app is mainly for students at COMSATS University Islamabad to manage sports equipment reservations, book facilities, and register for events."
    },
    {
        "question": "Who can use this app?",
        "answer": "This app is primarily for students at COMSATS University Islamabad. However, staff members also have access to manage reservations and events."
    },
    {
        "question": "Who is this app designed for?",
        "answer": "This app is designed for students at COMSATS University Islamabad to help them engage with sports activities on campus."
    },
    {
        "question": "This app is used by?",
        "answer": "This app is primarily used by students at COMSATS University Islamabad for booking sports facilities, reserving equipment, and registering for events. Staff members also use it to manage these services."
    },
    {
        "question": "Can teachers use this app?",
        "answer": "Teachers can use the app to view and manage reservations and events. They can see what equipment is available, who has reserved it, and when, but they can't reserve equipment themselves."
    },
    {
        "question": "Is this app for the general public?",
        "answer": "No, this app is specifically for COMSATS University Islamabad students and staff."
    },
    {
        "question": "Is this app for everyone?",
        "answer": "No, this app is designed for students and staff at COMSATS University Islamabad."
    },
    {
        "question": "Who uses this app, students or staff?",
        "answer": "Both students and staff at COMSATS University Islamabad can use this app. Students use it to book facilities and reserve equipment, while staff use it to manage these services."
    },
    {
        "question": "Is this app intended for both students and staff?",
        "answer": "Yes, this app is designed for both students and staff at COMSATS University Islamabad. Students can use it for booking and reservations, while staff have access to manage these services."
    },
    {
        "question": "Who is the target audience for this app?",
        "answer": "The target audience for this app is COMSATS University Islamabad students who participate in or want to participate in sports on campus."
    },
    {
        "question": "How many players are on a cricket team?",
        "answer": "A cricket team has 11 players."
    },
    {
        "question": "What is the number of players in a football team?",
        "answer": "A football team has 11 players."
    },
    {
        "question": "How many players are on a basketball team?",
        "answer": "A basketball team has 5 players."
    },
    {
        "question": "What is the number of players in a tennis match?",
        "answer": "A tennis match is played between 2 players (singles) or 4 players (doubles)."
    },
    {
        "question": "What's the difference between singles and doubles in [sport name]?",
        "answer": "In [sport name], singles means one player per side, while doubles means two players per side."
    },
    {
        "question": "How does Campus Sports Sphere benefit students?",
        "answer": "Campus Sports Sphere benefits students by streamlining sports management, providing easy access to resources, facilitating event participation, and keeping everyone informed about sports activities on campus."
    },
    {
        "question": "Can I reserve multiple pieces of equipment simultaneously?",
        "answer": "You can reserve multiple pieces of equipment, typically up to 3 items, simultaneously. This limit helps ensure equitable access for all students."
    },
    {
        "question": "What happens after my field booking request is accepted?",
        "answer": "If your field booking request is accepted, you'll receive a notification, and the time slot will be reserved for you. It will no longer be visible to other students for booking."
    }
]


questions = [qa['question'] for qa in qa_pairs]
question_embeddings = model.encode(questions, convert_to_tensor=True)

def get_best_answer(user_question, threshold=0.5):

    user_embedding = model.encode(user_question, convert_to_tensor=True)
    
    cosine_scores = util.pytorch_cos_sim(user_embedding, question_embeddings)
    
    best_match_index = torch.argmax(cosine_scores)
    
    if cosine_scores[0][best_match_index] > threshold:
        return qa_pairs[best_match_index]['answer']
    else:
       return "I'm sorry, but your question doesn't seem to be related to Campus Sports Sphere.\nCould you please ask about:\n• App features 📱\n• Sports Equipments 🏏\n• Reservations 📅\n• Events 🏆\n• Or other related question?\nI'm here to help with anything about campus sports!"

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question', '')
    answer = get_best_answer(question)
    return jsonify({'answer': answer})

# Web scraping API route
@app.route('/scrape', methods=['GET'])
def scrape():
    logger.debug("Scrape route accessed")
    try:
        url = 'https://www.hec.gov.pk/english/services/students/Sports/Pages/THYSL.aspx'
        logger.debug(f"Attempting to fetch URL: {url}")
        with httpx.Client(verify=False) as client:
            response = client.get(url)
            response.raise_for_status()
        
        logger.debug(f"Response status code: {response.status_code}")
        logger.debug(f"Response content length: {len(response.text)}")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract the main content
        main_content = soup.find('div', class_='ms-rtestate-field')  # Adjust this selector if needed
        
        if main_content:
            # Extract title
            title = main_content.find('h1').text.strip() if main_content.find('h1') else 'HEC-Intervarsity Sports'
            
            # Extract paragraphs
            paragraphs = [p.text.strip() for p in main_content.find_all('p') if p.text.strip()]
            
            # Extract sports table
            sports_table = []
            table = main_content.find('table')
            if table:
                for row in table.find_all('tr')[1:]:  # Skip header row
                    cols = row.find_all('td')
                    if len(cols) >= 4:
                        sports_table.append({
                            'Sr': cols[0].text.strip(),
                            'Sports': cols[1].text.strip(),
                            'Men': cols[2].text.strip(),
                            'Women': cols[3].text.strip()
                        })
            
            # Extract contact details
            contact_details = []
            contact_section = main_content.find('strong', text='Contact Details:')
            if contact_section:
                for sibling in contact_section.find_next_siblings():
                    if sibling.name == 'strong' and 'Contact Details:' not in sibling.text:
                        name = sibling.text.strip()
                        details = sibling.find_next_sibling(text=True)
                        if details:
                            contact_details.append(f"{name}: {details.strip()}")
            
            data = {
                'title': title,
                'description': paragraphs,
                'sports_table': sports_table,
                'contact_details': contact_details
            }
            
            logger.debug(f"Scraping successful. Extracted data: {data}")
            return jsonify(data)
        else:
            logger.debug("No main content found")
            return jsonify({'error': 'No content found'}), 404
        
    except httpx.RequestError as e:
        logger.error(f"Request failed: {str(e)}")
        return jsonify({'error': 'Failed to fetch the website'}), 500
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}")
        return jsonify({'error': 'Failed to scrape data'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)