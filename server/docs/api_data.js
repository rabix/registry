define({ "api": [
  {
    "name": "Login",
    "type": "GET",
    "url": "/api/login",
    "title": "",
    "group": "Auth",
    "version": "0.0.0",
    "filename": "app/controllers/auth.js",
    "groupTitle": "Auth"
  },
  {
    "name": "Logout",
    "type": "GET",
    "url": "/api/logout",
    "title": "",
    "group": "Auth",
    "version": "0.0.0",
    "filename": "app/controllers/auth.js",
    "groupTitle": "Auth"
  },
  {
    "name": "GetRepo",
    "type": "GET",
    "url": "/api/repos/user",
    "title": "Get all Current Logged in User Repositories",
    "group": "Repos",
    "description": "<p>Fetch all user repositories</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "repos",
            "description": "<p>All repositories</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"total\": \"1\",\n      \"list\": [{repo}]\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetRepos",
    "type": "GET",
    "url": "/api/repos",
    "title": "Get all Repositories",
    "group": "Repos",
    "description": "<p>Fetch all repositories</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "repos",
            "description": "<p>All repositories</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"total\": \"1\",\n      \"list\": [{repo}]\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos"
  },
  {
    "name": "PostRepo",
    "type": "POST",
    "url": "/api/repos",
    "title": "Create user repository",
    "group": "Repos",
    "description": "<p>Create user repository</p> ",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "repo",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"repo\": {\n          \"_id\" : \"547854cbf76a100000ac84dd\",\n          \"is_public\" : true,\n          \"created_by\" : \"flipio\",\n          \"name\" : \"test\",\n          \"owner\" : \"flipio\",\n          \"git\" : false,\n          \"description\" : \"\",\n          \"user\" : \"547854bcf76a100000ac84dc\"\n      },\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NameCollisionError",
            "description": "<p>The <code>name</code> already in use.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "    HTTP/1.1 400 Not Found\n    {\n      \"message\": \"Repo name already in use\"\n    }",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "PutRepo",
    "type": "POST",
    "url": "/api/repos/:id/:action",
    "title": "Update repository",
    "group": "Repos",
    "description": "<p>Update repository info or publish it</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Repo unique id</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Action to perform on repo (update, publish)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "repo",
            "description": "<p>Repository object</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"repo\": {\n          \"_id\" : \"547854cbf76a100000ac84dd\",\n          \"is_public\" : true,\n          \"created_by\" : \"flipio\",\n          \"name\" : \"test\",\n          \"owner\" : \"flipio\",\n          \"git\" : false,\n          \"description\" : \"\",\n          \"user\" : \"547854bcf76a100000ac84dc\"\n      },\n      \"message\": \"Successfully updated repo\"\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Error",
            "description": "<p>: Unauthorized update</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error:",
          "content": "    HTTP/1.1 401 OK\n    {\n      \"message\": \"Unauthorized\"\n    }",
          "type": "json"
        }
      ]
    }
  }
] });