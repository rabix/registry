define({ "api": [
  {
    "name": "Login",
    "type": "GET",
    "url": "/auth/login",
    "title": "Github Login",
    "group": "Auth",
    "version": "0.0.0",
    "filename": "app/controllers/auth.js",
    "groupTitle": "Auth"
  },
  {
    "name": "Logout",
    "type": "GET",
    "url": "/auth/logout",
    "title": "Logout",
    "group": "Auth",
    "version": "0.0.0",
    "filename": "app/controllers/auth.js",
    "groupTitle": "Auth"
  },
  {
    "name": "CreateJob",
    "type": "POST",
    "url": "/api/jobs",
    "title": "Create new job",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "job",
            "description": "<p>Job json</p> "
          }
        ]
      }
    },
    "group": "Jobs",
    "description": "<p>Create new job</p> ",
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
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": \"Job has been successfully created\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/jobs.js",
    "groupTitle": "Jobs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          },
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
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Name already in use\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "DeleteJob",
    "type": "DELETE",
    "url": "/api/jobs/:id",
    "title": "Delete job by id",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the job</p> "
          }
        ]
      }
    },
    "group": "Jobs",
    "description": "<p>Delete job by id</p> ",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "message",
            "description": "<p>Forbidden job delete from the public repo</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "PublicRepoError:",
          "content": "HTTP/1.1 403 Bad Request\n{\n  \"message\": \"This job belongs to public repo and it can't be deleted.\"\n}",
          "type": "json"
        },
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Job successfully deleted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/jobs.js",
    "groupTitle": "Jobs"
  },
  {
    "name": "GetJob",
    "type": "GET",
    "url": "/api/jobs/:id",
    "title": "Get job by id",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the job</p> "
          }
        ]
      }
    },
    "group": "Jobs",
    "description": "<p>Get job by id</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Job details</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"data\": {job}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/jobs.js",
    "groupTitle": "Jobs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "UpdateJob",
    "type": "PUT",
    "url": "/api/jobs/:id",
    "title": "Update job by id",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the job</p> "
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "job",
            "description": "<p>Job json</p> "
          }
        ]
      }
    },
    "group": "Jobs",
    "description": "<p>Update existing job by id</p> ",
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
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": \"Job has been successfully updated\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/jobs.js",
    "groupTitle": "Jobs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          },
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
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Name already in use\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetJobs",
    "type": "GET",
    "url": "/api/jobs",
    "title": "Get all Jobs",
    "group": "Repos",
    "description": "<p>Fetch all jobs</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Jobs limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "q",
            "description": "<p>Search term</p> "
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "mine",
            "defaultValue": "false",
            "description": "<p>Defines if only logged-in user&#39;s jobs should be displayed</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "ref",
            "description": "<p>ID of the referenced object (tool, script or workflow); If defined the &quot;type&quot; param needs to be provided</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"CommandLine\"",
              "\"Script\"",
              "\"Workflow\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Type of the referenced object</p> "
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
            "description": "<p>Total number of jobs</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of jobs</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{job}]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/jobs.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetRepo",
    "type": "GET",
    "url": "/api/repos/:id",
    "title": "Get repo by id",
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
          "content": "HTTP/1.1 200 OK\n{\n  \"repo\": {\n      \"_id\" : \"547854cbf76a100000ac84dd\",\n      \"is_public\" : true,\n      \"created_by\" : \"flipio\",\n      \"name\" : \"test\",\n      \"owner\" : \"flipio\",\n      \"git\" : false,\n      \"description\" : \"\",\n      \"user\" : \"547854bcf76a100000ac84dc\"\n  }\n}",
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
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the repo</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Repos limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
          }
        ]
      }
    },
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
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{repo}]\n}",
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
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Repos limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "q",
            "description": "<p>Search term</p> "
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "mine",
            "defaultValue": "false",
            "description": "<p>Defines if only logged-in user&#39;s repos should be displayed</p> "
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
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{repo}]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetReposTasks",
    "type": "GET",
    "url": "/api/repo-tasks/:id",
    "title": "Get tasks from repository",
    "group": "Repos",
    "description": "<p>Get tasks from repository</p> ",
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
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Repos limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
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
            "description": "<p>Total number of tasks in repository</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of tasks in repository</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{task}]\n}",
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
    "type": "GET",
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
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Tools limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "is_script",
            "defaultValue": "false",
            "description": "<p>Defines if script tools should be displayed</p> "
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
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{tool}]\n}",
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
    "type": "GET",
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
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Repos limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
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
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{workflow}]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/repos.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetTools",
    "type": "GET",
    "url": "/api/apps",
    "title": "Get all Tools",
    "group": "Repos",
    "description": "<p>Fetch all Tools</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Tools limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "q",
            "description": "<p>Search term</p> "
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "mine",
            "defaultValue": "false",
            "description": "<p>Defines if only logged-in user&#39;s tools should be displayed</p> "
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "is_script",
            "defaultValue": "false",
            "description": "<p>Defines if script tools should be displayed</p> "
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
            "description": "<p>Total number of tools</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of tools</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{tool}]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/apps.js",
    "groupTitle": "Repos"
  },
  {
    "name": "GetWorkflowRevisions",
    "type": "GET",
    "url": "/api/workflow-revisions",
    "title": "Get all Workflows Revisions",
    "group": "Repos",
    "description": "<p>Fetch all workflow revisions</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Revisions limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
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
            "description": "<p>Total number of workflow revisions</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of workflow revisions</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{workflow}]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
    "groupTitle": "Repos",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetWorkflows",
    "type": "GET",
    "url": "/api/workflows",
    "title": "Get all Workflows",
    "group": "Repos",
    "description": "<p>Fetch all Workflows</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Workflows limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "q",
            "description": "<p>Search term</p> "
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "mine",
            "defaultValue": "false",
            "description": "<p>Defines if only logged-in user&#39;s workflows should be displayed</p> "
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
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{workflow}]\n}",
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
          "content": "HTTP/1.1 200 OK\n{\n  \"repo\": {\n      \"_id\" : \"547854cbf76a100000ac84dd\",\n      \"is_public\" : true,\n      \"created_by\" : \"flipio\",\n      \"name\" : \"test\",\n      \"owner\" : \"flipio\",\n      \"git\" : false,\n      \"description\" : \"\",\n      \"user\" : \"547854bcf76a100000ac84dc\"\n  }\n}",
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
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Name already in use\"\n}",
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
            "allowedValues": [
              "\"update\"",
              "\"publish\""
            ],
            "optional": false,
            "field": "action",
            "description": "<p>Action to perform on repo</p> "
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
          "content": "HTTP/1.1 200 OK\n{\n  \"repo\": {\n      \"_id\" : \"547854cbf76a100000ac84dd\",\n      \"is_public\" : true,\n      \"created_by\" : \"flipio\",\n      \"name\" : \"test\",\n      \"owner\" : \"flipio\",\n      \"git\" : false,\n      \"description\" : \"\",\n      \"user\" : \"547854bcf76a100000ac84dc\"\n  },\n  \"message\": \"Successfully updated repo\"\n}",
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
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "CreateTool",
    "type": "POST",
    "url": "/api/apps/:action",
    "title": "Create new tool",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"create\"",
              "\"fork\""
            ],
            "optional": false,
            "field": "action",
            "description": "<p>Type of the action</p> "
          }
        ]
      }
    },
    "group": "Tools",
    "description": "<p>Create new tool from clean template or by forking it</p> ",
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
            "type": "Object",
            "optional": false,
            "field": "app",
            "description": "<p>Tool details</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": \"Tool has been successfully created\"\n  \"app\": {tool}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/apps.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          },
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
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Name already in use\"\n}",
          "type": "json"
        },
        {
          "title": "InvalidToolError:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Invalid tool\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "CreateToolRevision",
    "type": "POST",
    "url": "/api/revisions",
    "title": "Create new tool revision",
    "group": "Tools",
    "description": "<p>Create new tool revision</p> ",
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
            "type": "Object",
            "optional": false,
            "field": "revision",
            "description": "<p>Tool revision details</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": \"Revision has been successfully created\"\n  \"revision\": {revision}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/revisions.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "message",
            "description": "<p>Invalid tool</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        },
        {
          "title": "InvalidToolError:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Invalid tool\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "DeleteTool",
    "type": "DELETE",
    "url": "/api/revisions/:id",
    "title": "Delete revision by id",
    "group": "Tools",
    "description": "<p>Delete tool revision</p> ",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "message",
            "description": "<p>Forbidden revision delete from public repo</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "PublicRepoError:",
          "content": "HTTP/1.1 403 Bad Request\n{\n  \"message\": \"This revision belongs to public repo and it can't be delete it\"\n}",
          "type": "json"
        },
        {
          "title": "LastRevisionError:",
          "content": "HTTP/1.1 403 Bad Request\n{\n  \"message\": \"This is the only revision of the tool so it can't be deleted\"\n}",
          "type": "json"
        },
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Revision successfully deleted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/revisions.js",
    "groupTitle": "Tools"
  },
  {
    "name": "DeleteTool",
    "type": "DELETE",
    "url": "/api/apps/:id",
    "title": "Delete tool",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the tool</p> "
          }
        ]
      }
    },
    "group": "Tools",
    "description": "<p>Delete tool</p> ",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "message",
            "description": "<p>Forbidden tool delete from the public repo</p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "PublicRepoError:",
          "content": "HTTP/1.1 403 Bad Request\n{\n  \"message\": \"This app belongs to public repo and it can't be deleted.\"\n}",
          "type": "json"
        },
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Tool successfully deleted\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/apps.js",
    "groupTitle": "Tools"
  },
  {
    "name": "GetPublicTool",
    "type": "GET",
    "url": "/tool/:id",
    "title": "Get public tool by id",
    "group": "Tools",
    "description": "<p>Get public tool by id</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Id of the tool</p> "
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
            "field": "json",
            "description": "<p>Json of the tool</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{json}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/public.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Invalid id</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidAppError:",
          "content": "HTTP/1.1 404\n{\n  \"message\": \"There is no app with such id\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetPublicToolRevision",
    "type": "GET",
    "url": "/tool-revision/:id",
    "title": "Get public tool revision by id",
    "group": "Tools",
    "description": "<p>Get public tool revision by id</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Id of the tool revision</p> "
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
            "field": "json",
            "description": "<p>Json of the tool revision</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{json}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/public.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Invalid id</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidAppError:",
          "content": "HTTP/1.1 404\n{\n  \"message\": \"There is no app with such id\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetTool",
    "type": "GET",
    "url": "/api/apps/:id/:revision",
    "title": "Get tool by revision",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the tool</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "revision",
            "description": "<p>ID of the revision</p> "
          }
        ]
      }
    },
    "group": "Tools",
    "description": "<p>Get tool by revision</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Tool details</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "revision",
            "description": "<p>Tool revision details</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"data\": {tool}\n  \"revision\": {tool-revision}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/apps.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetToolRevision",
    "type": "GET",
    "url": "/api/revisions/:id",
    "title": "Get revision by id",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the revision</p> "
          }
        ]
      }
    },
    "group": "Tools",
    "description": "<p>Get tool revision</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Revision details</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "app",
            "description": "<p>Parent tool details</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"data\": {revision}\n  \"app\": {tool}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/revisions.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetToolRevisions",
    "type": "GET",
    "url": "/api/revisions",
    "title": "Get tool revisions",
    "group": "Tools",
    "description": "<p>Fetch all tool revisions</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "limit",
            "defaultValue": "25",
            "description": "<p>Revisions limit per page</p> "
          },
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Page offset</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "field_app_id",
            "description": "<p>ID of the app to which revisions belong to</p> "
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
            "description": "<p>Total number of revisions</p> "
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "list",
            "description": "<p>List of revisions</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"total\": \"1\",\n  \"list\": [{revision}]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/revisions.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetToolsGroupedByRepo",
    "type": "GET",
    "url": "/api/tool/repositories/:type",
    "title": "Get grouped tools and scripts",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"my\"",
              "\"other\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Defines whose repos to fetch</p> "
          }
        ]
      }
    },
    "group": "Tools",
    "description": "<p>Fetch tools and scripts grouped by repo</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "list",
            "description": "<p>List of tools and scripts grouped by repo</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"list\": {tools: [tools], scripts: [scripts]}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/apps.js",
    "groupTitle": "Tools"
  },
  {
    "name": "ValidateWorkflow",
    "type": "POST",
    "url": "/api/validate",
    "title": "Validate tool json",
    "group": "Tools",
    "description": "<p>Validate tool json</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "json",
            "description": "<p>Successfully passed validation</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   {json}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/apps.js",
    "groupTitle": "Tools",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "message",
            "description": "<p>Invalid tool</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidToolError:",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Invalid tool\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GenerateUserToken",
    "type": "PUT",
    "url": "/api/user/token",
    "title": "Generate token for the user",
    "group": "Users",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
    "description": "<p>Generate token for the user</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>User&#39;s token</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"token\": \"{token}\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/user.js",
    "groupTitle": "Users"
  },
  {
    "name": "GetUser",
    "type": "GET",
    "url": "/api/user",
    "title": "Get user details",
    "group": "Users",
    "description": "<p>Fetch user details</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>User details</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"user\": \"{user}\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/user.js",
    "groupTitle": "Users"
  },
  {
    "name": "GetUserToken",
    "type": "GET",
    "url": "/api/user/token",
    "title": "Get user's token",
    "group": "Users",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
    "description": "<p>Fetch user&#39;s token</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>User&#39;s token</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"token\": \"{token}\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/user.js",
    "groupTitle": "Users"
  },
  {
    "name": "RevokeUserToken",
    "type": "DELETE",
    "url": "/api/user/token",
    "title": "Revoke user's token",
    "group": "Users",
    "permission": [
      {
        "name": "Logged in user"
      }
    ],
    "description": "<p>Revoke user&#39;s token</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>User&#39;s token</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"token\": \"{token}\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/user.js",
    "groupTitle": "Users"
  },
  {
    "name": "SubscribeUser",
    "type": "POST",
    "url": "/api/subscribe",
    "title": "Subscribe to the Rabix list",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the subscriber</p> "
          }
        ]
      }
    },
    "group": "Users",
    "description": "<p>Subscribe to the Rabix list</p> ",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/user.js",
    "groupTitle": "Users"
  },
  {
    "name": "CreateWorkflow",
    "type": "POST",
    "url": "/api/workflows",
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
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Workflow successfully added\",\n   \"id\": \"547854cbf76a100000ac84dd\"\n}",
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
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Name already in use\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "DeleteWorkflow",
    "type": "DELETE",
    "url": "/api/workflows/:id",
    "title": "Delete workflow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the workflow revision</p> "
          }
        ]
      }
    },
    "group": "Workflows",
    "description": "<p>Delete workflow</p> ",
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
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Workflow successfully deleted\"\n}",
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
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "DeleteWorkflowRevision",
    "type": "DELETE",
    "url": "/api/workflow-revisions/:revision",
    "title": "Delete workflow revision",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "revision",
            "description": "<p>ID of the workflow revision</p> "
          }
        ]
      }
    },
    "group": "Workflows",
    "description": "<p>Delete workflow revision</p> ",
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
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Workflow revision successfully deleted\"\n}",
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
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "ForkWorkflow",
    "type": "POST",
    "url": "/api/workflows/fork",
    "title": "Fork workflow",
    "group": "Workflows",
    "description": "<p>Fork workflow</p> ",
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
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Workflow successfully added\",\n   \"id\": \"547854cbf76a100000ac84dd\"\n}",
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
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"message\": \"Name already in use\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "FormatAndUploadWorkflow",
    "type": "POST",
    "url": "/api/workflow/format/upload",
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
            "description": "<p>Url to formatted workflow on amazon s3</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"url\" : \"https://s3.amazonaws.com/rabix/users/ntijanic/pipelines/bwa/bwa_417435973012.json\"\n}",
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
    "type": "POST",
    "url": "/api/workflow/format",
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
            "description": "<p>Formatted workflow</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"json\": {Workflow}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
    "groupTitle": "Workflows"
  },
  {
    "name": "GetPublicWorkflowRevision",
    "type": "GET",
    "url": "/workflows/:revision",
    "title": "Get public workflow revision by id",
    "group": "Workflows",
    "description": "<p>Get public workflow revision by id</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "revision",
            "description": "<p>Id of the workflow revision</p> "
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
            "field": "json",
            "description": "<p>Json of the workflow</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{json}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/public.js",
    "groupTitle": "Workflows",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Message",
            "description": "<p>Invalid id</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidAppError:",
          "content": "HTTP/1.1 404\n{\n  \"message\": \"There is no app with such id\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetWorkflow",
    "type": "GET",
    "url": "/api/workflows/:id",
    "title": "Get workflow by id",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the workflow revision</p> "
          }
        ]
      }
    },
    "group": "Workflows",
    "description": "<p>Get workflow by id</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Workflow</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"data\": {workflow}\n}",
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
    "url": "/api/workflow-revisions/:id",
    "title": "Get workflow revision by id",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the workflow revision</p> "
          }
        ]
      }
    },
    "group": "Workflows",
    "description": "<p>Get workflow revision by id</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Workflow revision</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"data\": {workflow-revision}\n}",
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
            "field": "Message",
            "description": "<p>Unauthorized access</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "UnauthorizedError:",
          "content": "HTTP/1.1 401\n{\n  \"message\": \"Unauthorized\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "GetWorkflowsGroupedByRepo",
    "type": "GET",
    "url": "/api/workflow/repositories/:type",
    "title": "Get grouped workflows",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"my\"",
              "\"other\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Defines whose repos to fetch</p> "
          }
        ]
      }
    },
    "group": "Workflows",
    "description": "<p>Fetch workflows grouped by repo</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "list",
            "description": "<p>List of workflows grouped by repo</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"list\": [{workflows}]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "app/controllers/pipeline.js",
    "groupTitle": "Workflows"
  },
  {
    "name": "UpdateWorkflow",
    "type": "PUT",
    "url": "/api/workflows/:id",
    "title": "Update workflow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>ID of the workflow revision</p> "
          }
        ]
      }
    },
    "group": "Workflows",
    "description": "<p>Update workflow</p> ",
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
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully created new workflow revision\",\n   \"id\": \"547854cbf76a100000ac84dd\"\n}",
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
            "field": "Message",
            "description": "<p>Invalid workflow id</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidIDError:",
          "content": "HTTP/1.1 404\n{\n  \"message\": \"There is no pipeline with id: 547854cbf76a100000ac84dd\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "name": "ValidateWorkflow",
    "type": "POST",
    "url": "/api/workflow/validate",
    "title": "Validate workflow json",
    "group": "Workflows",
    "description": "<p>Validate workflow revision</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "json",
            "description": "<p>Successfully passed validation</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"json\": {workflow}\n}",
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
            "field": "Message",
            "description": "<p>Ivalid workflow</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "InvalidWorkflowError:",
          "content": "HTTP/1.1 400\n{\n  \"message\": \"Invalid workflow\"\n}",
          "type": "json"
        }
      ]
    }
  }
] });