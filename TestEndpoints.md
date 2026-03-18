1. Test generation

POST
/test/generate
Generate Test Endpoint

Generate a randomised test.

Picks one question per position (1-12) matching type and language.
Saves the test to the database.
Returns: test_id, per-question slot with correct answer id and 3 random incorrect answer ids.
Parameters
Cancel
No parameters

Request body

application/json
Edit Value
Schema
{
  "language": "ro",
  "type": "math"
}
Execute
Responses
Code	Description	Links
201	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "test_id": 0,
  "type": "string",
  "language": "string",
  "questions": [
    {
      "position": 0,
      "question_id": 0,
      "correct_answer_id": 0,
      "incorrect_answer_ids": [
        0
      ]
    }
  ]
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

2. Get all available tests

GET
/test
Get Tests

Get all available tests based on type and language.

type: Filter tests by type (e.g., "math", "physics").
language: Optional filter by language (e.g., "ro").
Returns a list of tests matching the criteria.

Parameters
Try it out
Name	Description
type *
string
(query)
type
language
string | (string | null)
(query)
language
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
  {
    "test_id": 0,
    "type": "string",
    "language": "string",
    "questions": [
      {
        "position": 0,
        "question_id": 0,
        "correct_answer_id": 0,
        "incorrect_answer_ids": [
          0
        ]
      }
    ]
  }
]
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


3. GET
/test/{test_id}
Get Test By Id

Retrieve a previously generated test by its ID.

Checks Redis first (24-hour cache). Falls back to the database.

Parameters
Cancel
Name	Description
test_id *
integer
(path)
1
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:8070/test/1' \
  -H 'accept: application/json'
Request URL
http://localhost:8070/test/1
Server response
Code	Details
200	
Response body
Download
{
  "test_id": 1,
  "type": "math",
  "language": "ro",
  "questions": [
    {
      "position": 1,
      "question_id": 1,
      "correct_answer_id": 1,
      "incorrect_answer_ids": [
        2,
        12,
        9
      ]
    },
    {
      "position": 2,
      "question_id": 2,
      "correct_answer_id": 2,
      "incorrect_answer_ids": [
        7,
        8,
        10
      ]
    },
    {
      "position": 3,
      "question_id": 3,
      "correct_answer_id": 3,
      "incorrect_answer_ids": [
        9,
        1,
        8
      ]
    },
    {
      "position": 4,
      "question_id": 4,
      "correct_answer_id": 4,
      "incorrect_answer_ids": [
        12,
        1,
        7
      ]
    },
    {
      "position": 5,
      "question_id": 5,
      "correct_answer_id": 5,
      "incorrect_answer_ids": [
        7,
        11,
        8
      ]
    },
    {
      "position": 6,
      "question_id": 6,
      "correct_answer_id": 6,
      "incorrect_answer_ids": [
        8,
        5,
        9
      ]
    },
    {
      "position": 7,
      "question_id": 7,
      "correct_answer_id": 7,
      "incorrect_answer_ids": [
        11,
        5,
        10
      ]
    },
    {
      "position": 8,
      "question_id": 8,
      "correct_answer_id": 8,
      "incorrect_answer_ids": [
        5,
        9,
        4
      ]
    },
    {
      "position": 9,
      "question_id": 9,
      "correct_answer_id": 9,
      "incorrect_answer_ids": [
        4,
        5,
        11
      ]
    },
    {
      "position": 10,
      "question_id": 10,
      "correct_answer_id": 10,
      "incorrect_answer_ids": [
        3,
        12,
        9
      ]
    },
    {
      "position": 11,
      "question_id": 11,
      "correct_answer_id": 11,
      "incorrect_answer_ids": [
        7,
        10,
        12
      ]
    },
    {
      "position": 12,
      "question_id": 12,
      "correct_answer_id": 12,
      "incorrect_answer_ids": [
        11,
        9,
        8
      ]
    }
  ]
}
Response headers
 content-length: 1085 
 content-type: application/json 
 date: Wed,18 Mar 2026 10:05:03 GMT 
 server: uvicorn 
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "test_id": 0,
  "type": "string",
  "language": "string",
  "questions": [
    {
      "position": 0,
      "question_id": 0,
      "correct_answer_id": 0,
      "incorrect_answer_ids": [
        0
      ]
    }
  ]
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

4. Get question image

GET
/question/{question_id}/image
Get Question Image

Get the actual image file for a specific question.

Parameters: question_id: The ID of the question.

