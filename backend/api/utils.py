import requests

def analyze_toxicity(text):
    # Replace 'YOUR_API_KEY' with your actual Perspective API key
    api_key = 'AIzaSyAAlB6CmUrA7JkcDiiyN6vamy2CnbPg4WQ'
    api_url = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze'

    params = {'key': api_key}

    data = {
        'comment': {'text': text},
        'languages': ['en'],
        'requestedAttributes': {'TOXICITY': {}},
    }

    response = requests.post(api_url, params=params, json=data)

    if response.status_code == 200:
        result = response.json()
        toxicity_score = result['attributeScores']['TOXICITY']['summaryScore']['value']
        return toxicity_score
    else:
        # Return a high toxicity score if there's an error with the API request
        return 1.0