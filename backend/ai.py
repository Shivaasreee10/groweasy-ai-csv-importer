import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")


def process_batch(batch):
    """
    Process a single batch of records using Gemini.
    """

    prompt = f"""
You are an expert CRM Data Extraction AI.

Your job is to intelligently map CSV records into the GrowEasy CRM format.

The uploaded CSV can have ANY column names.

Examples:

Customer Name
Full Name
Lead Name
Person Name

→ all should map to "name"

Likewise,

Phone
Mobile
Phone Number
Contact
Mobile Number

→ map to mobile_without_country_code

Email
Mail
Email Address

→ map to email

Company
Organisation
Business Name

→ map to company

Return ONLY valid JSON.

Format:

{{
  "records":[
    {{
      "created_at":"",
      "name":"",
      "email":"",
      "country_code":"",
      "mobile_without_country_code":"",
      "company":"",
      "city":"",
      "state":"",
      "country":"",
      "lead_owner":"",
      "crm_status":"",
      "crm_note":"",
      "data_source":"",
      "possession_time":"",
      "description":""
    }}
  ],
  "skipped":0
}}

Rules:

1. Skip records having neither email nor phone.

2. CRM Status Rules

- If the record has email or phone
  → GOOD_LEAD_FOLLOW_UP

- If customer rejected
  → BAD_LEAD

- If customer unreachable
  → DID_NOT_CONNECT

- If sale completed
  → SALE_DONE

Never leave crm_status empty.

Allowed values only:

GOOD_LEAD_FOLLOW_UP
DID_NOT_CONNECT
BAD_LEAD
SALE_DONE

3. If data_source isn't obvious leave blank.

4. Multiple emails:
Use first email.
Put remaining emails in crm_note.

5. Multiple phones:
Use first phone.
Put remaining phones in crm_note.

6. Never invent data.

7. Return ONLY valid JSON.

CSV Records:

{batch}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)


def extract_crm_records(records):
    """
    Process CSV records in batches.
    """

    batch_size = 20

    all_records = []
    total_skipped = 0

    for i in range(0, len(records), batch_size):

        batch = records[i:i + batch_size]

        result = process_batch(batch)

        all_records.extend(result.get("records", []))
        total_skipped += result.get("skipped", 0)

    return {
        "records": all_records,
        "skipped": total_skipped
    }