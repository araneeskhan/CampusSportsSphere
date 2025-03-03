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
                for row in table.find_all('tr')[1:]:  
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
    app.run(debug=True, host='0.0.0.0', port=5000)