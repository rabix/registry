define({ "api": [
  {
    "name": "Login",
    "type": "GET",
    "url": "/api/login",
    "title": "Github Login",
    "group": "Auth",
    "version": "0.0.0",
    "filename": "app/controllers/auth.js",
    "groupTitle": "Auth"
  },
  {
    "name": "Logout",
    "type": "GET",
    "url": "/api/logout",
    "title": "Logout",
    "group": "Auth",
    "version": "0.0.0",
    "filename": "app/controllers/auth.js",
    "groupTitle": "Auth"
  },
  {
    "name": "GetRepo",
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
            "field": "Repo",
            "description": "<p>Object</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"repo\": {\n          \"_id\" : \"547854cbf76a100000ac84dd\",\n          \"is_public\" : true,\n          \"created_by\" : \"flipio\",\n          \"name\" : \"test\",\n          \"owner\" : \"flipio\",\n          \"git\" : false,\n          \"description\" : \"\",\n          \"user\" : \"547854bcf76a100000ac84dc\"\n      }\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetRepo",
    "type": "GET",
    "url": "/api/repos/:id",
    "title": "Get repository by id",
    "group": "Repos",
    "description": "<p>Get repository by id</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of user repositories</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of user repositories</p> "
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
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of repositories</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of repositories</p> "
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
    "name": "GetReposTools",
    "type": "POST",
    "url": "/api/repo-tools/:id",
    "title": "Get tools from repository",
    "group": "Repos",
    "description": "<p>Get tools from repository</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Repo unique id</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of tools in repository</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of tools in repository</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"total\": \"1\",\n      \"list\": [{tool}]\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetReposWorkflows",
    "type": "POST",
    "url": "/api/repo-workflows/:id",
    "title": "Get workflows from repository",
    "group": "Repos",
    "description": "<p>Get workflows from repository</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Repo unique id</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of workflows in repository</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of workflows in repository</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"total\": \"1\",\n      \"list\": [{workflow}]\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetWorkflows",
    "type": "GET",
    "url": "/api/pipelines",
    "title": "Get all Workflows",
    "group": "Repos",
    "description": "<p>Fetch all Workflows</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of workflows</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of workflows</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"total\": \"1\",\n      \"list\": [{workflow}]\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
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
          "content": "    HTTP/1.1 200 OK\n    {\n      \"repo\": {\n          \"_id\" : \"547854cbf76a100000ac84dd\",\n          \"is_public\" : true,\n          \"created_by\" : \"flipio\",\n          \"name\" : \"test\",\n          \"owner\" : \"flipio\",\n          \"git\" : false,\n          \"description\" : \"\",\n          \"user\" : \"547854bcf76a100000ac84dc\"\n      }\n    }",
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
            "field": "message",
            "description": "<p>The <code>name</code> already in use.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "    HTTP/1.1 400 Bad Request\n    {\n      \"message\": \"Name already in use\"\n    }",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "PutRepo",
    "type": "PUT",
    "url": "/api/repos/:id/:action",
    "title": "Update repository",
    "group": "Repos",
    "description": "<p>Update repository info or publish it</p> ",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
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
            "field": "Message",
            "description": "<p>Unauthorized update</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "    HTTP/1.1 401\n    {\n      \"message\": \"Unauthorized\"\n    }",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "FormatUploadWorkflow",
    "type": "GET",
    "url": "/api/pipeline/format/upload",
    "title": "Format workflow and upload it",
    "group": "Workflows",
    "description": "<p>Format workflow and upload it</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>Url to formated workflow on amazon s3</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"url\" : \"https://s3.amazonaws.com/rabix/users/ntijanic/pipelines/bwa/bwa_417435973012.json\"\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
    "groupTitle": "Workflows"
  },
  {
    "name": "FormatWorkflow",
    "type": "GET",
    "url": "/api/pipeline/format",
    "title": "Format workflow",
    "group": "Workflows",
    "description": "<p>Format workflow</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "json",
            "description": "<p>Formated workflow</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"json\": {Workflow}\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
    "groupTitle": "Workflows"
  },
  {
    "name": "GetWorkflow",
    "type": "GET",
    "url": "/api/repos/:id",
    "title": "Get workflow by id",
    "group": "Workflows",
    "description": "<p>Get workflow by id</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Obejct",
            "optional": false,
            "field": "data",
            "description": "<p>Workflow</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"total\": \"1\",\n      \"data\": {workflow}\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
    "groupTitle": "Workflows"
  },
  {
    "name": "RepoWorkflow",
    "type": "POST",
    "url": "/api/pipeline",
    "title": "Create user workflow",
    "group": "Workflows",
    "description": "<p>Create user workflow</p> ",
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
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Represents new workflow revision id</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n       \"message\": \"Workflow successfully added\",\n       \"id\": \"547854cbf76a100000ac84dd\"\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
    "groupTitle": "Workflows",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "message",
            "description": "<p>The <code>name</code> already in use.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "    HTTP/1.1 400 Bad Request\n    {\n      \"message\": \"Name already in use\"\n    }",
          "type": "json"
        }
      ]
    }
  }
] });