Returns: The image file (PNG format).

Parameters
Try it out
Name	Description
question_id *
integer
(path)
question_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


5. Register test session

/api/testSession/testSession​Copy link
Body
required
Selected Content Type:
application/json
testComponentsCopy link to testComponents
Type:array TestComponent[]
Show Child Attributesfor testComponents
testIdCopy link to testId
Type:integer | string
Pattern:^-?(?:0|[1-9]\d*)$
Format:int32
Signed 32-bit integers (commonly used integer type).

Responses
200Copy link to 200
OK

Request Example forpost/api/testSession/testSession
Shell Curl

curl http://localhost:8080/api/testSession/testSession \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "testId": 1,
  "testComponents": [
    {
      "id": 1,
      "answer_id": 1,
      "question_id": 1
    }
  ]
}'

6. Verify test

/api/testSession/verifyTest/{sessionId}​Copy link
Path Parameters
sessionIdCopy link to sessionId
Type:string
required
Body
required
Selected Content Type:
application/json
testComponentsCopy link to testComponents
Type:array TestComponent[]
Show Child Attributesfor testComponents
testIdCopy link to testId
Type:integer | string
Pattern:^-?(?:0|[1-9]\d*)$
Format:int32
Signed 32-bit integers (commonly used integer type).

Responses
200Copy link to 200
OK

Request Example forpost/api/testSession/verifyTest/{sessionId}
Shell Curl

curl 'http://localhost:8080/api/testSession/verifyTest/{sessionId}' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
  "testId": 1,
  "testComponents": [
    {
      "id": 1,
      "answer_id": 1,
      "question_id": 1
    }
  ]
}'

Response:
{
  "resultId": 3,
  "sessionId": 1,
  "totalQuestions": 12,
  "correctAnswers": 1,
  "skipped": 11,
  "scorePercentage": 8.33,
  "detailedResults": [
    {
      "id": 25,
      "position": 1,
      "questionId": 1,
      "submittedAnswerId": 1,
      "correctAnswerId": 1,
      "isCorrect": true
    },
    {
      "id": 26,
      "position": 2,
      "questionId": 2,
      "submittedAnswerId": null,
      "correctAnswerId": 2,
      "isCorrect": false
    },
    {
      "id": 27,
      "position": 3,
      "questionId": 3,
      "submittedAnswerId": null,
      "correctAnswerId": 3,
      "isCorrect": false
    },
    {
      "id": 28,
      "position": 4,
      "questionId": 4,
      "submittedAnswerId": null,
      "correctAnswerId": 4,
      "isCorrect": false
    },
    {
      "id": 29,
      "position": 5,
      "questionId": 5,
      "submittedAnswerId": null,
      "correctAnswerId": 5,
      "isCorrect": false
    },
    {
      "id": 30,
      "position": 6,
      "questionId": 6,
      "submittedAnswerId": null,
      "correctAnswerId": 6,
      "isCorrect": false
    },
    {
      "id": 31,
      "position": 7,
      "questionId": 7,
      "submittedAnswerId": null,
      "correctAnswerId": 7,
      "isCorrect": false
    },
    {
      "id": 32,
      "position": 8,
      "questionId": 8,
      "submittedAnswerId": null,
      "correctAnswerId": 8,
      "isCorrect": false
    },
    {
      "id": 33,
      "position": 9,
      "questionId": 9,
      "submittedAnswerId": null,
      "correctAnswerId": 9,
      "isCorrect": false
    },
    {
      "id": 34,
      "position": 10,
      "questionId": 10,
      "submittedAnswerId": null,
      "correctAnswerId": 10,
      "isCorrect": false
    },
    {
      "id": 35,
      "position": 11,
      "questionId": 11,
      "submittedAnswerId": null,
      "correctAnswerId": 11,
      "isCorrect": false
    },
    {
      "id": 36,
      "position": 12,
      "questionId": 12,
      "submittedAnswerId": null,
      "correctAnswerId": 12,
      "isCorrect": false
    }
  ],
  "verifiedAt": "2026-03-18T10:08:01.2322925Z"
}


7. Answer image generation

GET
/answer/{answer_id}/answer_image
Get Answer Image

Get the image associated with a specific answer by its ID.

Parameters: answer_id: The ID of the answer to retrieve the image for.

Returns: A FileResponse with the image, or a 404 error if not found.

Parameters
Try it out
Name	Description
answer_id *
integer
(path)
answer_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

