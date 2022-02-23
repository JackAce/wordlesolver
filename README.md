# WORDLE SOLVER - node.js

## Request Format

    // Format of JSON request

    {
        guesses: [
            {
                word: 'RAISE',
                matches: [
                    0,
                    2,
                    0,
                    0,
                    0
                ]
            },
            {
                word: 'TANGO',
                matches: [
                    0,
                    2,
                    0,
                    0,
                    0
                ]
            }
        ]
    }

## Response Format

    {
        "filteredWordsAllowedCount": 31,
        "filteredWordsOfficialCount": 13,
        "suggestionsAllowed": [{
            "word": "quist",
            "score": 289
        }, {
            "word": "quits",
            "score": 289
        }, {
            "word": "quins",
            "score": 287
        }, {
            "word": "suint",
            "score": 287
        }, {
            "word": "units",
            "score": 287
        }, {
            "word": "muist",
            "score": 286
        }, {
            "word": "quims",
            "score": 286
        }, {
            "word": "tuism",
            "score": 286
        }, {
            "word": "quino",
            "score": 284
        }, {
            "word": "cuits",
            "score": 283
        }],
        "suggestionsOfficial": [{
            "word": "unity",
            "score": 119
        }, {
            "word": "quilt",
            "score": 116
        }, {
            "word": "unify",
            "score": 116
        }, {
            "word": "guilt",
            "score": 115
        }, {
            "word": "opium",
            "score": 114
        }, {
            "word": "using",
            "score": 114
        }, {
            "word": "suing",
            "score": 114
        }, {
            "word": "juicy",
            "score": 113
        }, {
            "word": "built",
            "score": 113
        }, {
            "word": "quick",
            "score": 112
        }]
    }

## Sample curl

### localhost:3000

    curl 'http://localhost:3000/wordle' -X POST -H 'Accept: application/json' -H 'Content-Type: application/json; charset=UTF-8' --data-raw '{"guesses":[{"word":"raise","matches":[0,0,0,2,2]}, {"word":"house","matches":[0,0,0,2,2]}, {"word":"sense","matches":[1,2,0,2,2]}]}'

### heroku

    curl 'https://jackace-wordle-solver.herokuapp.com/wordle' -X POST -H 'Accept: application/json' -H 'Content-Type: application/json; charset=UTF-8' --data-raw '{"guesses":[{"word":"raise","matches":[0,0,0,2,2]}, {"word":"house","matches":[0,0,0,2,2]}, {"word":"sense","matches":[1,2,0,2,2]}]}'
