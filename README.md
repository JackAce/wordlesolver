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
